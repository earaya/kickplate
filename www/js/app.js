// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        hbs: 'hbs/hbs',
        i18nprecompile: 'hbs/i18nprecompile',
        json2: 'hbs/json2',
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        marionette: 'backbone.marionette',
        underscore: 'lodash'
    },
    hbs: {
        disableI18n: true
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
