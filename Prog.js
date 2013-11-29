
var path = require('path');
var ExtranetFile = require('./ExtranetFile');
var SearchManager = require('./SearchManager');
var BufferedReader = require('buffered-reader');
var DataReader = BufferedReader.DataReader;
var _ = require('underscore');
var clc = require('cli-color');

var er = clc.red.bold;
var warn = clc.yellow;
var ok = clc.green;
var info = clc.blue;

var Prog = function(){
	this.totalfiles = 0;
	this.errors = 0;
	this.i = 0;
	this._init();
};

Prog.prototype = {

	_init:function(){
		
		var self = this;
		this.es = new SearchManager();
		this._parseDateCache(function (docs){
			self.docs = docs;
			self.totalfiles = docs.length;
			self._scanIndex(docs);
		});
	},

	_parseDateCache:function(callback){

		console.log(info('read date cache...'));
		
		var docs = [];
		new DataReader('./data/DateCache.data', { encoding: "utf8" })
		.on('error', function (error){
			console.log(error);
		})
		.on('line', function (line){
			var p = line.toString().split('\t');
			var rub = p[2].split('\\')[5];
			var rubs = ['communication', 'structures_territoires', 'administratif'];
			if( _.indexOf(rubs, rub) !== -1) {
				var oldPath = p[2].split('\\');
				var newPath = './data/' + _.rest(oldPath, 5).join('/');
				if(path.basename(newPath) !== 'default.aspx' && _.indexOf(path.basename(newPath).split('.'), 'lnk') === -1 && (path.extname(newPath) === '.pdf' || path.extname(newPath) === '.aspx')){
					docs.push(newPath);
				}
			}
		})
		.on('end', function(){
			callback(docs);
		})
		.read();
	},

	_scanIndex:function(){

		var self = this;
		var article = new ExtranetFile(self.docs.shift());
		article.getArticle(function (err, item){
			if(err) {
				self.errors++;
				console.log(item.origin, er('ERROR'));
			}
			else{
				self.i++;

				self.es.index(item, function (error, status){
					if(error) console.log(item.origin, ok('parsing OK'), er('document not indexed'), info('remaining :', self.totalfiles));
					else console.log(item.origin, ok('parsing OK'), warn('document indexed'), info('remaining :', self.totalfiles));
					if(!self.docs.length){
						console.log(ok(self.i, 'success,', er(self.errors, 'failed')));
						process.exit();
					}
					else self._scanIndex();
				});
			}

		});
	}
};

module.exports = Prog;

