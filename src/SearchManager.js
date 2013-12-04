
var ElasticSearchClient = require('elasticsearchclient');
var _ = require('underscore');
var http = require('http');
var url = require('url');


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
		this._check(function (response){
			if(response.statusCode !== 200){
				self._createIndex();
			}
		});

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

		//view config/elasticsearch.yml for general config
		//or default-mapping.json for mapping
		this._es.createIndex(this.indice, {}, {})
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
		return http.request(options, callback);
	},

	search:function(request, response){

		var query = url.parse(request.url,true).query;

		var qryObj = {
			'query':{
				'query_string':{
					'query':query.q
				}
			},
			'fields':query.fields.split(','),
			'from':query.from,
			'size':query.size
		};

		this._es.search(this.indice, this.type, qryObj)
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

	origin:function(request, response){

		var rootPath = url.parse(request.url).pathname.substring(4);
		//return all docs that starts with rootpath equal to nice url
		var qryObj = {
			'query':{
				'match_phrase_prefix' : {
					'origin' : {
						'query':'.'+rootPath,
						'max_expansions': 1
					}
				}
			},
			'sort':{
				'date':{'order':'desc'}
			},
			'fields':query.fields.split(','),
			'from':request.query.from,
			'size':request.query.size
		};

		this._es.search(this.indice, this.type, qryObj)
		.on('data',
			function (data) {
			// res.send({result:JSON.parse(data)});
				if(request.query.pretty === 'true') {
					response.send({response:JSON.parse(data)});
				}
				else {
					response.type('application/json; charset=utf-8');
					response.send(JSON.stringify({result:JSON.parse(data)}));
				}

		}).on('error', function (error) {
			response.send({result:error});
		}).exec();

	}
};

module.exports = SearchManager;
