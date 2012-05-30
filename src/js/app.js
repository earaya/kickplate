define(['backbone', 'marionette', 'handlebars', 'text!AppLayout.handlebars'], function(Backbone, Marionette, Handlebars) {
    var App = new Marionette.Application();

    App.addRegions({
        mainRegion: '#main'
    });

    App.vent.on("layout:rendered", function(){
        Backbone.history.start();
    });

    App.bind("initialize:before", function(options) {
        Marionette.TemplateCache.loadTemplate = function(template, callback) {
            console.dir(template);
            var compiledTemplate = Handlebars.compile(template.template);
            callback.call(this, compiledTemplate);
        };

        Marionette.Renderer.renderTemplate = function (template, data) {
            return template(data);
        };
    });

    return App;
});