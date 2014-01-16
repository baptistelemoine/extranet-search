'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', function ($scope, $location, SearchManager, ConfigManager){
	
	ConfigManager.fields = ['title,date,summary,origin','id'];
	$scope.config = ConfigManager;
	$scope.opt = ConfigManager.typos[0];

	$scope.search = SearchManager;
	$scope.search.nextPage($location.$$url, true, {'sort':'desc'});

}]);