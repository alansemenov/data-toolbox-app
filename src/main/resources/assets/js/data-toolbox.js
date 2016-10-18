//Create the static part
var header = createHeader();
var main = createMain();

//Creates the views
var presentationView = createPresentationView();
var dumpsTable = createDumpsTable();
var dumpsView = createDumpsView(dumpsTable);
main.content.addView(presentationView).
    addView(dumpsView);

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
router.setState(router.getCurrentState());