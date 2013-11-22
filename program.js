#!/usr/bin/env node

var wrench = require('wrench');
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
		console.log(docs);
	});
});

program
.command('index')
.description('index documents into elasticsearch')
.action(function(){
	// console.log(info('launch documents indexing'));
	populateES();
});

program.parse(process.argv);

function parseDateCache(){

	var dfd = Q.defer();

	var docs = [];
	new DataReader('./data/DateCache.data', { encoding: "utf8" })
	.on ('error', function (error){
		console.log(error);
	})
	.on ('line', function (line){
		var p = line.toString().split('\t');
		if(p[2].split('\\')[5] === 'administratif') {
			var path = p[2].split('\\');
			docs.push('./data/' + _.rest(path, 5).join('/'));
		}
	})
	.on ('end', function (){
		dfd.resolve(docs);
	})
	.read();

	return dfd.promise;
}


function processDB(){
	//delete all records
	mongoose.connection.collections['articles'].drop(function (err) {
		if(err) console.log(warn('no collection or empty collection'));
	});

	//load dirs recursively, get all folder which terminates by .data
	//get all meta data, and then, parse content by opening the aspx file
	//and search for the wysiweb tag under printable one
	wrench.readdirRecursive(dirPath, function (error, curFiles) {
		if(curFiles) {
			var errors = 0;
			curFiles.forEach(function (value, index){
				fs.stat(dirPath.concat('/', value), function (error, file){
					if(error) console.log(error);
					if(file.isDirectory() && path.extname(value) === '.data'){
						
						var article = new ExtranetFile(value, dirPath);
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
							if(index === curFiles.length-1){
								console.log(ok(curFiles.length, 'success,', er(errors, 'failed')));
								process.exit();
							}
						});
					}
				});
			});
		}
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




