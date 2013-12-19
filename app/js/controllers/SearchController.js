'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$route', '_', '$rootScope', 'ConfigManager', function ($scope, SearchManager, $location, $route, _, $rootScope, ConfigManager){

	$scope.fields = 'title,summary,origin,date,item';

	$scope.search = SearchManager;
	SearchManager.fields = $scope.fields;

	$scope.initSearch = function(){

		if($location.search().q && $location.search().q !== $scope.term){
			SearchManager.reset();
			$scope.term = $location.search().q;
		}
		else {
			SearchManager.currentPage = 0;
			SearchManager.result = [];
			SearchManager.items = $location.search().items;
			SearchManager.start = $location.search().start;
			SearchManager.end = $location.search().end;
		}

		if($location.search().q) SearchManager.nextPage($scope.term);
	};

	$scope.initSearch();

	$scope.$on('$locationChangeSuccess', function (e){
		$scope.initSearch();
	});

	$scope.$watch('term', function (val){
		if(val === '')
			SearchManager.reset();
	});

	$scope.onSuggestClick = function(event, term){
		$scope.term = term;
		SearchManager.suggests = [];
	};

	$scope.onRubChange = function(){
		$rootScope.$$listeners.$locationChangeSuccess = [];
		var items = _.where(SearchManager.rubs, {'checked':true});
		if(items.length){
			$location.search('items',_.pluck(items, 'term').join(','));
		}
	};

	$scope.onSubmit = function(){
		SearchManager.suggests = [];
	};

	$scope.onDatePickerChange = function(){

		$rootScope.$$listeners.$locationChangeSuccess = [];
		if($scope.datepicker.begindate)
			$location.search('start', new Date($scope.datepicker.begindate).getTime());
		else $location.search('start', null);
		if($scope.datepicker.enddate)
			$location.search('end', new Date($scope.datepicker.enddate).getTime());
		else $location.search('end', null);
	};

}]);