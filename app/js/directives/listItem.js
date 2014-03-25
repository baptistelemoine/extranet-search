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
			tags:'=',
			sp:'=',
			add:'&onAdd',
			onTypoSelect:'&',
			onPortailSelect:'&',
			onSousportailSelect:'&',
			onTagSelect:'&'
		},
		controller:function($scope){

			$scope.onTypoChange = function (typo){
				$scope.onTypoSelect({'typo':typo});
			};

			$scope.onPortailChange = function (portail){
				$scope.onPortailSelect({'portail':portail});
			};

			$scope.onSousPortailChange = function (sousPortail){
				$scope.onSousportailSelect({'sp':sousPortail});
			};

			$scope.onTagChange = function (tags){
				$scope.onTagSelect({'tags':tags});
			};
		},
		link: function (scope, iElement, iAttrs) {

			scope.$watch('portail', function (n, o){
				var p = _.find(scope.portails, function (obj){
					return obj.val === n;
				});
				if (p) scope.sousPortails = p.sous_portail;
			});

			/*scope.$watch('art.export', function (n, o){
				if(n === null)
					scope.typo = null;
			});*/
		}
	};
}]);
