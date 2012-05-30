define(['vent/controller.vent', 'model/home.model', 'view/home.view'], function (controllerVent, HomeModel, HomeView) {
    return {
        index:function () {
            var homeView = new HomeView({ model: new HomeModel() });
            homeView.on("h1:click", function () {
                alert("Hello!");
            });
            controllerVent.trigger('view', homeView);
        },
        notfound:function () {
            alert('not found triggered.');
        }
    };
});