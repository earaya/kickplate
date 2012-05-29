#KickPlate

Quickly get started on your new single-page JavaScript application.

##What is KickPlate?

KickPlate is some boilerplate code to get you writing JS apps the right way. KickPlate relies on:

* [RequireJS](http://requirejs.org/) and its optimizer for module loading and building.
* [Backbone](http://documentcloud.github.com/backbone/) & [Backbone.Marionette](https://github.com/derickbailey/backbone.marionette/)
  to provide solid structure to your code.
* [Handlebars](http://handlebarsjs.com/) for simple, compiled, templates. *Note that the templates are inlined into the build
 output to avoid additional requests; they are then compiled and cached after their first use.
* [Bootstrap](http://twitter.github.com/bootstrap/), [FontAwesome](http://fortawesome.github.com/Font-Awesome/), 
  and [Compass](http://compass-style.org/) for all your styling needs.
* [jQuery](http://jquery.com/) for... well, you know what jQuery is used for.

##How do I use KickPlate?

0. You'll need to have node.js, npm, and compass installed before you start.
1. Clone this repo and remove the `.git` folder, `.gitignore` and `README.md` files. Then, in the main folder run `npm isntall`;
this will take care of installing any other dependencies.
2. Start coding! When you're developing, you'll probably want to run `kickplate watch` and `compass watch` so you don't have to manually rebuild every time you make
a change.
3. Now that you're done coding, compile everyting by running `kickplate build prod` and `compass compile -e production`. This will compile and optmize everything.
4. Now that your build is done, host the `public` folder using your preferred web server. Make sure you gzip, and cache everything for production deployments.
[ExpressJS](http://expressjs.com/) is provided for development purposes. To run the server, just run `server [port]` in the main folder; this will start an express instance on port 8000.
5. Profit!

##Why did you choose the components above for KickPlate?

I've tried to assemble libraries that are battle-tested and widely used; this way you know that you can rely on the tools
you are using and that you will have good community support in case you run into any trouble.

Having said that, however, all the stuff here is just my personal prefenrece based on my current understanding of best tools and practices.
It's likely that I'll change some of the libarries over time as the technologies change and as my preferences change. I've tried to make it
so that any of the components can be easily changed... if you have some other preferences, it should be pretty easy to exchange any of the components.

I think most of the value in KickPlate comes from the build process I've setup and from forcing you to use AMD. As long
as you're writing modules and using RequireJS you should see big gains from writing JavaScrip the "traditional" way.

Please take a lookt at RequireJS.org for an excellenet discussion on why you should use [web modules](http://requirejs.org/docs/why.html)
for web applications, and a look [this article](http://requirejs.org/docs/whyamd.html) as to why you should use AMD instead of CommonJS for web development.
