
var mongoose = require('mongoose');
var ElasticSearchClient = require('elasticsearchclient');
var _ = require('underscore');
var http = require('http');
var Q = require('q');


var SearchManager = function(){
	
	this.indice = 'fnsea';
	this.type = 'articles';
	this.host = 'localhost';
	this._init();
};

SearchManager.prototype = {

	_init:function(){

		var serverOptions = {
			host: this.host,
			port: 9200,
			secure: false
		};
		this._es = new ElasticSearchClient(serverOptions);
	},

	index:function(docs){

		var self = this;
		this._check().then(function (exists){
			if(!exists){
				self._createIndex();
			}
			// self._launchIndexing(docs);
		});
	},

	_launchIndexing:function(docs){

		var commands = [];
		var self = this;

		_.each(docs, function (value){
			commands.push({
				'_index':self.indice,
				'_type':self.type
			});
			commands.push(value);
		});

		this._es.bulk(commands, {})
		.on('data', function (data) {
			console.log('Indexing Completed!');
		})
		.on('error', function (error) {
			console.log(error);
		}).exec();
	},

	_createIndex:function(){

		this._es.createIndex(this.indice, {}, {})
		.on('data', function (data) {
			console.log('Index created!');
		})
		.on('error', function (error) {
			console.log(error);
		}).exec();
	},

	_check:function(){
		
		var options = {
			host: this.host,
			port: 9200,
			path: '/'+this.indice,
			method: 'GET'
		};

		var dfd = Q.defer();

		http.request(options, function (response){
			if(response.statusCode === 200) return dfd.resolve(true);
			return dfd.resolve(false);
		}).end();

		return dfd.promise;
	}
};

module.exports = SearchManager;
