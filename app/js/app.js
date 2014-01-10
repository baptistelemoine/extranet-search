'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('fnsea', [
  'ngRoute',
  'fnsea.filters',
  'fnsea.services',
  'fnsea.directives',
  'fnsea.controllers',
  'ngSanitize',
  'infinite-scroll',
  'underscore',
  '$strap.directives'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchController'});
  $routeProvider.when('/item/:path*', {templateUrl: 'partials/list.html', controller: 'ListController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

app.services = angular.module('fnsea.services', []);
app.controllers = angular.module('fnsea.controllers', []);
app.directives = angular.module('fnsea.directives', []);
app.filters = angular.module('fnsea.filters', []);