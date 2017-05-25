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
        console.log(result.error);
        new RcdMaterialSnackbar(result.error).init().open();
        return false;
    }
    return true;
}

function handleAjaxError(jqXHR) {
    let errorMessage;
    if (jqXHR.status) {
        errorMessage = 'Error ' + jqXHR.status + ': ' + jqXHR.statusText;
    } else {
        errorMessage = 'Connection refused';
    }
    console.log(errorMessage);
    new RcdMaterialSnackbar(errorMessage).
        init().open();
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