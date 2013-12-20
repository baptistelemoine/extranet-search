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

	if($location.search().start)
		// $scope.datepicker.begindate = moment(parseInt($location.search().start, 10)).format('DD/MM/YYYY');

	$scope.onSubmit = function(){
		$location.path('/search').search('q', $scope.term);
		SearchManager.suggests = [];
		$scope.initSearch(true);
	};

	$scope.onRubChange = function(){
		var items = _.where(SearchManager.items, {'checked':true});
		if(!items.length) $location.search('items', null);
		else $location.search('items',_.pluck(items, 'term').join(','));
	};

	$scope.$watch('term', function (val){
		if(val === ''){
			SearchManager.reset(true);
			$location.search('q', null);
			$location.search('items', null);
		}
	});

	$scope.onSuggestClick = function(event, term){
		$location.search('q', term);
		SearchManager.suggests = [];
	};

	$scope.onDatePickerChange = function(){
		if($scope.datepicker.begindate)
			$location.search('start', new Date($scope.datepicker.begindate).getTime());
		else $location.search('start', null);
		if($scope.datepicker.enddate)
			$location.search('end', new Date($scope.datepicker.enddate).getTime());
		else $location.search('end', null);
	};

	$scope.defaultStart = function(){
		$scope.datepicker = {
			begindate: new Date("2012-09-01T00:00:00.000Z")
		}
	}
	
}]);