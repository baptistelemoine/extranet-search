'use strict';

app.directives.directive('listItem', ['_', function (_) {
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
					var ss_portails = _.find(scope.portails, function (obj){
						return obj.val === n;
					}).sous_portail;
				}
			});

		}
	};
}]);