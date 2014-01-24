
var fs = require('fs');
var xml2js = require('xml2js');
var Q = require('q');
var _ = require('underscore');

//open and extract xml content file, obj needed when Q.all
var fileParser = function (fileName, obj){

	return Q.nfcall(fs.readFile, fileName || obj.fileName)
	.then(function (data){
		data = data.toString().replace("\ufeff", "");
		if(obj) {
			// obj['menuItem'] = data;
			_.extend(obj, {'menuItem':data});
			return obj;
		}
		return data;
	})
	.fail(function (error){
		console.log(error);
	});
};

//parse and transform xml to json
var xmlParser = function (data, obj){

	var q = Q.defer();
	var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
	parser.parseString(data || obj.menuItem, function (err, result){
		if(err) q.reject(err);
		if(obj){
			_.extend(obj, result.root);
			q.resolve(obj);
		}
		else q.resolve(result);
	});
	return q.promise;
};

//open or parse multiple files at the same time
var parseAll = function (data, fn){
	var arr = [];
	_(data).map(function (value){
		arr.push(fn(null, value));
	});
	return Q.all(arr);
};

//open and parse main root file
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

function iterate(obj) {
    for(var key in obj) {
        var elem = obj[key];
        if(key === "menuItem") {
            if(!_.isArray(elem)){
				obj[key] = [elem];
            }
        }
        if(typeof elem === "object") {
            iterate(elem);
        }
    }
}


//public method, listen for request, and send all content
exports.getMenu = function (request, response){
	
	rootFile.then(function (result){
		return parseAll(result, fileParser);
	})
	.then(function (result){
		return parseAll(result, xmlParser);
	})
	.done(function (result){
		iterate(result);
		response.type('application/json; charset=utf-8');
		response.send(result);
	});
};


