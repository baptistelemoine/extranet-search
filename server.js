var express = require('express');
var app = module.exports = express();
var SearchManager = require('./src/SearchManager');
var path = require('path');
var menu = require('./src/Menu');

var es = new SearchManager();

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'app')));
});

app.get('/search', function (req, res){
	es.search(req, res);
});
app.get('/item*', function (req, res){
	es.origin(req, res);
});
app.get('/suggest', function (req, res){
	es.suggest(req, res);
});
app.get('/update/:id', function (req, res){
	es.update(req, res);
});
app.get('/settings', function (req, res){
	menu.getMenu(req, res);
});
app.listen(process.env.PORT || 3000);