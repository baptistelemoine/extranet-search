'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$timeout', '_', '$rootScope', 'ConfigManager', function ($scope, SearchManager, $location, $timeout, _, $rootScope, ConfigManager){

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

	$rootScope.$watch('[startdate, enddate]', function (val){
		if(val && val[0])
			$location.search('start', new Date(val[0]).getTime());
		if(val && val[1])
			$location.search('end', new Date(val[1]).getTime());
	}, true);

	$scope.onSuggestClick = function(event, term){
		$location.search('q', term);
		SearchManager.suggests = [];
	};

	$scope.onDatePickerChange = function(){
		if($scope.datepicker.begindate)
			$rootScope.startdate = $scope.datepicker.begindate;
		else $location.search('start', null);

		if($scope.datepicker.enddate)
			$rootScope.enddate = $scope.datepicker.enddate;
		else $location.search('end', null);
	};
	
}]);