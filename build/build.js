({
    baseUrl:'../src/js',
    out:'../public/js/main.js',
    mainConfigFile:'../src/js/main.js',
    //optimize:'uglify',
    modules:[
        { 'name':'main' }
    ],
    inlineText:true,
    paths:{
        jquery: 'empty:',
        marionette: 'lib/backbone.marionette'
    }
})