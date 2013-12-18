'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', '_', function ($http, ConfigManager, $rootScope, _){
	
	return {
		
		result:[],
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
			
			$http.get(this.searchUrl, {params:{q:term, from:this.currentPage*this.perPage, fields:this.fields, size:this.perPage, items:this.items, pretty:this.pretty}, cache:true})
			.success(function (data){
				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					self.result.push(value.fields);
				});

				//is search a new search ?
				if(self.term === '' || self.term !== term){
					//rubs facet
					self.rubs = data.result.facets.items.terms;
					_.each(self.rubs, function (rub){ rub.checked = true; });
					//years facet
					self.years = data.result.facets.years.entries;
				}
				//total response
				self.total = data.result.hits.total;
				self.busy = false;
				self.term = term;
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

		reset:function(){
			this.result = this.items = this.rubs = this.years = [];
			this.currentPage = 0;
		}
	};
}]);