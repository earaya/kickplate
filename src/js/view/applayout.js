define(['marionette', 'text!tmpl/applayout.handlebars'], function(Marionette, AppLayoutTmpl) {
    return Marionette.Layout.extend({
        template: {
            type: 'handlebars',
            template: AppLayoutTmpl
        },
        regions: {
            nav: '#nav',
            app: '#app'
        }
    });
});
