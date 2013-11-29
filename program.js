#!/usr/bin/env node


var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var ExtranetFile = require('./ExtranetFile');
var SearchManager = require('./SearchManager');
var program = require('commander');
var clc = require('cli-color');
var BufferedReader = require('buffered-reader');
var DataReader = BufferedReader.DataReader;
var Q = require('q');
var _ = require('underscore');

var er = clc.red.bold;
var warn = clc.yellow;
var ok = clc.green;
var info = clc.blue;

mongoose.connect('mongodb://localhost/extranet_fnsea', function (err){
	if(err) console.log(er(err));
	else console.log(info('connected to mongo database OK'));
});

var schema = new mongoose.Schema({
	hidden:'boolean',
	title:'string',
	summary:'string',
	date:'date',
	origin:'string',
	content:'string',
	ispdf:'boolean'
});

var record = mongoose.model('articles', schema);

var dirPath = './data/administratif';

program
.version('0.0.1');

program
.command('export')
.description('export document to mongodb')
.action(function(){
	console.log(info('read date cache...'));
	parseDateCache().then(function (docs){
		console.log(info('add docs to mongo...'));
		processDB(docs);

	});
	
});

program
.command('index')
.description('index documents into elasticsearch')
.action(function(){
	console.log(info('launch documents indexing'));
	populateES();
});

program.parse(process.argv);


function parseDateCache(){

	var dfd = Q.defer();

	var docs = [];
	new DataReader('./data/DateCache.data', { encoding: "utf8" })
	.on('error', function (error){
		console.log(error);
	})
	.on('line', function (line){
		var p = line.toString().split('\t');
		if(p[2].split('\\')[5] === 'structures_territoires') {
			var oldPath = p[2].split('\\');
			var newPath = './data/' + _.rest(oldPath, 5).join('/');
			if(path.basename(newPath) !== 'default.aspx' && _.indexOf(path.basename(newPath).split('.'), 'lnk') === -1 && (path.extname(newPath) === '.pdf' || path.extname(newPath) === '.aspx')){
				docs.push(newPath);
			}
		}
	})
	.on('end', function (){
		dfd.resolve(docs);
	})
	.read();

	return dfd.promise;
}

var docsdocs = [];

function processDB(docs){
	//delete all records
	mongoose.connection.collections['articles'].drop(function (err, data) {
		if(err) console.log(warn('no collection or empty collection'));
	});

	/*var exports = [];
	docs.forEach(function (value, index){
		exportToMongo(value, docs.length);
	});
*/	// async.parallel(exports);
	// exportToMongo(docs[1], docs.length);
	docsdocs = docs;
	console.log(info(docsdocs.length, 'articles to export'));
	exportToMongo();
}

var errors = 0;
var count = 0;
var es = new SearchManager();
var result = [];

function exportToMongo(){
	
		var article = new ExtranetFile(docsdocs.shift());
		article.getArticle(function (err, item){
			if(err) {
				errors++;
				console.log(item.origin, er('ERROR'));
			}
			else{
				count++;
				console.log(item.origin, ok('Parsing OK'), info('remaining :', docsdocs.length));

				es.index(item, function (error, status){
					if(error) console.log(er('error when indexing this document'));
						else console.log(warn('document properly indexed'));
					if(!docsdocs.length){
						console.log(ok(count, 'success,', er(errors, 'failed')));
						process.exit();
					}
					else exportToMongo();
				});
			}

		});
}

function populateES(){
	var es = new SearchManager();
	record.find().exec(function (err, docs){
		es.index(docs);
	});
}




