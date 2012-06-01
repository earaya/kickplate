define([
    'backbone',
    'marionette',
    'handlebars',
    'view/layout',
    'vent/app.vent',
    'controller/home.router'
], function(Backbone, Marionette, Handlebars, AppLayout, appvent, HomeRouter) {
    var app = new Marionette.Application();

    app.addRegions({
        mainRegion: 'body'
    });

    app.addInitializer(function() {
       app.mainRegion.appLayout = new AppLayout();
       app.mainRegion.show(app.mainRegion.appLayout);
    });

    app.addInitializer(function() {
        app.vent = appvent;
        appvent.bind('controller:view', function(view) {
            app.mainRegion.appLayout.appContainer.show(view);
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