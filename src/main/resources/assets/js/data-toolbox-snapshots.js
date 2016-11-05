function createSnapshotsTable() {
    var snapshotsTable = new RcdMaterialTable().init();
    snapshotsTable.header.addCell('Snapshot name').addCell('Timestamp');
    return snapshotsTable;
}

function createSnapshotsView(snapshotsTable) {
    //Creates the snapshot view
    var snapshotsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Snapshots'}];
    var snapshotsViewDescription = 'A snapshot is a record of the state of your entire data at a particular point in time. ' +
                                   'Technically, a snapshot is a record of the indexes or your repositories or a record of the modifications since the previous snapshot. ' +
                                   'This makes snapshots optimized for repetitive save and allow to quickly rollback to a previous state in one click.';
    var snapshotsView = new RcdMaterialView('snapshots', snapshotsViewPathElements, snapshotsViewDescription).init();

    var createSnapshotIcon = new RcdMaterialActionIcon('add_circle', createSnapshot).init().setTooltip('Create snapshot');
    var deleteSnapshotsIcon = new RcdMaterialActionIcon('delete', deleteSnapshots).init().setTooltip('Delete snapshot');
    var loadSnapshotIcon = new RcdMaterialActionIcon('refresh', restoreSnapshot).init().enable(false).setTooltip('Load snapshot');

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
    var defaultSnapshotName = 'snapshot-' + toLocalDateTimeFormat(new Date(), '-', '-');
    showInputDialog({
        title: "Create snapshot",
        ok: "CREATE",
        label: "Snapshot name",
        value: defaultSnapshotName,
        callback: (value) => doCreateSnapshot(value || defaultSnapshotName)
    });
}

function doCreateSnapshot(snapshotName) {
    showInfoDialog("Creating snapshot...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-create',
        data: JSON.stringify({
            snapshotName: snapshotName
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
            snapshotsTable.body.createRow().
                addCell(snapshot.name).
                addCell(toLocalDateTimeFormat(new Date(snapshot.timestamp))).
                setAttribute('snapshot', snapshot.name);
        });
    }).always(function () {
        hideDialog();
    });
}
