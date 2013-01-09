requirejs.config({
  appDir: '../',
  baseUrl: 'js',
  dir: '../../../build/www',
  hbs: {
    disableI18n: true
  },
  modules: [
    {
      'name': 'app.main',
    }
  ],
  paths: {
    backbone: 'vendor/backbone',
    handlebars: 'vendor/handlebars',
    hbs: 'vendor/hbs/hbs',
    i18nprecompile: 'vendor/hbs/i18nprecompile',
    json2: 'vendor/hbs/json2',
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    marionette: 'vendor/backbone.marionette',
    require: 'vendor/require',
    underscore: 'vendor/lodash'
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
requirejs(['app/app']);
