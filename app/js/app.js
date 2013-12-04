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
  'underscore'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl:'partials/home.html', controller:'HomeController'});
  $routeProvider.when('/search', {templateUrl: 'partials/searchResult.html', controller: 'SearchController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

app.services = angular.module('fnsea.services', []);
app.controllers = angular.module('fnsea.controllers', []);
app.directives = angular.module('fnsea.directives', []);
app.filters = angular.module('fnsea.filters', []);