

var rail = {
	
	//on stocke toutes les valeurs dans un tableau
	all:[],
	//init : test toutes les multiplications possibles,
	//on stocke la valeur si ok pour palindrome
	//et retourne la plus grande valeur stockée dans le tableau
	init:function(unit){

		for(var i = 0; i < unit; i++){
			for (var j = 0; j < unit; j++) {
				if(this.test(i*j)){
					this.all.push(i*j);
				}
			}
		}
		return Math.max.apply(Math, this.all);
	},
	//is palindrome ?
	//on cast la multiplication en string dans un tableau,
	//que l'on inverse afin de vérifier si le string original
	//correspond bien au tableau inversé
	test:function(nb){
		var tab = nb.toString().split('');
		return tab.reverse().join('') === nb.toString();
	}
};

var largest_pal = rail.init(1000);
console.log(largest_pal);