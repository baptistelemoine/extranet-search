'use strict';

app.controllers.controller('SearchBoxController', ['$scope', 'SearchManager', '$location', function ($scope, SearchManager, $location){
	
	$scope.search = SearchManager;

	$scope.onSubmit = function(){
		$location.path('/search').search('q', $scope.term);
		SearchManager.suggests = [];
	};

	$scope.onSuggestClick = function(event, term){
		$location.path('/search').search('q', term);
		SearchManager.suggests = [];
	};

}]);