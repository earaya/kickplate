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
            $(e.currentTarget).siblings('li').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    });
});
