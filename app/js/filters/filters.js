'use strict';

app.filters.filter('searchURL', [function (){
    return function (term) {
        return '#/search?q='+term;
    };
}]);

app.filters.filter('rubrique', [function (){
    return function (input) {
        return input.split('/')[5];
    };
}]);

app.filters.filter('suggest', [function (){
    return function (input, term) {
        if(term && input){
            return term + '<font color="#999">'+input.substring(term.length, input.length)+'</font>';
        }
    };
}]);

app.filters.filter('getYear', [function (){
    return function (input) {
        return new Date(input).getFullYear();
    };
}]);

app.filters.filter('itemFullName', ['ConfigManager', function (ConfigManager){
    return function (input) {
        return ConfigManager.getItemName(input);
    };
}]);

app.filters.filter('moment', [function (){
    return function (input) {
        moment.lang('fr');
        return moment(input).fromNow();
    };
}]);

app.filters.filter('dateformat', [function (){
    return function (input) {
        if(input) return moment(parseInt(input, 10)).format('DD/MM/YYYY');
        return '';
    };
}]);

