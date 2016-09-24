function createHeader() {
    return new RcdMaterialHeader('Data toolbox').init();
}

function createMain() {
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

function createDumpsTable() {
    var dumpsTable = new RcdMaterialTable().init();
    dumpsTable.header.addCell('Dump name').addCell('Size').addCell('Timestamp');
    return dumpsTable;
}
function createDumpsView(dumpsTable) {
    //Creates the dump view
    var dumpsViewPathElements = [{name: 'Data Toolbox'}, {name: 'Dumps', link: '#dumps'}];
    var dumpsViewDescription = 'To secure your data or migrate it to another installation, a dump of your installation can be made. ' +
                               'This dump includes all the current versions of your content, users, groups and roles.';
    var dumpsView = new RcdMaterialView('dumps', dumpsViewPathElements, dumpsViewDescription).init();

    var dumpsCard = new RcdMaterialCard('Dumps').
        init().
        addIcon('file_download').
        addIcon('file_upload').
        addIcon('delete');
    dumpsView.addChild(dumpsCard);
    dumpsCard.addContent(dumpsTable);

    return dumpsView;
}

function retrieveDumps() {
    return $.ajax({
        url: config.servicesUrl + '/dump-list'
    }).done(function (dumps) {
        dumpsTable.body.clear();
        dumps.forEach((dump) => {
            dumpsTable.body.createRow().
                addCell(dump.name).
                addCell(dump.size.toLocaleString()).
                addCell(new Date(dump.timestamp).toISOString());
        });
    });
}

//Create the static part
var header = createHeader();
var main = createMain();
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
router.addDefaultRoute(() => main.content.displayView(presentationView.viewId));
router.addRoute(dumpsView.viewId, () => {
    retrieveDumps();
    main.content.displayView(dumpsView.viewId);
});
router.setState(router.getCurrentState());