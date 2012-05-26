// require.js entry point.

require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
        underscore: 'lib/underscore',
        backbone: 'lib/backbone',
        marionette: 'lib/backbone.marionette',
		//handlebars: 'lib/handlebars', //'//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0.beta6/handlebars.min',
        //i18nprecompile: 'lib/i18nprecompile'
        //json2: 'lib/json2',
        //hbs: 'lib/hbs'
    },
    hbs: {
        templateExtension: 'handlebars',
        disableI18n: true
    }
});

require(['app'], function(App) {
    console.dir(App);

    App.start();
});