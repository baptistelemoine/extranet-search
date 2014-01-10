'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', function ($scope, $location, SearchManager, ConfigManager){
	
	ConfigManager.fields = ['title,date,summary,origin'];

	$scope.search = SearchManager;
	$scope.search.nextPage($location.$$url, true, {'sort':'desc'});


}]);