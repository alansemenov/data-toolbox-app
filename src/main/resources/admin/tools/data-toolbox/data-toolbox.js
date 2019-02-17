var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');

exports.get = function () {
    var view = resolve("data-toolbox.html");
    var xpVersion = Java.type('com.enonic.xp.server.VersionInfo')
        .get()
        .toString();
    var body = mustacheLib.render(view, {
        assetsUrl: portalLib.assetUrl({path: ""}),
        servicesUrl: portalLib.serviceUrl({service: ""}),
        xpVersion: xpVersion
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};