
var fs = require('fs');
var xml2js = require('xml2js');
var Q = require('q');
var _ = require('underscore');

var fileParser = function (fileName){

	return Q.nfcall(fs.readFile, fileName)
	.then(function (data){
		return data.toString().replace("\ufeff", "");
	})
	.fail(function (error){
		console.log(error);
	});
};

var xmlParser = function (data){
	var q = Q.defer();
	var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
	parser.parseString(data, function (err, result){
		if(err) q.resolve(err);
		q.resolve(result);
	});
	return q.promise;
};

var rootFile = fileParser('./data/menu_config/root.xml')
.then(function (result){
	return xmlParser(result);
})
.then(function (data){
	return _.map(data.root.menuItem, function (value){
		return {
			'name':value.name,
			'fileName':'./data/menu_config/rub_'.concat(value.lowName, '.xml'),
			'url':value.hyperLink,
			'color':value.squareColor
		};
	});
});

rootFile.then(function (result){
	var arr = [];
	_(result).each(function (val){
		arr.push(fileParser(val.fileName));
	});
	return Q.all(arr);
})
.then(function (result){
	console.log(result);
});




