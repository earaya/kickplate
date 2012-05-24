// require.js entry point.

require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
		hogan: '//cdnjs.cloudflare.com/ajax/libs/hogan.js/2.0.0/hogan.js',
		text: 'lib/text.min'
	}
});

require(['app'], function(App) {
	console.log(App.name + ' loaded');
	App.start();
});