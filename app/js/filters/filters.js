'use strict';

app.filters.filter('searchURL', [function (){
    return function (term, fields) {
        return '#/search?q='+term+'&fields='+fields;
    };
}]);

app.filters.filter('rubrique', [function (){
    return function (input) {
        return input.split('/')[5];
    };
}]);

app.filters.filter('suggest', [function (){
    return function (input, term) {
        return term + '<font color="#999">'+input.substring(term.length, input.length)+'</font>';
    };
}]);

app.filters.filter('getYear', [function (){
    return function (input) {
        return new Date(input).getFullYear();
    };
}]);