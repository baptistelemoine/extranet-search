'use strict';

app.controllers.controller('MenuController', ['$scope', 'SearchManager', function ($scope, SearchManager){

	SearchManager.getMenu().then(function (data){
		$scope.menu = data;
	});
}]);