#KickPlate

Quickly get started on your new single-page JavaScript client.

##What is KickPlate?

Just a template so you can get to writing your app with as little effort as possible. KickPlate includes:

* [RequireJS](http://requirejs.org/) and the RequireJS optimizer for module loading and JavaScript building.
  *RequireJS is also used to load your templates (see below).   
* Twitter Bootstrap, FontAwesome, and Compass for all your styling needs.
* Hogan for simple, compiled, logic-less templates.
* [TODO: choose a JS MVC framework]

##How do I use KickPlate?

Just start writing AMD modules in the `src/js folder`. I'd encourage you to use a good MVC framework, but if you're writing
a simple application, just modules is probably enough. Your templates go in `src/js/templates`, and your sass files go in `src/sass`.

When you're done coding, just run `/build/build.sh` and then run `node express` to see the results of your hard work.

##Why did you choose the components above for KickPlate?

[TODO: write a little blurb on the libraries above]
