define(['marionette', 'hbs!tmpl/home'], function(Marionette, homeTmpl) {
    console.dir(homeTmpl);
    return Marionette.ItemView.extend({
        template: {
            type: 'handlebars',
            template: homeTmpl
        }
    });
});
