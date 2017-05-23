function createApp() {
    return new RcdMaterialSinglePageApplication('Data toolbox').
        init().
        setDefaultRoute(createPresentationRoute()).
        addRoute(createRepositoriesRoute()).
        addRoute(createSnapshotsRoute()).
        addRoute(createExportsRoute()).
        addRoute(createDumpsRoute()).
        addRoute(createBranchesRoute()).
        addRoute(createNodesRoute());
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

function showInfoDialog(text) {
    return new RcdMaterialInfoDialog({text: text}).
        init().
        open();
}

function showConfirmationDialog(text, confirmationLabel, callback) {
    return new RcdMaterialConfirmationDialog({text: text, confirmationLabel: confirmationLabel, callback: callback}).
        init().
        open();
}

function showInputDialog(params) {
    return new RcdMaterialInputDialog(params).
        init().
        open();
}

function showSelectionDialog(params) {
    return new RcdMaterialSelectionDialog(params).
        init().
        open();
}

function showDetailsDialog(title, text, callback) {
    return new RcdMaterialDetailsDialog({title: title, text: text, callback: callback}).
        init().
        open();
}

var app = createApp();
app.start(document.body);