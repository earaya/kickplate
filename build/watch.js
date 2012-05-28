var watch = require('nodewatch');
var requirejs = require('requirejs');

var requireJsConfig = {
    baseUrl:'../src/js',
    out:'../public/js/main.js',
    mainConfigFile:'../src/js/main.js',
    optimize:'uglify',
    modules:[
        { 'name':'main' }
    ],
    inlineText:true,
    paths:{
        jquery: 'empty:',
        marionette: 'lib/backbone.marionette'
    }
};

watch.add('../src/js', true).onChange(function(file, prev, curr, action) {
    console.log(file + "chaged. Recompiling JavaScript.")
    requirejs.optimize(requireJsConfig);
});
console.log("KickPlate is watching for JS changes. Press Ctrl-C to Stop.");