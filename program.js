#!/usr/bin/env node

var Prog = require('./Prog');
var program = require('commander');

program
.version('0.0.1');

program
.command('export')
.description('export document to mongodb')
.action(function(){
	var prog = new Prog();
});

program.parse(process.argv);

/*function parseDateCache(callback){

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
}

var docsdocs = [];

function processDB(docs){
	//delete all records
	mongoose.connection.collections['articles'].drop(function (err, data) {
		if(err) console.log(warn('no collection or empty collection'));
	});

	var exports = [];
	docs.forEach(function (value, index){
		exportToMongo(value, docs.length);
	});
	// async.parallel(exports);
	// exportToMongo(docs[1], docs.length);
	docsdocs = docs;
	console.log(info(docsdocs.length, 'articles to export'));
	exportToMongo();
}

var errors = 0;
var count = 0;
var es = new SearchManager();
var result = [];

function scanIndex(docs){
		
		var article = new ExtranetFile(docsdocs.shift());
		article.getArticle(function (err, item){
			if(err) {
				errors++;
				console.log(item.origin, er('ERROR'));
			}
			else{
				count++;

				es.index(item, function (error, status){
					if(error) console.log(item.origin, ok('parsing OK'), er('document not indexed'), info('remaining :', docsdocs.length));
						else console.log(item.origin, ok('parsing OK'), warn('document indexed'), info('remaining :', docsdocs.length));
					if(!docsdocs.length){
						console.log(ok(count, 'success,', er(errors, 'failed')));
						process.exit();
					}
					else scanIndex();
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

*/


