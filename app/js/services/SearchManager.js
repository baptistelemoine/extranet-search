'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', '_', function ($http, ConfigManager, $rootScope, _){
	
	return {
		
		items:[],
		rubs:[],
		years:[],
		suggests:[],
		searchUrl:ConfigManager.searchUrl,
		suggestUrl:ConfigManager.suggestUrl,
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
			
			$http.get(this.searchUrl, {params:{q:term, from:this.currentPage*this.perPage, fields:this.fields, size:this.perPage, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					self.items.push(value.fields);
				});
				//rubs facet
				self.rubs = data.result.facets.items.terms;
				//years facet
				self.years = data.result.facets.years.entries;
				//total response
				self.total = data.result.hits.total;
				self.term = term;
				self.currentPage++;
				self.busy = false;
			});
		},

		last:function(){
			return (this.total <= this.items.length) && this.total > 0;
		},

		suggest:function(term){

			var self = this;
			$http.get(this.suggestUrl, {params:{q:term, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = _.first(data.result['title-suggest']).options;
				self.suggests = dataSource;				
			});
		}
	};
}]);