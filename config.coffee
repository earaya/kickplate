exports.config = 
# See http://brunch.readthedocs.org/en/latest/config.html for documentation.

	files:
		javascripts:
			joinTo:
				'js/app.js' : /^app/
				'js/vendor.js' : /^vendor/
				
		stylesheets:
			joinTo: 
				'css/app.css' : /^app/
				'css/vendor.css' : /^vendor/
			order:
				before: [
					'vendor/styles/bootstrap.min.css',
					'vendor/styles/bootstrap-responsive.min.css'
				]