
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;
var pdfutils = require('pdfutils').pdfutils;

var ExtranetFile = function(file){
	//mettre l auteur
	this.file = file;
	this.ispdf = false;
	this.hidden = false;
	this.summary = '';
	this.date = new Date();
	this._init();
};

ExtranetFile.prototype = {

	_init:function(){
		if(path.extname(this.file) === '.pdf') this.ispdf = true;
	},

	getArticle:function(cb){

		var self = this;

		async.waterfall([
			function (callback){
				self._getMetaData(callback);
			},
			function (callback){
				if(self.origin)
					self._parseContent(self.origin, callback);
			},
			function (data, callback){
				if(!self.ispdf)
					self._cleanHTML(data, callback);
				else callback(null, data);
			}
		], function (err, result){
			// if(err) console.log(err);
			self.content = result.content || _.first(result);
			self.links = result.links;
			cb(err, self);
		});
	},

	_cleanHTML:function(data, callback){

		var obj = {};
		var iconv = new Iconv('utf-8', 'iso-8859-1');
		var iconv2 = new Iconv('iso-8859-1', 'utf-8');
		var content = iconv2.convert(iconv.convert(data)).toString('utf-8');

		var $ = cheerio.load(content);
		var html = $('printable').find('wysiweb').html();
		if(html) obj.content = html.replace(/\r\n?/g, '');

		var $$ = cheerio.load(obj.content);
		var links = [];
		_.each($$('a'), function (val, i){
			links.push(val.attribs.href);
		});
		obj.links = links;

		callback(null, obj);
	},

	//open the meta data folder, and populate the current object
	//exclude all default files
	_getMetaData:function(callback){

		var self = this;

		var p = this.file.concat('.data/__meta.data');
		var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
		
		fs.readFile(p, function (err, data){
			if(err) {
				self.origin = self.file;
				return callback();
			}
			parser.parseString(data, function (err, result) {
				if(err) console.log(err);
				_.map(result, function (value){
					self.hidden = (value.hidden !== '' ? value.hidden : 'false');
					self.title = value.title;
					self.summary = value.summary;
					self.date = new Date(value.date);
					self.origin = self.file;
				});
				callback();
			});
		});
	},

	//parse html from aspx file, by passing the corresponding data folder
	//or get content if file is pdf
	_parseContent:function(file, callback){

		var self = this;

		if(!this.ispdf) return fs.readFile(file, 'binary', callback);
		else if(this.ispdf) {
			pdfutils(file, function (err, doc) {
				var pages = [];
				for (var i = 0; i < doc.length; i++) {
					pages.push(self._parsePDF(doc[i]));
				}
				pages.push(self._parsePDF(doc[0]));
				async.parallel(pages, callback);
			});
		}
	},

	_parsePDF:function (doc){
		return function (callback){
			var output = '';
			doc.asText().on('data', function (data){
				output+=data;
			})
			.on('end', function(){
				callback(null, output);
			});
		};
	}
	
};

module.exports = ExtranetFile;
