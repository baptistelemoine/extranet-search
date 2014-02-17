'use strict';

app.services.factory('BreadCrumb', ['$routeParams', function ($routeParams) {

	return {

		items:[],

		iterate:function(obj, item){

			for(var key in obj){
				var elem = obj[key];
				if(key === 'url' || key === 'hyperLink'){
					if(elem === item)
						this.items.push(obj);
				}
				if(typeof elem === "object") {
					this.iterate(elem, item);
				}
			}
		},
		
		parse:function(menu, path){
			
			this.items = [];
			var p = '/sites/fnsea/';
			var rubs = path.split('/');

			for (var i = rubs.length - 1; i >= 0; i--) {
				this.iterate(menu, p.concat(rubs.join('/')));
				rubs.pop();
			}
			this.items.reverse();
		}

	};
}])