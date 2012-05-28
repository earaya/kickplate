#!/usr/bin/env node

var argv = require('optimist').argv;
var command = argv._[0];
var environment = argv._[1] || 'dev';
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

if(environment === 'dev') {
    requireJsConfig.optimize = 'none';
}

var requirejs = require('requirejs');

if(command == 'watch') {
    var watch = require('nodewatch');
    watch.add('../src/js', true).onChange(function(file, prev, curr, action) {
        console.log(file + 'changed. Rebuilding JavaScript.');
        requirejs.optimize(requireJsConfig);
        console.log('\t' + requireJsConfig.out + ' built.');
    });
    console.log('KickPlate is watching for JS changes. Press Ctrl-C to Stop.');
} else if (command == 'build') {
    requirejs.optimize(requireJsConfig);
    console.log('\t' + requireJsConfig.out + ' built.');
} else {
    console.log('\t Usage: ./kickplate.js command [environment]');
}






