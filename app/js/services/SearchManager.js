'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', function ($http, ConfigManager, $rootScope){
	
	return {
		
		items:[],
		url:ConfigManager.searchUrl,
		busy:false,
		term:'',
		currentPage:0,
		perPage:10,
		pretty:true,

		nextPage:function(term){

			var self = this;

			if (this.busy) return;
			this.busy = true;
			
			$http.get(this.url, {params:{q:term, from:this.currentPage*this.perPage, fields:this.fields, size:this.perPage, pretty:this.pretty}, cache:true})
			.success(function (data){
				console.log(data);
				/*angular.forEach(dataSource, function (value, key){
					self.items.push(value);
				});*/
				self.term = term;
				self.currentPage++;
				self.busy = false;
			});
		}
	};
}]);