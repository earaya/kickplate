/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    compass: {
      dev: {
        src: 'src/scss/',
        dest: 'src/www/css'
      }
    },
    requirejs: {
      compile: {
        options: {
          mainConfigFile: 'src/www/js/app.main.js',
          paths: {
            jquery: 'empty:'
          }
        }
      }
    },
    lint: {
      files: ['grunt.js', 'src/www/app/**/*.js', 'test/**/*.js']
    },
    test: {
      files: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'build'
    },
    jshint: grunt.file.readJSON('jshint.json')
  });

  // Third party tasks.
  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-volo');

  // Default task.
  grunt.registerTask('default', 'lint test');

  // Other tasks.
  grunt.registerTask('build', 'lint test requirejs');

};