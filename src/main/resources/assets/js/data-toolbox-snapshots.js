function createSnapshotsTable() {
    var snapshotsTable = new RcdMaterialTable().init();
    snapshotsTable.header.addCell('Snapshot name').addCell('Timestamp');
    return snapshotsTable;
}

function createSnapshotsView(snapshotsTable) {
    //Creates the snapshot view
    var snapshotsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Snapshots'}];
    var snapshotsViewDescription = 'To save the state of your entire data at a given time, a snapshot can be made. ' +
                                   'A snapshot is a record of the indexes at a given time or a record of the modifications since the previous snapshot. ' +
                                   'Thus snapshots are optimized for repetitive save and allow to quickly rollback to a previous state.';
    var snapshotsView = new RcdMaterialView('snapshots', snapshotsViewPathElements, snapshotsViewDescription).init();

    var createSnapshotIcon = new RcdMaterialActionIcon('add_circle', createSnapshot).init();
    var deleteSnapshotsIcon = new RcdMaterialActionIcon('delete', deleteSnapshots).init();
    var loadSnapshotIcon = new RcdMaterialActionIcon('refresh', restoreSnapshot).init().enable(false);

    snapshotsTable.addSelectionListener(() => {
        var nbRowsSelected = snapshotsTable.getSelectedRows().length;
        createSnapshotIcon.enable(nbRowsSelected == 0);
        deleteSnapshotsIcon.enable(nbRowsSelected > 0);
        loadSnapshotIcon.enable(nbRowsSelected == 1);
    });

    var snapshotsCard = new RcdMaterialCard('Snapshots').
        init().
        addIcon(createSnapshotIcon).
        addIcon(deleteSnapshotsIcon).
        addIcon(loadSnapshotIcon).
        addContent(snapshotsTable);

    snapshotsView.addChild(snapshotsCard);

    return snapshotsView;
}

function createSnapshot() {
    showInfoDialog("Creating snapshot...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-create',
        data: JSON.stringify({
            snapshotName: 'snapshot-' + toRcdDateTimeFormat(new Date())
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        hideDialog();
        //TODO Check success & error
        router.setState('snapshots');
    });
}

function deleteSnapshots() {
    showConfirmationDialog("Delete selected snapshots?", doDeleteSnapshots);
}

function doDeleteSnapshots() {
    showInfoDialog("Deleting snapshot...");
    var snapshotNames = snapshotsTable.getSelectedRows().
        map((row) => row.attributes['snapshot']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-delete',
        data: JSON.stringify({snapshotNames: snapshotNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        hideDialog();
        //TODO Check success & error
        router.setState('snapshots');
    });
}

function restoreSnapshot() {
    showInfoDialog("Restoring snapshot...");
    var snapshotName = snapshotsTable.getSelectedRows().
        map((row) => row.attributes['snapshot'])[0];
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-restore',
        data: JSON.stringify({snapshotName: snapshotName}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        hideDialog();
        //TODO Check success & error
        router.setState('snapshots');
    });
}

function retrieveSnapshots() {
    showInfoDialog("Retrieving snapshots...");
    return $.ajax({
        url: config.servicesUrl + '/snapshot-list'
    }).done(function (result) {
        snapshotsTable.body.clear();
        //TODO Check success & error
        result.success.forEach((snapshot) => {
            var timestamp = toRcdDateTimeFormat(new Date(snapshot.timestamp));
            snapshotsTable.body.createRow().
                addCell(snapshot.name).
                addCell(timestamp).
                setAttribute('snapshot', snapshot.name).
                setAttribute('timestamp', timestamp);
        });
    }).always(function () {
        hideDialog();
    });
}
