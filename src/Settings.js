
var fs = require('fs');
var xml2js = require('xml2js');
var Q = require('q');
var _ = require('underscore');
var ElasticSearchClient = require('elasticsearchclient');
var url = require('url');
var querystring = require('querystring');
var SearchManager = require('./SearchManager');


var Settings = function(){

	this.indice = 'fnsea';
	this.type = 'config';
	this.host = 'localhost';

	this._init();
};

Settings.prototype = {

	_init:function(){

		var serverOptions = {
			host: this.host,
			port: 9200,
			secure: false
		};

		this._es = new ElasticSearchClient(serverOptions);
	},

	getMenu:function(request, response){

		var self = this;
		var query = url.parse(request.url,true).query;
		
		if(query.update) {
			this._cleanIndex()
			.then(function(){
				return self._index();
			})
			.done(function (data){
				setTimeout(function(){
					self._search(request, response);
				}, 1000);
			});
		}

		/*Q.spread([this._search(), this._countPerItem()], function (result, facets){
			_.map(facets.origin.terms, function (value){
				self._setItemCountProperty(result, value);
			});
			return result;
		})*/
		this._index()
		.then(function (data){
			response.type('application/json; charset=utf-8');
			response.send(data);
		});

		/*this._countPerItem()
		.then(function (data){
			response.type('application/json; charset=utf-8');
			response.send(data);
		});*/
	},

	_setItemCountProperty:function(item, obj){
		
		for(var key in item) {
			var elem = item[key];
			if(key === "hyperLink" || key === "url") {
				if(elem === obj.term) item["count"] = obj.count;
			}
			if(typeof elem === "object") {
				this._setItemCountProperty(elem, obj);
			}
		}
	},

	_countPerItem:function(){
		
		var common = {
			'fields':'',
			'size':0
		};

		var qry = {
			'query':{'match_all':{}},
			'facets':{
				'origin':{
					'terms':{
						'field':'origin',
						'size':10000,
						'lang':'js',
						'script':"term.substring(24, term.lastIndexOf('/'))"
					}
				}
			}
		};

		var q = Q.defer();

		this._es.search(this.indice, 'articles', _.extend(common,qry))
		.on('data', function (data) {
			q.resolve(JSON.parse(data).facets);
		})
		.on('error', function (error) {
			q.reject(error);
		})
		.exec();

		return q.promise;
	},

	_cleanIndex:function(){

		var self = this;
		var q = Q.defer();

		this._es.deleteByQuery(self.indice, self.type, {'match_all':{}})
		.on('data', function (data){
			q.resolve();
		})
		.on('error', function (err){
			q.reject();
		})
		.exec();

		return q.promise;

	},

	_index:function(request, response){

		var self = this;

		return this._parseRootFile()
		.then(function (result){
			return self._parseAll(result, self._fileParser);
		})
		.then(function (result){
			return self._parseAll(result, self._xmlParser);
		})
		.then(function (result){

			self._iterate(result);
			// return result;
			var search = new SearchManager();
			return search.bulk(result, self.indice, self.type);

		});
	},

	_search:function(){

		var qry = {
			'query':{'match_all':{}}
		};

		var q = Q.defer();

		this._es.search(this.indice, this.type, qry)
		.on('data', function (data) {
			var d = JSON.parse(data).hits.hits;
			q.resolve(_.pluck(d, '_source'));
		})
		.on('error', function (error) {
			q.reject(error);
		})
		.exec();

		return q.promise;
	},

	//open and parse main root file
	_parseRootFile:function(){

		var self = this;

		return this._fileParser('./data/_data/menu_config/root.xml')
		.then(function (result){
			return self._xmlParser(result);
		})
		.then(function (data){
			return _.map(data.root.menuItem, function (value){
				return {
					'name':value.name,
					'fileName':'./data/_data/menu_config/rub_'.concat(value.lowName, '.xml'),
					'url':value.hyperLink,
					'color':value.squareColor
				};
			});
		});
	},
	//open and extract xml content file, obj needed when Q.all
	_fileParser:function(fileName, obj){

		return Q.nfcall(fs.readFile, fileName || obj.fileName)
		.then(function (data){
			data = data.toString().replace("\ufeff", "");
			if(obj) {
				_.extend(obj, {'menuItem':data});
				return obj;
			}
			return data;
		})
		.fail(function (error){
			console.log(error);
		});
	},
	//parse and transform xml to json
	_xmlParser:function(data, obj){

		var q = Q.defer();
		var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
		parser.parseString(data || obj.menuItem, function (err, result){
			if(err) q.reject(err);
			if(obj){
				_.extend(obj, result.root);
				q.resolve(obj);
			}
			else q.resolve(result);
		});
		return q.promise;
	},
	//open or parse multiple files at the same time
	_parseAll:function(data, fn){

		var arr = [];
		_(data).map(function (value){
			arr.push(fn(null, value));
		});
		return Q.all(arr);
	},
	//when only one menuItem, cast it into array, angular need
	_iterate:function(obj){
		
		for(var key in obj) {
			var elem = obj[key];
			if(key === "menuItem") {
				if(!_.isArray(elem)){
					obj[key] = [elem];
				}
			}
			if(typeof elem === "object") {
				this._iterate(elem);
			}
		}
	}
};

module.exports = Settings;



