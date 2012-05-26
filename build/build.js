{
	baseUrl: '../src/js',
	out: '../public/js/main.js',
	mainConfigFile: '../src/js/main.js',
	optimize: 'uglify',
	modules: [{ 'name': 'main' }],
    inlineText: true,
    pragmasOnSave: {
        //removes Handlebars.Parser code (used to compile template strings) set
        //it to `false` if you need to parse template strings even after build
        excludeHbsParser : true,
        // kills the entire plugin set once it's built.
        excludeHbs: true,
        // removes i18n precompiler, handlebars and json2
        excludeAfterBuild: true
    },
	paths: {
		jquery: 'empty:',
        handlebars: 'lib/handlebars',
        i18nprecompile: 'lib/i18nprecompile',
        hbs: 'lib/hbs'
	}
}