
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;
var PFParser = require("pdf2json/pdfparser");

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
				if(self.origin){
					if(!self.ispdf) fs.readFile(self.origin, 'binary', callback);
					// else self._parsePDF(self.origin, callback);
					else fs.readFile(self.origin, 'base64', callback);
				}
				else callback('err');
			},
			function (data, callback){
				if(!self.ispdf)
					self._cleanHTML(data, callback);
				else callback(null, data);
			}
		], function (err, result){
			if(err) console.log(err);
			if(result){
				if(!self.ispdf){
					self.content = result.content || result;
					self.links = result.links;
				}
				else {
					/*self.pdfcontent = {
						'_content_type' : 'application/pdf',
						'_name' : self.origin,
						'content' : result
					};*/
					self.pdfcontent = result;
				}
			}
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

	_parsePDF:function(file, callback){

		var parser = new PFParser();
		parser.on('pdfParser_dataReady', function (result){
			var pages = _.map(result.data.Pages, function (value){
				return _.map(value.Texts, function (val){
					return _.map(val.R, function (v){
						return v.T;
					});
				});
			});
			var output = '';
			_.each(pages, function (page){
				output += decodeURIComponent(_.flatten(page).join(' '));
			});
			callback(null, output);
		});
		parser.on('pdfParser_dataError', function (error){
			callback(error);
		});
		parser.loadPDF(file);
	}
};

module.exports = ExtranetFile;
