//Create the static part
var header = createHeader();
var main = createMain();

//Adds the views
main.content.addView(presentationView).
    addView(dumpsView).
    addView(exportsView).
    addView(snapshotsView).
    addView(repositoriesView).
    addView(branchesView).
    addView(nodesView);

//Appends the header and main elements
header.setParent(document.body);
main.setParent(document.body);

//Sets up the router
var router = new RcdHistoryRouter();
router.addDefaultRoute(() => {
    main.nav.selectLink();
    main.content.displayView(presentationView.viewId)
});
router.addRoute(dumpsView.viewId, () => {
    retrieveDumps();
    main.nav.selectLink('dumps');
    main.content.displayView(dumpsView.viewId);
});
router.addRoute(exportsView.viewId, () => {
    retrieveExports();
    main.nav.selectLink('exports');
    main.content.displayView(exportsView.viewId);
});
router.addRoute(snapshotsView.viewId, () => {
    retrieveSnapshots();
    main.nav.selectLink('snapshots');
    main.content.displayView(snapshotsView.viewId);
});
router.addRoute(repositoriesView.viewId, () => {
    retrieveRepositories();
    main.nav.selectLink('repositories');
    main.content.displayView(repositoriesView.viewId);
});
router.addRoute(branchesView.viewId, () => {
    retrieveBranches();
    refreshBranchesViewTitle(branchesView);
    main.content.displayView(branchesView.viewId);
});
router.addRoute(nodesView.viewId, () => {
    retrieveNodes();
    refreshNodesViewTitle(nodesView);
    main.content.displayView(nodesView.viewId);
});
router.setState(router.getCurrentState());

function handleResultError(result) {
    if (result.error) {
        showSnackbar(result.error, main.content);
        return false;
    }
    return true;
}

function handleAjaxError(jqXHR) {
    if (jqXHR.status) {
        showSnackbar('Error ' + jqXHR.status + ': ' + jqXHR.statusText, main.content);
    } else {
        showSnackbar('Connection refused', main.content);
    }
}
