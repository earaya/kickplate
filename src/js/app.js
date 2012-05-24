define(['hogan', 'text!tmpl/index.js'], function(hogan, indexTmpl) {
	var app = {
		name: 'name',
		render: function() {
			var index = hogan.compile(indexTmpl);
			console.log(index.render(this));
		}
	};
	return app;
});