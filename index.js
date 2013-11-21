
var wrench = require('wrench');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var mongoose = require('mongoose');
var express = require('express');
var ExtranetFile = require('./ExtranetFile');
var SearchManager = require('./SearchManager');

var app = module.exports = express();

var es = new SearchManager();

app.get('/search', function (req, res){
	es.search(req, res);
});

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(__dirname));
});
app.listen(2312);

mongoose.connect('mongodb://localhost/extranet_fnsea', function (error){
	if(error) console.log(error);
	else console.log('connected to extranet database');
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

var dirPath = './data/editos2';

var indexFromMongo = function(){
	record.find().exec(function (err, docs){
		search.index(docs);
	});
}

//load dirs recursively, get all folder which terminates by .data
//get all meta data, and then, parse content by opening the aspx file
//and search for the wysiweb tag under printable one
/*wrench.readdirRecursive(dirPath, function (error, curFiles) {
    if(curFiles) {
		curFiles.forEach(function (value, index){
			fs.stat(dirPath.concat('/', value), function (error, file){
				if(error) console.log(error);
				if(file.isDirectory() && path.extname(value) === '.data'){
					
					var article = new ExtranetFile(value, dirPath);
					article.getArticle(function (item){
						var rec = new record(item);
						rec.save(function (error){
							if(error) console.log(error);
						});
					});
				}
			});
		});
    }
});
*/

