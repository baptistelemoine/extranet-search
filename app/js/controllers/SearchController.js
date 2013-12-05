'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$route', function ($scope, SearchManager, $location, $route){

	$scope.fields = 'title,summary,origin,date';

	$scope.search = SearchManager;
	SearchManager.fields = $scope.fields;

	$scope.term = $location.search().q
	
	$scope.$on('$locationChangeSuccess', function (e){
		SearchManager.currentPage = 0;
		SearchManager.items = [];
		SearchManager.nextPage($scope.term);
	});

}]);