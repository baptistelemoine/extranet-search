var express = require('express');

var app = module.exports = express();

app.get('/search', function (req, res){
	es.search(req, res);
});

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(__dirname));
});
app.listen(2312);
