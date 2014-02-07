'use strict';

app.controllers.controller('SearchController',[
	'$scope','SearchManager', '$location', '$timeout', '_', '$rootScope', 'ConfigManager', function ($scope, SearchManager, $location, $timeout, _, $rootScope, ConfigManager){

	$scope.search = SearchManager;
	$scope.sortItems = [{'val':'par pertinence', 'sort':null}, {'val':'par date asc', 'sort':'asc'}, {'val':'par date desc','sort':'desc'}];

	$scope.initSearch = function(reset){

		SearchManager.nextPage($location.$$url, reset);
		$scope.term = $location.search().q;
		if($location.search().start) $scope.startdate = $location.search().start;
		if($location.search().end) $scope.enddate = $location.search().end;
		if($location.search().sort) $scope.opt = _.findWhere($scope.sortItems, {'sort':$location.search().sort});
			else $scope.opt = $scope.sortItems[0];
	};

	//direct access via url with search query
	if($location.search().q) $scope.initSearch(true);

	$scope.onRubChange = function(){
		var items = _.where(SearchManager.items, {'checked':true});
		if(!items.length) $location.search('items', null);
		else $location.search('items',_.pluck(items, 'term').join(','));
	};

	$scope.onSort = function(opt){
		$location.search('sort', opt.sort);
	};

	$scope.$watch('term', function (val){
		if(val === ''){
			SearchManager.reset(true);
			$location.search('q', null);
			$location.search('items', null);
			$location.search('start', null);
			$location.search('end', null);
		}
	});
	
	$scope.onDateCancel = function (e){
		if($scope.startdate === null) $location.search('start', null);
		if($scope.enddate === null) $location.search('end', null);
	};

	$scope.onDatePickerChange = function(){
		if($scope.datepicker.begindate){
			$location.search('start', new Date($scope.datepicker.begindate).getTime());
		}
		if($scope.datepicker.enddate)
			$location.search('end', new Date($scope.datepicker.enddate).getTime());
	};
	
}]);