'use strict';

app.directives.directive('listItem', [function () {
	return {
		templateUrl: 'partials/list-item.html',
		restrict: 'AE',
		scope: {
			art:'=article',
			typos:'=',
			typo:'=',
			portail:'=',
			portails:'=',
			add:'&onAdd',
			onTypoSelect:'&',
			onPortailSelect:'&'
		},
		controller:function($scope){

			$scope.onTypoChange = function (typo){
				$scope.onTypoSelect({'typo':typo});
			};

			$scope.onPortailChange = function (portail){
				$scope.onPortailSelect({'portail':portail});
			};
		},
		link: function (scope, iElement, iAttrs) {

			scope.$watch('portail', function (n, o){
				if(n !== o){
					//populate here sous-portail select el
				}
			});

		}
	};
}]);