
var ElasticSearchClient = require('elasticsearchclient');
var _ = require('underscore');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var Q = require('q');


var SearchManager = function(){
	
	this.indice = 'fnsea';
	this.type = 'articles';
	this.host = 'localhost';
	this.items = ['administratif','syndical','eco_dev_dur','reglementation','juridique_fiscal','structures_territoires','communication','formation','informatique','pol_gen','offres_emploi','commissions_sections'];
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

	bulk:function(docs, indice, type){

		var q = Q.defer();

		var commands = [];
		var self = this;

		_.each(docs, function (value){
			commands.push({'index':{
				'_index':indice || self.indice,
				'_type':type || self.type
			}});
			commands.push(value);
		});

		this._es.bulk(commands, {})
		.on('data', function (data) {
			q.resolve(data);
		})
		.on('error', function (error) {
			q.reject(error);
		}).exec();

		return q.promise;
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
							},
							"keyword_analyzer":{
								"type":"custom",
								"tokenizer":"keyword"
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
		//common fields
		var common = {
			'fields':query.fields ? query.fields.split(',') : null,
			'from':query.from,
			'size':query.size
		};
		
		//add year facets for all requests
		var facets = {
			'years':{
				'date_histogram':{
					'interval':'year',
					'field':'date'
				}
			}
		};
		if(q.facets) facets = _.extend({}, q.facets, facets);
		facets = {'facets':facets};

		//if date range, add it to query
		var range = {
			'range':{
				'date':{
				}
			}
		};
		if(query.start)	_.extend(range.range.date, {'from':parseInt(query.start, 10)});
		if(query.end) _.extend(range.range.date, {'to':parseInt(query.end, 10)});
		if(q.query.bool) q.query.bool.must.push(range);
		
		//if sorted value, query it
		var sort = {
			'sort':{}
		};
		if(query.sort) _.extend(sort.sort, {'date':query.sort});

		this._es.search(this.indice, this.type, _.extend(common,q,facets,sort))
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

		var exclusions = [];
		if(query.items){
			var rubs = _.difference(this.items, query.items.split(','));
			exclusions = _.map(rubs, function (value, i){
				return { 'field':{'item':value} };
			});
		}

		var dateRange = { 'range':{'date':{}} };
		if(query.start){
			dateRange = _.extend(dateRange.range.date, {'from':query.start});
		}

		var qryObj = {
			'query':{
				'bool':{
					'must':[
						{
							'query_string':{
								'query':query.q,
								'fields':['content','pdfcontent','title','summary'],
								'analyzer':'custom_search_analyzer'
							}
						}
					],
					'must_not':exclusions
				}
			},
			'facets':{
				'items':{
					'terms':{
						'field':'item'
					}
				}
			}
		};
		this._launchSearch(request, response, qryObj);
	},

	origin:function(request, response){

		var p = "http://extranet.fnsea.fr/sites/fnsea" + request.params.toString();
		var qryObj = {
			'query':{
				'bool':{
					'must':[
						{
							'term' : {
								'origin' : {
									'value':p
								}
							}
						}
					]
				}
			}
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

	},

	update:function(request, response){
		
		var id = request.body.doc.id;

		this._es.update(this.indice, this.type, id, {'doc':request.body.doc})
		.on('data', function (data){
			response.send(id.toString().concat(' : successful update'));
		})
		.on('error', function (err){
			response.send(id.toString().concat(' : update failed'));
		})
		.exec();
	},

	getAllPaths:function(){

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
						'size':100000,
						'lang':'js',
						'script':"term.substring(24)"
					}
				}
			}
		};

		var q = Q.defer();

		this._es.search(this.indice, this.type, _.extend(common,qry))
		.on('data', function (data) {
			q.resolve(JSON.parse(data).facets);
		})
		.on('error', function (error) {
			q.reject(error);
		})
		.exec();

		return q.promise;
	}
};

module.exports = SearchManager;
