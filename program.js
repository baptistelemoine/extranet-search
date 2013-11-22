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
		//corrupt files
		//050704sma_frais.pdf
		//050920fpi_bon.pdf
		//060110sma_cheks.pdf
		//080624sma_fiches.pdf
		//

		/*var file = new ExtranetFile();
		file.ispdf = true;
		file._parseContent('./data/administratif/disp_administratives/050704sma_frais.pdf', function (err, data){
			if(err) console.log(err);
			console.log(data);
		})*/
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
		if(p[2].split('\\')[5] === 'administratif') {
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


function processDB(docs){
	//delete all records
	mongoose.connection.collections['articles'].drop(function (err) {
		if(err) console.log(warn('no collection or empty collection'));
	});

	docs.forEach(function (value, index){
		if(path.extname(value) === '.pdf') console.log(value)
		/*var errors = 0;
		var article = new ExtranetFile(value);
		article.getArticle(function (err, item){
			if(err) {
				errors++;
				console.log(item.origin, error('ERROR'));
			}
			console.log(item.origin, ok('OK'));
			
			var rec = new record(item);
			rec.save(function (error){
				if(error) console.log(error);
			});
			if(index === docs.length-1){
				console.log(ok(docs.length, 'success,', er(errors, 'failed')));
				process.exit();
			}
		});*/
	});
}

function populateES(){
	var es = new SearchManager();
	var indexFromMongo = function(){
		record.find().exec(function (err, docs){
			search.index(docs);
		});
	};
}




