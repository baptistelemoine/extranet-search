'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$route', function ($scope, SearchManager, $location, $route){

	$scope.fields = 'title,summary,origin,date';

	$scope.search = SearchManager;
	SearchManager.fields = $scope.fields;

	$scope.initSearch = function(){
		SearchManager.currentPage = 0;
		SearchManager.items = [];
		if($location.search().q){
			$scope.term = $location.search().q;
			SearchManager.nextPage($scope.term);
		}
	};

	$scope.initSearch();

	$scope.$on('$locationChangeSuccess', function (e){
		$scope.initSearch();
	});
}]);