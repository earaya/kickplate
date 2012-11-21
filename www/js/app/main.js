define(function (require) {
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var MainView = require('app/MainView');

    // Note: as you add more configuration to your app,
    // you probably want to move the definition to its own file.
    var app = new Marionette.Application();
    app.addRegions({
        main: '#main'
    });

    app.on('initialize:before', function() {
        Marionette.TemplateCache.prototype.compileTemplate = function(template) {
            // Templates are compiled by the hbs plugin.
            return template;
        };
    });

    app.on('initialize:after', function() {
        //Backbone.history.start();
    });

    app.addInitializer(function() {
        app.main.show(new MainView());
    });

    app.start();
});