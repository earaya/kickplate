define([
    'backbone',
    'marionette',
    'handlebars',
    'vent/app.vent',
    'controller/home.router'
], function(Backbone, Marionette, Handlebars, appvent, HomeRouter) {
    var app = new Marionette.Application();

    app.addRegions({
        mainRegion: '#main'
    });

    app.addInitializer(function() {
        app.vent = appvent;
        appvent.bind('controller:view', function(view) {
            app.mainRegion.show(view);
        });
    });

    // Instantiate all routers.
    app.addInitializer(function() {
        app.Routers = new Array();
        app.Routers.push(new HomeRouter());
        // This could be moved to run after all initializers trigger.
        Backbone.history.start();
    });

    // Change templating to Handlebars.
    app.bind("initialize:before", function(options) {
        Marionette.TemplateCache.get = function(template) {
            var retTemplate;
            retTemplate = Marionette.TemplateCache.templates[template.template];
            if(!retTemplate) {
                Marionette.TemplateCache.loadTemplate(template, function(compiledTemplate) {
                    retTemplate = compiledTemplate;
                    Marionette.TemplateCache.templates[template.template] = retTemplate;
                });
            }
            return retTemplate;
        };

        Marionette.TemplateCache.loadTemplate = function(template, callback) {
            var compiledTemplate = Handlebars.compile(template.template);
            callback.call(this, compiledTemplate);
        };
    });

    return app;
});