define(['marionette', 'text!tmpl/home.handlebars'], function(Marionette, HomeTmpl) {
    var HomeView = Marionette.ItemView.extend({
        template: {
            type: 'handlebars',
            template: HomeTmpl
        }
    });
    return new HomeView();
});
