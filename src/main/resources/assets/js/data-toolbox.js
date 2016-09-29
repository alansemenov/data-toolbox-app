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

    var createDumpIcon = new RcdMaterialActionIcon('file_download', createDump).init();
    var loadDumpIcon = new RcdMaterialActionIcon('file_upload', loadDumps).init().enable(false);
    var deleteDumpIcon = new RcdMaterialActionIcon('delete', deleteDumps).init().enable(false);

    dumpsTable.addSelectionListener((nbRowsSelected) => {
        createDumpIcon.enable(nbRowsSelected == 0);
        loadDumpIcon.enable(nbRowsSelected > 0);
        deleteDumpIcon.enable(nbRowsSelected > 0);
    });

    var dumpsCard = new RcdMaterialCard('Dumps').
        init().
        addIcon(createDumpIcon).
        addIcon(loadDumpIcon).
        addIcon(deleteDumpIcon).
        addContent(dumpsTable);

    dumpsView.addChild(dumpsCard);

    return dumpsView;
}

function createDump() {
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-create',
        data: JSON.stringify({
            dumpName: 'dump-' + new Date().toISOString()
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        //TODO Check success & error
        router.setState('dumps');
    });
}

function loadDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-load',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        //TODO Check success & error
        router.setState('dumps');
    });
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