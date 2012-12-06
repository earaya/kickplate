define(function(require) {
    var Marionette = require('marionette');
    var tmpl = require('hbs!main-view-template');
    var styl = require('less!main-style');

    return Marionette.ItemView.extend({
        template: tmpl
    });
});