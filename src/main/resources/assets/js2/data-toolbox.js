function createMain() {
    //Creates and appends the header
    var header = new RcdMaterialHeader('Data toolbox').init();
    document.body.appendChild(header.getDomElement());

    //Create the main part
    var main = new RcdMaterialMain().init();

    //Fills the nav bar
    main.nav.addLink('file_download', 'Dumps', () => router.setState('dumps')).
        addLink('photo_camera', 'Snapshots');

    return main;
}

function createPresentationView() {
    //Creates and appends the presentation view
    var presentationViewPathElements = [{name: 'Data Toolbox'}];
    var presentationViewDescription = 'Data toolbox provides a web interface to visualize and manipulate your Enonic XP: ' +
                                      'dump & load your data, take & restore a snapshot, ...';
    return new RcdMaterialView('presentation', presentationViewPathElements, presentationViewDescription).init();
}

function createDumpsView() {
    //Creates the dump view
    var dumpsViewPathElements = [{name: 'Data Toolbox'}, {name: 'Dumps', link: '#dumps'}];
    var dumpsViewDescription = 'To secure your data or migrate it to another installation, a dump of your installation can be made. ' +
                               'This dump includes all the current versions of your content, users, groups and roles.';
    var dumpsView = new RcdMaterialView('dumps', dumpsViewPathElements, dumpsViewDescription).init();

    var dumpsCard = new RcdMaterialCard('Dumps').
        init().
        addIcon('file_download').addIcon('file_upload').addIcon('delete');
    dumpsView.addChild(dumpsCard);

    var dumpsTable = new RcdMaterialTable().init();
    dumpsTable.header.addCell('Dump name').addCell('Timestamp');
    dumpsCard.addContent(dumpsTable);

    return dumpsView;
}

//Create the static part
var main = createMain();
var presentationView = createPresentationView();
var dumpsView = createDumpsView();
main.content.addView(presentationView).addView(dumpsView);

//Appends the main part
document.body.appendChild(main.getDomElement());

//Sets up the router
var router = new RcdHistoryRouter();
router.addDefaultRoute(() => main.content.displayView(presentationView.viewId));
router.addRoute(dumpsView.viewId, () => main.content.displayView(dumpsView.viewId));
router.setState(router.getCurrentState());