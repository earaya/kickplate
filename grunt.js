/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    compass: {
      dev: {
        src: 'src/scss/',
        dest: 'src/www/css',
      },
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
      files: ['grunt.js', 'src/www/**/*.js', 'test/**/*.js']
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
  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-volo');

  // Default task.
  grunt.registerTask('default', 'lint test');

  // Other tasks.
  grunt.registerTask('build', 'lint test requirejs');

};