define(['backbone'], function(Backbone) {
   return Backbone.Model.extend({
       defaults: {
           title: 'Hello World!'
       },
       sayHello: function () {
           alert("Hello again!");
       }
   });
});
