/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          appDir: 'www',
          baseUrl: 'js/lib',
          paths: {
            app: '../app',
            hbs: 'hbs/hbs',
            i18nprecompile: 'hbs/i18nprecompile',
            json2: 'hbs/json2',
            jquery: 'empty:',
            marionette: 'backbone.marionette',
            underscore: 'lodash'
           },
           hbs: {
            disableI18n: true
          },
          dir: 'www-built',
          modules: [{'name': 'app'}],
          pragmasOnSave: {
            //removes Handlebars.Parser code (used to compile template strings) set
            //it to `false` if you need to parse template strings even after build
            excludeHbsParser : true,
            // kills the entire plugin set once it's built.
            excludeHbs: true,
            // removes i18n precompiler, handlebars and json2
            excludeAfterBuild: true
          }
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