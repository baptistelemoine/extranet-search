'use strict';

app.controllers.controller('MenuController', ['$scope', 'SearchManager', '$rootScope', '$q', function ($scope, SearchManager, $rootScope, $q){

	var q = $q.defer();

	SearchManager.getMenu().then(function (data){
		$scope.menu = data;
		q.resolve(data);
	});

	$rootScope.menu = function(){
		return q.promise;
	}

}]);