// require.js entry point.

require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        handlebars: 'lib/handlebars',
        marionette: 'lib/backbone.marionette',
        text: 'lib/text'
    }
});

require(['jquery', 'app'], function($, App) {
    $(App.start());
});