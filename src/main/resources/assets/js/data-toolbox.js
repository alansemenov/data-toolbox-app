function createApp() {
    return new RcdMaterialSinglePageApplication('Data toolbox').
        init().
        setDefaultRoute(createPresentationRoute()).
        addRoute(new RepositoriesRoute().init()).
        addRoute(createSnapshotsRoute()).
        addRoute(createExportsRoute()).
        addRoute(createDumpsRoute()).
        addRoute(createBranchesRoute()).
        addRoute(createFieldsRoute()).
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

function setState(state,params) {
    let stateBuilder = state;
    if (params) {
        stateBuilder += '?';
        let firstParameter = true;
        for(paramName in params) {
            if (firstParameter) {
                firstParameter = false;
            } else {
                stateBuilder += '&'
            }
            stateBuilder += paramName + '=' + params[paramName];
        }
    }
    RcdHistoryRouter.setState(stateBuilder);
}

function getRepoParameter() {
    return RcdHistoryRouter.getParameters().repo;
}

function getBranchParameter() {
    return RcdHistoryRouter.getParameters().branch;
}

function getPathParameter() {
    return RcdHistoryRouter.getParameters().path;
}

function getStartParameter() {
    return RcdHistoryRouter.getParameters().start || '0';
}

function getCountParameter() {
    return RcdHistoryRouter.getParameters().count || '50';
}

function getFilterParameter() {
    return RcdHistoryRouter.getParameters().filter || '';
}

function getSortParameter() {
    return RcdHistoryRouter.getParameters().sort || '';
}

function getFieldParameter() {
    return RcdHistoryRouter.getParameters().field;
}

var app = createApp();
app.start(document.body);