var contentLib = require('/lib/xp/content');
var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');

exports.get = function (req) {

    var content = contentLib.get({key: req.params.contentId});
    log.info(JSON.stringify(content));
    var view = resolve("export.html");
    var body = mustacheLib.render(view, {
        assetsUrl: portalLib.assetUrl({path: ""}),
        servicesUrl: portalLib.serviceUrl({service: ""}),
        contentPath: content._path,
        contentName: content._name
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};