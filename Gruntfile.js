module.exports = function (grunt){
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch:{
			files : ['app/sass/**/*.scss'],
			tasks : ['sass']
		},
		sass:{
			dist:{
				files:{
					'app/css/style.css':'app/sass/style.scss'
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');

};