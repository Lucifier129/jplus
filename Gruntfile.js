module.exports = function(grunt) {
	//grunt 初始化配置
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['jplus.js']
		},
		concat: {
			files1: {
				src: ['src/wrap-start.js', 'src/arr.js', 'src/staticMethod.js', 'src/inherit.js', 'src/parseAttr.js', 'src/scan.js', 'src/refresh.js', 'src/observe.js', 'src/plus.js', 'src/wrap-end.js'],
				dest: 'dist/jplus-debug.js'
			},
			files2: {
				src: ['src/wrap-start.js', 'src/jprop/css3fix.js','src/jprop/swipe.js', 'src/jprop/swipeshow.js', 'src/wrap-end.js'],
				dest: 'dist/jprop-debug.js'
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
				},
				{
					src: 'dist/jprop-debug.js',
					dest: 'dist/jprop.js'
				}]
			}
		},
		watch: {
			files: ['<%= concat.files1.src %>', '<%= concat.files2.src %>'],
			tasks: ['concat', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat', 'uglify', 'watch']);
};