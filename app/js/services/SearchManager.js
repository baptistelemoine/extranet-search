'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', '_', '$location', function ($http, ConfigManager, $rootScope, _, $location){
	
	return {
		
		result:[],
		items:[],
		years:[],
		suggests:[],
		searchUrl:ConfigManager.searchUrl,
		suggestUrl:ConfigManager.suggestUrl,
		busy:false,
		newsearch:true,
		term:'',
		currentPage:0,
		perPage:10,
		pretty:true,
		fields:'',
		total:0,
		start:null,
		end:null,

		nextPage:function(url, reset){

			var self = this;

			if (this.busy || this.last()) return;
			this.busy = true;
			
			if(reset) self.reset();

			$http.get(url, {params:{fields:ConfigManager.fields.join(','), from:this.currentPage*this.perPage, size:this.perPage, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					self.result.push(value.fields);
				});

				if(self.term !== $location.url(url).search().q){
					//rubs facet
					self.items = data.result.facets.items.terms;
					_.each(self.items, function (rub){ rub.checked = true; });
					//years facet
					self.years = data.result.facets.years.entries;
				}
				self.term = $location.url(url).search().q;
				//total response
				self.total = data.result.hits.total;
				self.busy = false;
				self.currentPage++;
			});
		},

		last:function(){
			return (this.total <= this.result.length) && this.total > 0;
		},

		suggest:function(term){

			var self = this;
			$http.get(this.suggestUrl, {params:{q:term, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = _.first(data.result['title-suggest']).options;
				self.suggests = dataSource;
			});
		},

		reset:function(all){
			this.result = [];
			this.total = 0;
			this.currentPage = 0;

			if(all){
				this.items = this.years = [];
			}
		}
	};
}]);