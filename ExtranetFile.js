
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;

var ExtranetFile = function(folder, dirPath){
	//mettre l auteur
	this.folder = folder;
	this.dirPath = dirPath;
	this.isPdf = false;
	this._init();
};

ExtranetFile.prototype = {

	_init:function(){
		var currentFile = path.basename(this.folder,'.data');
		if(path.extname(currentFile) === '.pdf') this.isPdf = true;
	},

	getArticle:function(callback){

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
				if(!self.isPdf)
					self._cleanHTML(data, callback);
				else callback(null, data);
			}
		], function (err, result){
			if(err) console.log(err);
			if(!self.isPdf){
				self.content = result.content;
				self.links = result.links;
			}
			else self.content = result;
			callback(self);
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

		if(path.basename(this.folder) === 'default.aspx.data') return;
		var p = this.dirPath.concat('/', this.folder.concat('/__meta.data'));
		var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
		
		fs.readFile(p, function (err, data){
			if(err) console.log(err);
			parser.parseString(data, function (err, result) {
				if(err) console.log(err);
				_.map(result, function (value){

					self.hidden = (value.hidden !== '' ? value.hidden : 'false');
					self.title = value.title;
					self.summary = value.summary;
					self.date = value.date;
					self.origin = self.dirPath.concat('/', self.folder);
				});
				callback();
			});
		});
	},

	//parse html from aspx file, by passing the corresponding data folder
	_parseContent:function(file, callback){

		var p = file.substring(0, file.length - 5);

		if(!this.isPdf) return fs.readFile(p, 'binary', callback);
		else if(this.isPdf) return fs.readFile(p, 'base64', callback);
	}
	
};

module.exports = ExtranetFile;
