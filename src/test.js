
var fs = require('fs');
var xml2js = require('xml2js');
var Q = require('q');
var _ = require('underscore');

var fileParser = function (fileName, obj){

	return Q.nfcall(fs.readFile, fileName)
	.then(function (data){
		data = data.toString().replace("\ufeff", "");
		if(obj) {
			obj['items'] = data;
			return obj;
		}
		return data;
	})
	.fail(function (error){
		console.log(error);
	});
};

var xmlParser = function (data, obj){
	var q = Q.defer();
	var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
	parser.parseString(data, function (err, result){
		if(err) q.resolve(err);
		if(obj){
			obj['items'] = result;
			q.resolve(obj);
		}
		else q.resolve(result);
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
	_(result).map(function (val){
		arr.push(fileParser(val.fileName, val));
	});
	return Q.all(arr);
})
.then(function (result){
	var arr = [];
	_(result).map(function (val){
		arr.push(xmlParser(val.items, val));
	});
	return Q.all(arr);
})
.then(function (data){
	return _(data).map(function (obj){
		obj.items = JSON.stringify(obj.items.root);
		return obj;
	});
})
.done(function (result){
	console.log(result.length)
})



