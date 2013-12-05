'use strict';

app.filters.filter('searchURL', [function (){
    return function (term, fields) {
        return '#/search?q='+term+'&fields='+fields;
    };
}]);