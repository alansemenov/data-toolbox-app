//Create the static part
var header = createHeader();
var main = createMain();

//Creates the views
var presentationView = createPresentationView();
var dumpsTable = createDumpsTable();
var dumpsView = createDumpsView(dumpsTable);
var snapshotsTable = createSnapshotsTable();
var snapshotsView = createSnapshotsView(snapshotsTable);
main.content.addView(presentationView).
    addView(dumpsView).
    addView(snapshotsView);

//Appends the header and main elements
header.show(document.body);
main.show(document.body);

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
router.addRoute(snapshotsView.viewId, () => {
    retrieveSnapshots();
    main.nav.selectLink('snapshots');

    main.content.displayView(snapshotsView.viewId);
});
router.setState(router.getCurrentState());
