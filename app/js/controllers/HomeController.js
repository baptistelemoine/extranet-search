'use strict';

app.controllers.controller('HomeController', ['$scope', function ($scope){
	$scope.fields = 'title,date,origin';
	console.log('home init')
}]);