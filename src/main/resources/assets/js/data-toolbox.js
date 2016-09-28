function createHeader() {
    return new RcdMaterialHeader('Data toolbox').init();
}

function createMain() {
    var main = new RcdMaterialMain().init();

    //Fills the nav bar
    main.nav.addLink('dumps', 'file_download', 'Dumps', () => router.setState('dumps')).
        addLink('snapshots', 'photo_camera', 'Snapshots');

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
    dumpsTable.header.addCell('Dump name').addCell('Size (bytes)').addCell('Timestamp');
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
        addIcon('file_download', createDump).
        addIcon('file_upload', () => {
        }).
        addIcon('delete', deleteDumps);
    dumpsCard.addContent(dumpsTable);

    dumpsView.addChild(dumpsCard);

    return dumpsView;
}

function createDump() {
    var dumpName = 'dump-' + new Date().toISOString();
    $.ajax({
        method: 'POST',
        url: '/api/system/dump',
        data: JSON.stringify({name: dumpName}),
        contentType: 'application/json; charset=utf-8'
    });
    setTimeout(function () {
        router.setState('dumps');
    }, 1000);
}

function deleteDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-delete',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        //TODO Check success & error
        router.setState('dumps');
    });
}

function retrieveDumps() {
    return $.ajax({
        url: config.servicesUrl + '/dump-list'
    }).done(function (result) {
        dumpsTable.body.clear();
        //TODO Check success & error
        result.success.forEach((dump) => {
            dumpsTable.body.createRow().
                addCell(dump.name).
                addCell(dump.size.toLocaleString()).
                addCell(new Date(dump.timestamp).toISOString()).
                setAttribute('dump', dump.name);
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