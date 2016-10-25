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
document.body.appendChild(header.getDomElement());
document.body.appendChild(main.getDomElement());

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


//TODO Remove
var cancelAction = new RcdMaterialActionText("Cancel").init();
var okAction = new RcdMaterialActionText("Ok", () => document.body.removeChild(dialog.getDomElement())).init();
var dialog = new RcdMaterialModalDialog("Test dialog feature").init().addAction(cancelAction).addAction(okAction);
document.body.appendChild(dialog.getDomElement());
