var mustacheLib = require('/lib/xp/mustache');

exports.get = function (req) {


    if (req.params.action) {
        switch (req.params.action) {
        case "render":
            return render(req.params.view);
        }
    } else {
        return render("main")
    }

    return {
        status: 400
    };


};

function render(viewName) {
    var view = resolve(viewName + ".html"); //TODO Secu
    var body = mustacheLib.render(view, {});

    return {
        body: body,
        contentType: 'text/html'
    };
}