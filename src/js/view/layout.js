define(['jquery', 'marionette', 'text!tmpl/layout.handlebars'], function($, Marionette, layoutTmpl) {
    return Marionette.Layout.extend({
        template: {
            type: 'handlebars',
            template: layoutTmpl
        },
        regions: {
            appNav: '#appNav',
            appContainer: '#appContainer'
        },
        events: {
            'click li': 'updateNav'
        },

        updateNav: function(e) {
            // Note: A better way to do this would be to get the current url and then activate the right tab. This only
            // highlights the tab if you clicked on it.
            $(e.currentTarget).siblings('li').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    });
});
