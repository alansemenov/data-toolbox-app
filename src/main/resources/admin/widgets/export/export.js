var authLib = require('/lib/xp/auth');
var contentLib = require('/lib/xp/content');
var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');

exports.get = function (req) {
    var hasAdminRole = authLib.hasRole('system.admin');
    if (!hasAdminRole) {
        return null;
    }
    
    var content = contentLib.get({key: req.params.contentId});
    var view = resolve("export.html");
    var body = mustacheLib.render(view, {
        servicesUrl: portalLib.serviceUrl({service: ""}),
        assetsUrl: portalLib.assetUrl({path: ""}),
        contentPath: content._path,
        contentName: content._name
    });
    return {
        body: body,
        contentType: 'text/html'
    };
};