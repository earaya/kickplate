define(['backbone', 'vent/app.vent', 'model/home.model', 'view/home.view', 'view/about.view'],
    function (Backbone, appvent, HomeModel, HomeView, AboutView) {
    return {
        index:function () {
            var homeView = new HomeView({ model: new HomeModel() });
            homeView.on("click:h1", function () {
                homeView.model.sayHello()
            });
            appvent.trigger('controller:view', homeView);
        },
        about: function() {
            appvent.trigger('controller:view', new AboutView());
        }
    };
});