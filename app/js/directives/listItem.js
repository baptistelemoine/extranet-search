'use strict';

app.directives.directive('listItem', [function () {
	return {
		require:'?ngModel',
		templateUrl: 'partials/list-item.html',
		restrict: 'AE',
		scope: {
			art:'=article',
			typos:'=typos',
			add:'&onAdd'
		},
		controller:function($scope){
			$scope.onTypoSelect = function (typo){
				console.log(typo);
			};
		},
		link: function (scope, iElement, iAttrs) {

		}
	};
}]);