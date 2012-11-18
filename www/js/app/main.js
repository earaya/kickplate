define(function (require) {
  var $ = require('jquery');
  //var mainTemplate = require('hbs!app/main');

  $('body').append(mainTemplate({}));
});