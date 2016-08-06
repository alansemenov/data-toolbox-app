var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');

exports.get = function (req) {


    if (req.params.action) {
        switch (req.params.action) {
        case "render":
            //return render(TODO);
        }
    } else {
        return render("main",
            {
                assetsUrl: portalLib.assetUrl({path: "main"})
            }
        );
    }

    return {
        status: 400
    };


};

function render(viewName, params) {
    var view = resolve(viewName + ".html"); //TODO Secu
    var body = mustacheLib.render(view, params);

    return {
        body: body,
        contentType: 'text/html'
    };
}