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
        return term + '<b>'+input.substring(term.length, input.length)+'</b>';
    };
}]);