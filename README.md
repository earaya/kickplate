#KickPlate

Quickly get started on your new single-page JavaScript application.

##What is KickPlate?

KickPlate is some boilerplate code to get you writing JS apps the right way; KickPlate relies on:

* [RequireJS](http://requirejs.org/) and the RequireJS optimizer for module loading and JavaScript building.
  (RequireJS is also used to load your Hogan templates).
* [Backbone](http://documentcloud.github.com/backbone/) & [Backbone.Marionette](https://github.com/derickbailey/backbone.marionette/)
  to provide solid structure to your code.
* [Handlebars](http://handlebarsjs.com/) for simple, compiled, templates.
    *Note that the templates are also lazily loaded by RequireJS.
* [Bootstrap](http://twitter.github.com/bootstrap/), [FontAwesome](http://fortawesome.github.com/Font-Awesome/), 
  and [Compass](http://compass-style.org/) for all your styling needs.
* [jQuery](http://jquery.com/) for... well, you know what jQuery is used for.

##How do I use KickPlate?

1. Clone this repo and remove the `.git` folder, `.gitignore` and `README.md` files.
2. Start coding!
3. Now that you're done coding, compile everyting by running `/build/build.sh`. If you can't run shell scripts, I'd recommend
you take a deep look at what's wrong in your life and then get a Mac. :P
4. Now that your build is done, host the `public` folder using your preferred web server.
[ExpressJS](http://expressjs.com/) is provided for development purposes.
5. Profit!

###Some more guidelines:
[TODO: talk about why AMD rocks, when to use an MVC framework, templates, etc.]

##Why did you choose the components above for KickPlate?

[TODO: write a little blurb on the libraries above]
