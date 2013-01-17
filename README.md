# KickPlate

A volo/grunt boilerplate project to get you started writing awesome JS apps in the browser.

## What's included?

This project really wouldn't exist if it wasn't for these excellent products:

### Libraries

* jQuery - Loaded from Google's CDN; local failback coming soon.
* Backbone
* [Backbone.Marionette](http://marionettejs.com) - More structure for your Backbone apps.
* LoDash - A drop in replacement for Underscore.
* Handlebars
* [RequireJs](http://requirejs.org) - Honestly, the best thing that's happened to JS in the browser.
* [RequireJs Handlebars Plugin](https://github.com/SlexAxton/require-handlebars-plugin) - This plugin is fantastic: it loads and pre-compiles your handlebars templates.

### Tools

* grunt
* compass (through grunt)

## Project setup

This web project has the following setup:
* src/
    * scss/ - scss styles. compass will build these into `src/www/css`
    * www/ - the web assets for the project
        * index.html - the entry point into the app.
        * js/
            * app.main.js - the top-level config script used by index.html
            * app/ - the directory to store project-specific scripts.
            * vender/ - the directory to hold third party scripts.


## How do I use this?

It should be super simple. Assumng you alredy have npm, just:

1. `npm install grunt -g`
2. `npm install volo -g`

Once that's done, you're ready to create your app. Again, in your command line:

* `volo create appName earaya/kickplate`

Then enter your app's directory and:

1. `npm install`
2. `grunt volo:install`

This will pull all your dependencies.

At this point your app is ready. You can start writing code in the `src/www` folder.

The cool thing about this project is that you can work in and serve the `www` files without a compilation step. Your styless will need to be pre-processed, however, so `grunt watch` will take care of that.

## How do I build my app when I'm done developing?

In your app folder, type:

`grunt build`

When the grunt task has finished, you can start serving `build\www` folder. You should compare the network traffic between the `src/www` and `build/www` folder to understand what the build is doing for you. Also, take a look at the content of the files. You'll see that your JS is uglified and minified.

## Anything else I should know?

I've set this up to make sure you have a great experience. The project lints, and runs your tests on builds. Everything should be really easy to do. If it's not, please let me know. Or better yet, plase submit a pull request.

Also, there's a few more things I'd like to add, so keep your eyes open for changes!