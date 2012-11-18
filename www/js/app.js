// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        backbone: 'backbone',
        bootstrap: 'bootstrap',
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        underscore: 'lodash'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
