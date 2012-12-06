// For any third party dependencies, like jQuery, place them in the lib folder.

requirejs.config({
  //appDir: 'www',
  //baseUrl: 'js',
  dir: 'www-built',
  hbs: {
    disableI18n: true
  },
  map: {
    '*': {
      less: 'lib/require-less/less',
      css: 'lib/require-css/css'
    }
  },
  modules: [
    {
      'name': 'app',
      excludeShallow: ['require-css/css-builder', 'require-less/lessc']
    }
  ],
  paths: {
    backbone: 'lib/backbone',
    handlebars: 'lib/handlebars',
    hbs: 'lib/hbs/hbs',
    i18nprecompile: 'lib/hbs/i18nprecompile',
    json2: 'lib/hbs/json2',
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    less: 'lib/require-less/less',
    marionette: 'lib/backbone.marionette',
    require: 'lib/require',
    'require-css': 'lib/require-css',
    underscore: 'lib/lodash'
  },
  pragmasOnSave: {
    //removes Handlebars.Parser code (used to compile template strings) set
    //it to `false` if you need to parse template strings even after build
    excludeHbsParser : true,
    // kills the entire plugin set once it's built.
    excludeHbs: true,
    // removes i18n precompiler, handlebars and json2
    excludeAfterBuild: true
  }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
