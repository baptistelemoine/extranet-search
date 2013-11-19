
var mongoose = require('mongoose');
var ElasticSearchClient = require('elasticsearchclient');
var _ = require('underscore');


var ESIndexing = function(){
	
	this.index = 'fnsea';
	this.type = 'articles';
	this._init();
};

ESIndexing.prototype = {

	_init:function(){

		var serverOptions = {
			host: 'localhost',
			port: 9200,
			secure: false
		};
		this._es = new ElasticSearchClient(serverOptions);
	},
	//need to create index first, look at
	//http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/indices-exists.html
	//to determine if index need to be created or not
	index:function(docs){
		
		var commands = [];
		var self = this;

		_.each(docs, function (value){
			commands.push({
				'_index':self.index,
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
	}
};

module.exports = ESIndexing;
