'use strict';

app.directives.directive('listItem', [function () {
	return {
		templateUrl: 'partials/list-item.html',
		restrict: 'AE',
		scope: {
			art:'=article',
			add:'&onAdd'
		},
		link: function (scope, iElement, iAttrs) {

		}
	};
}]);