module.exports = function(grunt) {
	//grunt 初始化配置
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['jplus.js']
		},
		concat: {
			files1: {
				src: ['src/intro.js', 'src/base.js', 'src/observe.js', 'src/scanView.js', 'src/refresh.js', 'src/api.js', 'src/outro.js'],
				dest: 'dist/jplus-debug.js'
			}
		},
		uglify: {
			options: {
				banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			min: {
				files: [{
					src: 'dist/jplus-debug.js',
					dest: 'dist/jplus.js'
				}]
			}
		},
		watch: {
			files: ['<%= concat.files1.src %>'],
			tasks: ['concat', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat', 'uglify', 'watch']);
};