function createSnapshotsTable() {
    var snapshotsTable = new RcdMaterialTable().init();
    snapshotsTable.header.addCell('Snapshot name').addCell('Timestamp');
    return snapshotsTable;
}

function createSnapshotsView(snapshotsTable) {
    //Creates the snapshot view
    var snapshotsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Snapshots'}];
    var snapshotsViewDescription = 'A snapshot is a record of a fixed state of your installation data. TODO description';
    var snapshotsView = new RcdMaterialView('snapshots', snapshotsViewPathElements, snapshotsViewDescription).init();

    var createSnapshotIcon = new RcdMaterialActionIcon('add', createSnapshot).init();
    var loadSnapshotIcon = new RcdMaterialActionIcon('refresh', restoreSnapshot).init().enable(false);

    snapshotsTable.addSelectionListener((nbRowsSelected) => {
        createSnapshotIcon.enable(nbRowsSelected == 0);
        loadSnapshotIcon.enable(nbRowsSelected == 1);
    });

    var snapshotsCard = new RcdMaterialCard('Snapshots').
        init().
        addIcon(createSnapshotIcon).
        addIcon(loadSnapshotIcon).
        addContent(snapshotsTable);

    snapshotsView.addChild(snapshotsCard);

    return snapshotsView;
}

function createSnapshot() {
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-create',
        data: JSON.stringify({
            snapshotName: 'snapshot-' + new Date().toISOString()
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        //TODO Check success & error
        router.setState('snapshots');
    });
}

function restoreSnapshot() {
    var snapshotName = snapshotsTable.getSelectedRows().
        map((row) => row.attributes['snapshot'])[0];
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-restore',
        data: JSON.stringify({snapshotName: snapshotName}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        //TODO Check success & error
        router.setState('snapshots');
    });
}

function retrieveSnapshots() {
    return $.ajax({
        url: config.servicesUrl + '/snapshot-list'
    }).done(function (result) {
        snapshotsTable.body.clear();
        //TODO Check success & error
        result.success.forEach((snapshot) => {
            snapshotsTable.body.createRow().
                addCell(snapshot.name).
                addCell(new Date(snapshot.timestamp).toISOString()).
                setAttribute('snapshot', snapshot.name);
        });
    });
}
