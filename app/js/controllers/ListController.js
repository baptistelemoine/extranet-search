'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', '_', '$rootScope', '$q', '$routeParams', 'BreadCrumb', '$window', function ($scope, $location, SearchManager, ConfigManager, _, $rootScope, $q, $routeParams, BreadCrumb, $window){
	
	ConfigManager.fields = ['title,date,summary,origin','id','export','typo'];
	$scope.config = ConfigManager;
	$scope.typo = ConfigManager.typos[0];

	$scope.search = SearchManager;

	$scope.isNewRequest = true;

	$scope.breadcrumb = BreadCrumb;

	$scope.onTypoSelect = function(typo, article){
		$scope.save(_.extend(article, {'typo':typo}));
	};

	$scope.onAdd = function(article){
		$scope.save(_.extend(article, {'typo':$scope.typo.val, 'export':!article.export}));
	};

	$scope.save = function(article){
		//save logic here
		$scope.search.update(article);
	};

	$scope.nextPage = function(){
		$scope.search.nextPage($location.$$url, $scope.isNewRequest, {'sort':'desc'});
		$scope.isNewRequest = false;
	};

	$scope.$on('$locationChangeSuccess', function (e){
		$scope.isNewRequest = true;
		$scope.nextPage();
		BreadCrumb.parse($scope.datamenu, $routeParams.path);
	});

	$rootScope.menu().then(function (data){
		$scope.datamenu = data;
		BreadCrumb.parse(data, $routeParams.path);
	});

}]);


