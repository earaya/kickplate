/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          "appDir": "www",
          "baseUrl": "js/lib",
          "paths": {
            "app": "../app",
            "backbone": "backbone",
            "bootstrap": "bootstrap",
            "jquery": "empty:",
             // Replace underscore with lodash in build.
            "underscore": "lodash"
          },
          "dir": "www-built",
          "modules": [{"name": "app"}]
        }
      }
    },
    lint: {
      files: ['grunt.js', 'www/js/app/*.js', 'test/**/*.js']
    },
    test: {
      files: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'build'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {
        define: true,
        require: true
      }
    }
  });

  // Third party tasks.
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task.
  grunt.registerTask('default', 'lint test');

  // Other tasks.
  grunt.registerTask('build', 'lint test requirejs');

};