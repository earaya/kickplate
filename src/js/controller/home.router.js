define(['marionette', 'controller/home.controller'], function(Marionette, homeController) {
    return Marionette.AppRouter.extend({
        controller: homeController,
        appRoutes: {
            '': 'index',
            '*actions': 'notfound'
        }
    });
});
