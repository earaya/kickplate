// require.js entry point.

require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
		text: 'lib/text'
    }
});

require(['app'], function(App) {
	console.dir(App);
});