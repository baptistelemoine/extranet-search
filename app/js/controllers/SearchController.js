'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$route', '_', function ($scope, SearchManager, $location, $route, _){

	$scope.fields = 'title,summary,origin,date';

	$scope.search = SearchManager;
	SearchManager.fields = $scope.fields;

	$scope.initSearch = function(){
		SearchManager.currentPage = 0;
		SearchManager.items = [];
		SearchManager.rubs = [];
		SearchManager.years = [];
		SearchManager.suggests = [];
		
		if($location.search().q){
			$scope.term = $location.search().q;
			SearchManager.nextPage($scope.term);
		}
	};

	$scope.initSearch();

	$scope.$on('$locationChangeSuccess', function (e){
		$scope.initSearch();
	});

	$scope.onSuggestClick = function(event, term){
		$scope.term = term;
		SearchManager.suggests = [];
	};

	$scope.onRubChange = function(item){
		var items = _.where(SearchManager.rubs, {'checked':true});
		if(items.length)
			$location.search().items = _.pluck(items, 'term');
		console.log($location.search().items)
	}
}]);