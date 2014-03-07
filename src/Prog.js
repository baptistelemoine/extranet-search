
var path = require('path');
var ExtranetFile = require('./ExtranetFile');
var SearchManager = require('./SearchManager');
var BufferedReader = require('buffered-reader');
var DataReader = BufferedReader.DataReader;
var _ = require('underscore');
var clc = require('cli-color');
var Q = require('q');

var er = clc.red.bold;
var warn = clc.yellow;
var ok = clc.green;
var info = clc.blue;

var Prog = function(options){
	this.allPaths = [];
	this.totalfiles = 0;
	this.errors = 0;
	this.i = 0;
	this.reset = false;
	if(options && options.reset) this.reset = true;
	this._init();
};

Prog.prototype = {

	_init:function(){
		var self = this;
		this.es = new SearchManager();

		this.es.getAllPaths().then(function (result){
			return _.map(result.origin.terms, function (value, index){
				self.allPaths.push(value.term.substring(1));
			});
		})
		.done(function(){
			self._parseDateCache(function (docs){
				self.totalfiles = docs.length;
				if(docs.length) self._scanIndex(docs);
				else console.log('no docs to index');
			});
		});
	},

	_parseDateCache:function(callback){

		var self = this;

		console.log(info('read date cache...'));
		
		var docs = [];
		new DataReader('./data/DateCache.data', { encoding: "utf8" })
		.on('error', function (error){
			console.log(error);
		})
		.on('line', function (line){

			var p = line.toString().split('\t');
			var rub = p[2].split('\\')[5];
			
			var completePath = p[2].split('\\');//sites/fnsea/syndical/aff_synd/infos_generales/090916sga_space.aspx
			var comparedPath = completePath.slice(3).join('/');
			var exist = false;
			if(!self.reset) exist = _.indexOf(self.allPaths, comparedPath) !== -1;

			var rubs = ['administratif'];
			if( _.indexOf(rubs, rub) !== -1) {
				var newPath = p[2];
				if(!exist && path.basename(newPath) !== 'default.aspx' && _.indexOf(path.basename(newPath).split('.'), 'lnk') === -1 && (path.extname(newPath) === '.pdf' || path.extname(newPath) === '.aspx')){
					docs.push(newPath);
				}
			}
		})
		.on('end', function(){
			callback(docs);
		})
		.read();
	},

	_scanIndex:function(docs){

		var self = this;
		var article = new ExtranetFile(docs.shift());
		article.getArticle(function (err, item){
			if(err) {
				self.errors++;
				console.log(item.origin, er('ERROR'));
				self._scanIndex(docs);
			}
			else{
				self.i++;
				self.es.index(item, function (error, status){
					if(error) console.log(item.origin, ok('parsing OK,'), er('indexing ERROR,'), info('remaining :', docs.length));
					else console.log(item.origin, ok('parsing OK,'), warn('indexing OK,'), info('remaining :', docs.length));
					if(!docs.length){
						console.log(ok(self.i-self.errors, 'success,', er(self.errors, 'failed')));
						process.exit();
					}
					else self._scanIndex(docs);
				});
			}

		});
	}
};

module.exports = Prog;

