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
		fields:'',
		total:0,

		nextPage:function(term){

			var self = this;

			if (this.busy || this.last()) return;
			this.busy = true;
			
			$http.get(this.url, {params:{q:term, from:this.currentPage*this.perPage, fields:this.fields, size:this.perPage, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					self.items.push(value.fields);
				});
				self.total = data.result.hits.total;
				self.term = term;
				self.currentPage++;
				self.busy = false;
			});
		},

		last:function(){
			return (this.total <= this.items.length) && this.total > 0;
		}
	};
}]);