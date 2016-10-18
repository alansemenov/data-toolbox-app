function createDumpsTable() {
    var dumpsTable = new RcdMaterialTable().init();
    dumpsTable.header.addCell('Dump name').addCell('Size (bytes)').addCell('Timestamp');
    return dumpsTable;
}

function createDumpsView(dumpsTable) {
    //Creates the dump view
    var dumpsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Dumps'}];
    var dumpsViewDescription = 'To secure your data or migrate it to another installation, a dump of your installation can be made. ' +
                               'This dump includes all the current versions of your content, users, groups and roles.';
    var dumpsView = new RcdMaterialView('dumps', dumpsViewPathElements, dumpsViewDescription).init();

    var createDumpIcon = new RcdMaterialActionIcon('add', createDump).init();
    var deleteDumpIcon = new RcdMaterialActionIcon('delete', deleteDumps).init().enable(false);
    var loadDumpIcon = new RcdMaterialActionIcon('refresh', loadDumps).init().enable(false);
    var archiveDumpIcon = new RcdMaterialActionIcon('file_download', archiveDumps).init().enable(false);

    dumpsTable.addSelectionListener((nbRowsSelected) => {
        createDumpIcon.enable(nbRowsSelected == 0);
        deleteDumpIcon.enable(nbRowsSelected > 0);
        loadDumpIcon.enable(nbRowsSelected > 0);
        archiveDumpIcon.enable(nbRowsSelected > 0);
    });

    var dumpsCard = new RcdMaterialCard('Dumps').
        init().
        addIcon(createDumpIcon).
        addIcon(deleteDumpIcon).
        addIcon(loadDumpIcon).
        addIcon(archiveDumpIcon).
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

function archiveDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);

    //TODO Create proper elements in framework
    var form = $('<form></form>').
        attr('action', '/admin/rest/datatoolbox/dump/archive').
        attr('method', 'post');
    form.append($("<input></input>").
        attr('type', 'hidden').
        attr('name', 'dumpNames').
        attr('value', dumpNames));
    form.appendTo('body').
        submit().
        remove();
}