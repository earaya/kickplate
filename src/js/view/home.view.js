define(['marionette', 'text!tmpl/home.handlebars'], function(Marionette, homeTmpl) {
    return Marionette.ItemView.extend({
        template: {
            type: 'handlebars',
            template: homeTmpl
        },
        triggers: {
            'click h1': 'h1:click'
        }
    });
});
