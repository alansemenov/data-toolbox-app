const snapshotsTable = createSnapshotsTable();
const snapshotsTableNoContent = new RcdMaterialTableNoContent('No snapshot found').init();
const snapshotsView = createSnapshotsView();

function createSnapshotsTable() {
    const snapshotsTable = new RcdMaterialTable().init();
    snapshotsTable.header.addCell('Snapshot name').addCell('Timestamp');
    return snapshotsTable;
}

function createSnapshotsView() {
    //Creates the snapshot view
    const snapshotsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Snapshots'}];
    const snapshotsViewDescription = 'A snapshot is a record of your Enonic XP indexes at a particular point in time. ' +
                                   'Your first snapshot will be a complete copy of your indexes, but all subsequent snapshots will save the delta between the existing snapshots and the current state.' +
                                   'This makes snapshots optimized for repetitive saves and allow to quickly rollback to a previous state in one click. It is also used, in addition to blobs backup, for backing up your data. ' +
                                   'See <a href="http://xp.readthedocs.io/en/stable/operations/backup.html#backing-up-indexes">Backing up indexes</a> for more information.';
    const snapshotsView = new RcdMaterialView('snapshots', snapshotsViewPathElements, snapshotsViewDescription).init();

    const createSnapshotIcon = new RcdMaterialActionIcon('add_circle', createSnapshot).init().setTooltip('Create snapshot');
    const deleteSnapshotsIcon = new RcdMaterialActionIcon('delete', deleteSnapshots).init().setTooltip('Delete snapshot');
    const loadSnapshotIcon = new RcdMaterialActionIcon('restore', restoreSnapshot).init().enable(false).setTooltip('Restore snapshot');

    snapshotsTable.addSelectionListener(() => {
        const nbRowsSelected = snapshotsTable.getSelectedRows().length;
        createSnapshotIcon.enable(nbRowsSelected == 0);
        deleteSnapshotsIcon.enable(nbRowsSelected > 0);
        loadSnapshotIcon.enable(nbRowsSelected == 1);
    });

    const snapshotsCard = new RcdMaterialCard('Snapshots').
        init().
        addIcon(createSnapshotIcon).
        addIcon(deleteSnapshotsIcon).
        addIcon(loadSnapshotIcon).
        addContent(snapshotsTable).
        addChild(snapshotsTableNoContent);

    snapshotsView.addChild(snapshotsCard);

    return snapshotsView;
}

function createSnapshot() {
    const defaultSnapshotName = 'snapshot-' + toLocalDateTimeFormat(new Date(), '-', '-');
    showInputDialog({
        title: "Create snapshot",
        ok: "CREATE",
        label: "Snapshot name",
        placeholder: defaultSnapshotName,
        value: defaultSnapshotName,
        callback: (value) => doCreateSnapshot(value || defaultSnapshotName)
    });
}

function doCreateSnapshot(snapshotName) {
    const infoDialog = showInfoDialog("Creating snapshot...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-create',
        data: JSON.stringify({
            snapshotName: snapshotName
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function deleteSnapshots() {
    showConfirmationDialog("Delete selected snapshots?", doDeleteSnapshots);
}

function doDeleteSnapshots() {
    const infoDialog = showInfoDialog("Deleting snapshot...");
    const snapshotNames = snapshotsTable.getSelectedRows().
        map((row) => row.attributes['snapshot']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-delete',
        data: JSON.stringify({snapshotNames: snapshotNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(function () {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function restoreSnapshot() {
    const infoDialog = showInfoDialog("Restoring snapshot...");
    const snapshotName = snapshotsTable.getSelectedRows().
        map((row) => row.attributes['snapshot'])[0];
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/snapshot-restore',
        data: JSON.stringify({snapshotName: snapshotName}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(function () {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function retrieveSnapshots() {
    const infoDialog = showInfoDialog("Retrieving snapshots...");
    return $.ajax({
        url: config.servicesUrl + '/snapshot-list'
    }).done(function (result) {
        snapshotsTable.body.clear();
        if (handleResultError(result)) {
            snapshotsTableNoContent.show(result.success.length == 0);
            result.success.
                sort((snapshot1, snapshot2) => snapshot2.timestamp - snapshot1.timestamp).
                forEach((snapshot) => {
                    snapshotsTable.body.createRow().
                        addCell(snapshot.name).
                        addCell(toLocalDateTimeFormat(new Date(snapshot.timestamp))).
                        setAttribute('snapshot', snapshot.name);
                });
        }
    }).fail(handleAjaxError).always(function () {
        hideDialog(infoDialog);
    });
}
