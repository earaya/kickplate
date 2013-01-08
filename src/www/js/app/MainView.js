define(function(require) {
    var Marionette = require('marionette');
    var tmpl = require('hbs!./MainViewTemplate');

    /* Note: Replace this view with Layout to get regions. */
    return Marionette.ItemView.extend({
        template: tmpl,
        id: "app"
    });
});