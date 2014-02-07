'use strict';

app.controllers.controller('ListController', ['$scope', '$location', 'SearchManager', 'ConfigManager', '_', '$rootScope', '$q', '$routeParams', function ($scope, $location, SearchManager, ConfigManager, _, $rootScope, $q, $routeParams){
	
	ConfigManager.fields = ['title,date,summary,origin','id'];
	$scope.config = ConfigManager;
	$scope.typo = ConfigManager.typos[0];

	$scope.search = SearchManager;

	$scope.isNewRequest = true;

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
		$scope.breadcrumb();
	});

	$rootScope.menu().then(function (data){
		$scope.datamenu = data;
		$scope.breadcrumb();
	});

	$scope.iterate = function (obj, item){

		for(var key in obj){
			var elem = obj[key];
			if(key === 'url' || key === 'hyperLink'){
				if(elem === item)
					$scope.items.push(obj);
			}
			if(typeof elem === "object") {
				$scope.iterate(elem, item);
			}
		}
	};

	$scope.breadcrumb = function(){
		
		$scope.items = [];
		var p = '/sites/fnsea/';
		var rubs = $routeParams.path.split('/');

		for (var i = rubs.length - 1; i >= 0; i--) {
			$scope.iterate($scope.datamenu, p.concat(rubs.join('/')));
			rubs.pop();
		}
		$scope.items.reverse();

	};

}]);


