
var ElasticSearchClient = require('elasticsearchclient');
var _ = require('underscore');
var http = require('http');
var url = require('url');
var querystring = require('querystring');


var SearchManager = function(){
	
	this.indice = 'fnsea';
	this.type = 'articles';
	this.host = 'localhost';
	this._init();
};

SearchManager.prototype = {

	_init:function(){

		var self = this;

		var serverOptions = {
			host: this.host,
			port: 9200,
			secure: false
		};
		this._check(function (response){
			if(response !== 200){
				self._createIndex();
			}
		});
		this._es = new ElasticSearchClient(serverOptions);

	},

	index:function(doc, callback){

		this._es.index(this.indice, this.type, doc)
		.on('data', function (data){
			callback(null, 'ok');
		})
		.on('error', function (error){
			callback(error);
		})
		.exec();
	},

	bulk:function(docs){

		var commands = [];
		var self = this;

		_.each(docs, function (value){
			commands.push({'index':{
				'_index':self.indice,
				'_type':self.type
			}});
			commands.push(value);
		});

		this._es.bulk(commands, {})
		.on('data', function (data) {
			console.log(data, 'Indexing Completed!');
		})
		.on('error', function (error) {
			console.log(error);
		}).exec();
	},

	_createIndex:function(){
		//view default-mapping.json for mapping
		var settings = {
			"settings":{
				"index":{
					"analysis":{
						"analyzer":{
							"path_analyzer":{
								"type":"custom",
								"tokenizer":"path_tokenizer"
							},
							"custom_analyzer":{
								"type":"custom",
								"tokenizer":"nGram",
								"filter":['stopwords', 'asciifolding' ,'lowercase', 'snowball', 'elision', 'worddelimiter']
							},
							"custom_search_analyzer":{
								"type":"custom",
								"tokenizer":"standard",
								"filter":["stopwords", "asciifolding" ,"lowercase", "snowball", "elision", "worddelimiter"]
							}
						},
						"tokenizer":{
							"path_tokenizer":{
								"type":"path_hierarchy"
							},
							"nGram":{
								"type":"nGram",
								"min_gram":2,
								"max_gram":20
							}
						},
						"filter":{
							"snowball":{
								"type":"snowball",
								"language":"French"
							},
							"elision":{
								"type":"elision",
								"articles":["l", "m", "t", "qu", "n", "s", "j", "d"]
							},
							"stopwords":{
								"type":"stop",
								"stopwords":["_french_"],
								"ignore_case" : true
							},
							"worddelimiter":{
								"type":"word_delimiter"
							}
						}
					}
				}
			}
		};
		this._es.createIndex(this.indice, settings, {})
		.on('data', function (data) {
			console.log('Index created!');
		})
		.on('error', function (error) {
			console.log(error);
		}).exec();
	},

	_check:function(callback){

		var options = {
			host: this.host,
			port: 9200,
			path: '/'+this.indice,
			method: 'HEAD'
		};
		http.request(options, function (response){
			callback(response.statusCode);
		})
		.end();
	},

	_launchSearch:function(request, response, q){

		var query = url.parse(request.url,true).query;

		var common = {
			'fields':query.fields ? query.fields.split(',') : null,
			'from':query.from,
			'size':query.size
		};

		this._es.search(this.indice, this.type, _.extend(common,q))
		.on('data', function (data) {
			if(query.pretty === 'true') response.send({result:JSON.parse(data)});
			else {
				response.type('application/json; charset=utf-8');
				response.send(JSON.stringify({result:JSON.parse(data)}));
			}
		})
		.on('error', function (error) {
			response.send({result:error});
		})
		.exec();
	},

	search:function(request, response){

		var query = url.parse(request.url,true).query;
		var qryObj = {
			'query':{
				'query_string':{
					'query':query.q
				}
			}
		};
		this._launchSearch(request, response, qryObj);
	},

	origin:function(request, response){

		var p = "http://extranet.fnsea.fr/sites/fnsea" + url.parse(request.url,true).pathname.substring(7);
		var qryObj = {
			'query':{
				'term' : {
					'origin' : {
						'value':p
					}
				}
			},
			'sort':{
				'date':{'order':'desc'}
			},
		};
		this._launchSearch(request, response, qryObj);
	},

	suggest:function(request, response){

		var query = url.parse(request.url,true).query;

		var qryObj = {
			"title-suggest" : {
				"text" : query.q,
				"completion" : {
					"field" : "suggest"
				}
			}
		};

		this._es.suggest(this.indice, qryObj)
		.on('data', function (data){
			response.send({result:JSON.parse(data)});
		})
		.on('error', function (error) {
			response.send({result:error});
		})
		.exec();

	}
};

module.exports = SearchManager;
