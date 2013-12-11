
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;

var ExtranetFile = function(file){
	//mettre l auteur
	this.file = '';
	this.origin = file;
	this.ispdf = false;
	this.hidden = false;
	this.summary = '';
	this.author = '';
	this.date = new Date();
	this.suggest = {};
	this.rubrique = '';
	this._init();
};

ExtranetFile.prototype = {

	_init:function(){

		this.file = './data/' + _.rest(this.origin.split('\\'), 5).join('/');
		this.origin = 'http://extranet.fnsea.fr/' + _.rest(this.origin.split('\\'), 3).join('/');
		this.rubrique = this.origin.split('/').slice(5, 6).join('');

		if(path.extname(this.file) === '.pdf') this.ispdf = true;

	},

	getArticle:function(cb){

		var self = this;

		async.waterfall([
			function (callback){
				self._getMetaData(callback);
			},
			function (callback){
				if(!self.ispdf) fs.readFile(self.file, 'binary', callback);
					else fs.readFile(self.file, 'base64', callback);
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
					self.content = result.content || "";
					self.links = result.links;
				}
				else {
					self.pdfcontent = result;
				}
			}
			cb(err, _.pick(self, ['ispdf', 'hidden', 'title', 'summary', 'date', 'author', 'links', 'origin', 'rubrique', 'suggest', 'content','pdfcontent']));
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

	_getMetaData:function(callback){

		var self = this;

		var p = this.file.concat('.data/__meta.data');
		var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});

		fs.readFile(p, function (err, data){
			if(err) {
				return callback();
			}
			//amazing trick ! http://www.multiasking.com/blog/xml2js-sax-js-non-whitespace-before-first-tag/
			data = data.toString().replace("\ufeff", "");
			parser.parseString(data, function (err, result) {

				if(err) console.log(err);
				_.map(result, function (value){
					var d = [];
					var dt = value.date;
					//2 date format : 01/01/1970 or 19700101
					//so split '/' or reorder number d whit this french format : [day, month, year]
					if(dt) {
						if(dt.indexOf('/') !== -1) d = dt.split('/');
						else if(dt.length === 8) d = [dt.substring(6, 8), dt.substring(4, 6), dt.substring(0, 4)];
					}
					self.hidden = (value.hidden !== '' ? value.hidden : 'false') || self.hidden;
					self.title = value.title;
					self.summary = value.summary || self.summary;
					self.author = value.author || self.author;
					self.date = dt ? new Date(d[2], d[1]-1, d[0]) : new Date();
					self.suggest = {"input":value.title};
				});
				callback();
			});
		});
	}
};

module.exports = ExtranetFile;
