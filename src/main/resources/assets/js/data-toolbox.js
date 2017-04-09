function createApp() {
    return new RcdMaterialSinglePageApplication('Data toolbox').
        init().
        setDefaultRoute(createPresentationRoute()).
        addRoute(createDumpsRoute());
}

function handleResultError(result) {
    if (result.error) {
        new RcdMaterialSnackbar(result.error).init().open();
        return false;
    }
    return true;
}

function handleAjaxError(jqXHR) {
    if (jqXHR.status) {
        new RcdMaterialSnackbar('Error ' + jqXHR.status + ': ' + jqXHR.statusText).
            init().open();
    } else {
        new RcdMaterialSnackbar('Connection refused').
            init().open();
    }
}

var app = createApp();
app.start(document.body);