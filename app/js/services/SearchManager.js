'use strict';

app.services.factory('SearchManager', [
	'$http', 'ConfigManager', '$rootScope', '_', '$location', '$q', function ($http, ConfigManager, $rootScope, _, $location, Q){
	
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

		nextPage:function(url, reset, options){

			var self = this;

			if (this.busy || this._last() && !reset) return;
			this.busy = true;
			
			if(reset) this._reset();

			var params = {
				fields:ConfigManager.fields.join(','),
				from:this.currentPage*this.perPage,
				size:this.perPage,
				pretty:this.pretty
			};

			if(options) _.extend(params, options);

			$http.get(url, {params:params}, {cache:true})
			.success(function (data){

				var dataSource = data.result.hits.hits;
				angular.forEach(dataSource, function (value, key){
					if(value.fields) self.result.push(_.extend(value.fields, {'id':value._id}));
					else self.result.push(_.extend(value._source, {'id':value._id}));
				});

				if(self.term !== $location.url(url).search().q || self.start !== $location.search().start || self.end !== $location.search().end){
					//rubs facet
					if(data.result.facets.items){
						self.items = data.result.facets.items.terms;
						_.each(self.items, function (rub){ rub.checked = true; });
					}
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

		_last:function(){
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

		_reset:function(all){
			this.result = [];
			this.total = 0;
			this.currentPage = 0;

			if(all){
				this.items = this.years = [];
			}
		},

		update:function(article){
			// console.log(article.export);
		},

		iterate:function(obj){
			for(var key in obj) {
				var elem = obj[key];
				if(key === "_source") {
					_.extend(obj, {'menuItem':elem});
					delete obj[key];
				}
				if(typeof elem === "object") {
					this.iterate(elem);
				}
			}
		},

		getMenu:function(){
			var q = Q.defer();
			var self= this;
			$http.get('settings').success(function (data){
				// q.resolve(self.iterate(data.result.hits.hits));
				self.iterate(data.result.hits.hits);
				q.resolve(data.result.hits.hits);
			});
			return q.promise;
		}

	};
}]);