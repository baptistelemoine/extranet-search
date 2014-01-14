'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', function ($scope, $location, SearchManager, ConfigManager){
	
	ConfigManager.fields = ['title,date,summary,origin','id'];

	$scope.search = SearchManager;
	$scope.search.nextPage($location.$$url, true, {'sort':'desc'});

	$scope.onAdd = function(article){
		console.log(article);
	}
}]);