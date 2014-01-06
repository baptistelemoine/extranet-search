'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', '_', '$location', function ($http, ConfigManager, $rootScope, _, $location){
	
	return {
		
		result:[],
		items:[],
		years:[],
		suggests:[],
		suggestUrl:ConfigManager.suggestUrl,
		busy:false,
		term:'',
		currentPage:0,
		perPage:10,
		pretty:true,
		fields:'',
		total:0,
		start:0,
		end:0,

		nextPage:function(url, reset){

			var self = this;

			if (this.busy || this.last() && !reset) return;
			this.busy = true;
			
			if(reset) this.reset();

			$http.get(url, {params:{fields:ConfigManager.fields.join(','), from:this.currentPage*this.perPage, size:this.perPage, pretty:this.pretty}, cache:true})
			.success(function (data){
				
				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					self.result.push(value.fields);
				});

				if(self.term !== $location.url(url).search().q || self.start !== $location.search().start || self.end !== $location.search().end){
					//rubs facet
					self.items = data.result.facets.items.terms;
					_.each(self.items, function (rub){ rub.checked = true; });
					//years facet
					self.years = data.result.facets.years.entries;
				}
				self.term = $location.url(url).search().q;
				self.start = $location.url(url).search().start;
				self.end = $location.url(url).search().end;
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