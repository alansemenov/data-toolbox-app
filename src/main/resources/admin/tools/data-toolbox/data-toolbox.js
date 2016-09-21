var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');

exports.get = function () {
    var view = resolve("main.html");
    var body = mustacheLib.render(view, {
        assetsUrl: portalLib.assetUrl({path: ""}),
        servicesUrl: portalLib.serviceUrl({service: ""})
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};