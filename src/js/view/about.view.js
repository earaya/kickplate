define(['marionette', 'text!tmpl/about.handlebars'], function(Marionette, aboutTmpl) {
   return Marionette.ItemView.extend({
       template: {
           type: 'handlebars',
           template: aboutTmpl
       }
   })
});
