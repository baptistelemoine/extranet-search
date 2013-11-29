var express = require('express');
var app = module.exports = express();
var SearchManager = require('./SearchManager');

var es = new SearchManager();

app.get('/search', function (req, res){
	es.search(req, res);
});
app.get('/api/*:path', function (req, res){
	es.origin(req, res);
});

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(__dirname));
});
app.listen(2312);
