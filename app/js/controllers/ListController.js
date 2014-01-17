'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', '_', function ($scope, $location, SearchManager, ConfigManager, _){
	
	ConfigManager.fields = ['title,date,summary,origin','id'];
	$scope.config = ConfigManager;
	$scope.typo = ConfigManager.typos[0];

	$scope.search = SearchManager;
	$scope.search.nextPage($location.$$url, true, {'sort':'desc'});

	$scope.onTypoSelect = function(typo, article){
		$scope.save(_.extend(article, {'typo':typo.val}));
	};

	$scope.onAdd = function(article){
		$scope.save(_.extend(article, {'typo':$scope.typo.val, 'export':!article.export}));
	};

	$scope.save = function(article){
		//rest save logic here
		$scope.search.update(article);
	};

}]);