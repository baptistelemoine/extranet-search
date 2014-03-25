'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', '_', '$rootScope', '$q', '$routeParams', 'BreadCrumb', '$window', function ($scope, $location, SearchManager, ConfigManager, _, $rootScope, $q, $routeParams, BreadCrumb, $window){
	
	ConfigManager.fields = ['title,date,summary,origin','id','export','typo','portail','ss_portail','tags'];
	$scope.config = ConfigManager;
	// $scope.typo = ConfigManager.typos[0];

	$scope.search = SearchManager;
	$scope.isNewRequest = true;
	$scope.breadcrumb = BreadCrumb;

	$scope.typoSelected = function (typo, article){
		$scope.save(_.extend(article, {'typo':typo}));
	};

	$scope.onAdd = function(article){
		$scope.save(_.extend(article, {'export':!article.export}));
	};

	$scope.save = function(article){
		if(!article.export)
			// article.export = article.typo = article.portail = article.ss_portail = article.tags = null;
			article.export = null;
		$scope.search.update(article);
	};

	$scope.nextPage = function(){
		$scope.search.nextPage($location.$$url, $scope.isNewRequest, {'sort':'desc'});
		$scope.isNewRequest = false;
	};

	$scope.onPortailSelect = function (portail, art){
		$scope.save(_.extend(art, {'portail':portail}));
	};

	$scope.onSousPortailSelect = function (ss_portail, art){
		$scope.save(_.extend(art, {'ss_portail':ss_portail}));
	};

	$scope.onTag = function (tags, art){
		$scope.save(_.extend(art, {'tags':tags}));
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


