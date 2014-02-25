'use strict';

app.directives.directive('listItem', ['SearchManager', function (SearchManager) {
	return {
		require:'?ngModel',
		templateUrl: 'partials/list-item.html',
		restrict: 'AE',
		scope: {
			art:'=article',
			typos:'=typos',
			add:'&onAdd',
			onTypoSelect:'&'
		},
		controller:function($scope){

			$scope.onChange = function (typo){
				$scope.onTypoSelect({'typo':typo});
			};
		},
		link: function (scope, iElement, iAttrs) {

		}
	};
}]);