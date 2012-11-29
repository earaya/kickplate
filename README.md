# KickPlate

A volo/grunt boilerplate project to help you get started writing awesome JS apps in the browser.

## So, what's included?

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
* volo

## Project setup

This web project has the following setup:

* www/ - the web assets for the project
    * index.html - the entry point into the app.
    * js/
        * app.js - the top-level config script used by index.html
        * app/ - the directory to store project-specific scripts.
        * lib/ - the directory to hold third party scripts.


## And, how do I use this?

To get going you'll need to:

First, install grunt and volo by typing the following in your command line:

1. `npm install grunt -g`
2. `npm install volo -g`

Once that's done, you're ready to create your app. Again, in your command line:

* `volo create appName https://github.com/earaya/kickplate/archive/master.zip`

At this point your app is ready. You can start writing code in the `www` folder.
The cool thing about this project is that the files in `www` should work without compilation.
Use your favorite http server to serve those files, and you should see your app working.

## But how do I build my app then?

In your app folder, type:

`npm install`

Once grunt-contrib-requirejs has installed, you can easily build by just typing:

`grunt build`

When the grunt task has finished, you can start serving the www-built folder. You should compare the network traffic between the `www` and `www-built` folder to understand what the build is doing for you. Also, take a look at the content of the files. You'll see that your JS is uglified and minified.

## Anything else I should know?

I've set this up to make sure you have a great experience. The project lints, and runs your tests on builds. Everything should be really easy to do. If it's not, please let me know. Or better yet, plase submit a pull request.

Also, there's a few more things I'd like to add, so keep your eyes open for changes!