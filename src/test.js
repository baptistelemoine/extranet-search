
var fs = require('fs');
var xml2js = require('xml2js');
var Q = require('q');

var XMLData = Q.nfcall(fs.readFile, './data/menu_config/rub_formation.xml')
.then(function (data){
	return data.toString().replace("\ufeff", "");
})
.fail(function (error){
	console.log(error);
});

var xmlParser = XMLData.done(function (data){
	var parser = new xml2js.Parser({explicitArray:false, ignoreAttrs:true, normalize:true});
	parser.parseString(data, function (err, result) {
		if(err) console.log('parsing error : ' + err)
		console.log(JSON.stringify(result));
	});
});
