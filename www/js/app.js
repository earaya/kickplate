// For any third party dependencies, like jQuery, place them in the lib folder.

requirejs.config({
  baseUrl: 'js/app',
  paths: {
    backbone: '../lib/backbone',
    handlebars: '../lib/handlebars',
    hbs: '../lib/hbs/hbs',
    i18nprecompile: '../lib/hbs/i18nprecompile',
    json2: '../lib/hbs/json2',
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    marionette: '../lib/backbone.marionette',
    require: '..lib/require',
    underscore: '../lib/lodash'
  },
  map: {
    '*': {
      less: '../lib/require-less/less',
      css: '../lib/require-css/css'
    }
  },
  hbs: {
    disableI18n: true
  }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['main']);
