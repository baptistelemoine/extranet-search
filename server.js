var express = require('express');
var app = module.exports = express();
var SearchManager = require('./src/SearchManager');
var path = require('path');

var es = new SearchManager();

app.get('/search', function (req, res){
	es.search(req, res);
});
app.get('/search/*:path', function (req, res){
	es.origin(req, res);
});
app.get('search/suggest', function (req, res){
	es.suggest(req, res);
});

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'app')));
});
app.listen(process.env.PORT || 3000);