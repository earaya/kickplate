define([
    'backbone',
    'marionette',
    'handlebars',
    'vent/controller.vent',
    'controller/home.router'
], function(Backbone, Marionette, Handlebars, controllerVent, HomeRouter) {
    var app = new Marionette.Application();

    app.addRegions({
        mainRegion: '#main'
    });

    app.addInitializer(function() {
        controllerVent.bind('view', function(view) {
            app.mainRegion.show(view);
        });
    });

    // Instantiate all routers.
    app.addInitializer(function() {
        app.Routers = new Array();
        app.Routers.push(new HomeRouter());
        Backbone.history.start();
    });

    // Change templating to Handlebars.
    app.bind("initialize:before", function(options) {
        Marionette.TemplateCache.loadTemplate = function(template, callback) {
            var compiledTemplate = Handlebars.compile(template.template);
            callback.call(this, compiledTemplate);
        };

        Marionette.Renderer.renderTemplate = function (template, data) {
            return template(data);
        };
    });

    return app;
});