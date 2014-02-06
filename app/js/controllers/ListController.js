'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', '_', function ($scope, $location, SearchManager, ConfigManager, _){
	
	ConfigManager.fields = ['title,date,summary,origin','id'];
	$scope.config = ConfigManager;
	$scope.typo = ConfigManager.typos[0];

	$scope.search = SearchManager;

	$scope.isNewRequest = true;

	$scope.search.getItemFullName()
	.then(function (item){
		console.log(item);
	});


	$scope.onTypoSelect = function(typo, article){
		$scope.save(_.extend(article, {'typo':typo.val}));
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
	});

}]);