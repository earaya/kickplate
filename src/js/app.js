define(['marionette', 'handlebars', 'view/home'], function(Marionette, Handlebars, HomeView) {
    var App = new Marionette.Application();

    App.addRegions({
        appRegion: '#app'
    });

    App.addInitializer(function(options){
       App.appRegion.show(HomeView);
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