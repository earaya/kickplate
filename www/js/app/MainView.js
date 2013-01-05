define(function(require) {
    var Marionette = require('marionette');
    var tmpl = require('hbs!./main-view-template');

    return Marionette.ItemView.extend({
        template: tmpl
    });
});