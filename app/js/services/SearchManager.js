'use strict'

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', function ($http, ConfigManager, $rootScope){
	
	return {
		
		items:[],
		url:ConfigManager.searchUrl,
		busy:false,
		term:'',
		currentPage:1,
		perPage:10,
		reset:true,

		nextPage:function(term){

			var self = this;

			if (this.busy) return;
			this.busy = true;
			
			$http.get(this.url, {params:{q:term, page:this.currentPage, source:this.source, size:this.perPage}, cache:true})
			.success(function (data){				
				var dataSource = data.items ? data.items : data[self.source];
				angular.forEach(dataSource, function (value, key){
					self.items.push(value);
				});
				self.term = term;
				self.currentPage++;
				self.busy = false;
			});
		}
	};
}]);