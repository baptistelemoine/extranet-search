'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$route', '_', '$rootScope', 'ConfigManager', function ($scope, SearchManager, $location, $route, _, $rootScope, ConfigManager){

	$scope.search = SearchManager;

	$scope.initSearch = function(reset){

		SearchManager.nextPage($location.$$url, reset);
		$scope.term = $location.search().q;
	};

	//direct access via url with search query
	if($location.search().q) $scope.initSearch(true);

	$scope.onSubmit = function(){
		$location.path('/search').search('q', $scope.term);
		SearchManager.suggests = [];
		$scope.initSearch(true);
	};

	$scope.onRubChange = function(){
		var items = _.where(SearchManager.items, {'checked':true});
		if(items.length === SearchManager.items.length)
			$location.search('items', null);
		else $location.search('items',_.pluck(items, 'term').join(','));
	};

	$scope.$watch('term', function (val){
		if(val === ''){
			SearchManager.reset(true);
			$location.search('q', null);
			$location.search('items', null);
		}
	});

	/*$scope.onSuggestClick = function(event, term){
		$scope.term = term;
		SearchManager.suggests = [];
	};

	$scope.onRubChange = function(){
		$rootScope.$$listeners.$locationChangeSuccess = [];
		var items = _.where(SearchManager.rubs, {'checked':true});
		if(items.length){
			console.log(_.pluck(items, 'term').join(','))
			$location.search('items',_.pluck(items, 'term').join(','));
		}
	};


	$scope.onDatePickerChange = function(){

		$rootScope.$$listeners.$locationChangeSuccess = [];
		if($scope.datepicker.begindate)
			$location.search('start', new Date($scope.datepicker.begindate).getTime());
		else $location.search('start', null);
		if($scope.datepicker.enddate)
			$location.search('end', new Date($scope.datepicker.enddate).getTime());
		else $location.search('end', null);
	};*/

}]);