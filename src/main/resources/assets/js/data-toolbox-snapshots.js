function createSnapshotsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('Snapshots').init());

    const tableCard = new RcdMaterialTableCard('Snapshots').init().
        addColumn('Snapshot name').
        addColumn('Timestamp').
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createSnapshot).init().setTooltip('Create a snapshot', undefined, RcdMaterialTooltipAlignment.RIGHT), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('restore', restoreSnapshot).init().setTooltip('Restore selected snapshot'),
        {min: 1, max: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteSnapshots).init().setTooltip('Delete selected snapshots', undefined,
            RcdMaterialTooltipAlignment.RIGHT), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'snapshots',
        name: 'Snapshots',
        iconArea: new RcdGoogleMaterialIconArea('photo_camera').init(),
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveSnapshots();
        }
    };

    function retrieveSnapshots() {
        const infoDialog = showInfoDialog('Retrieving snapshot list...');
        return $.ajax({
            url: config.servicesUrl + '/snapshot-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((snapshot1, snapshot2) => snapshot2.timestamp - snapshot1.timestamp).
                    forEach((snapshot) => {
                        tableCard.createRow().
                            addCell(snapshot.name).
                            addCell(toLocalDateTimeFormat(new Date(snapshot.timestamp))).
                            setAttribute('snapshot', snapshot.name);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createSnapshot() {
        const defaultSnapshotName = 'snapshot-' + toLocalDateTimeFormat(new Date(), '-', '-');
        new RcdMaterialInputDialog({
            title: 'Create snapshot',
            label: 'Snapshot name',
            placeholder: defaultSnapshotName,
            value: defaultSnapshotName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateSnapshot(value || defaultSnapshotName)
        }).init().open();
    }

    function doCreateSnapshot(snapshotName) {
        const infoDialog = showInfoDialog('Creating snapshot...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/snapshot-create',
            data: JSON.stringify({
                snapshotName: snapshotName || ('snapshot-' + toLocalDateTimeFormat(new Date(), '-', '-'))
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveSnapshots();
        });
    }

    function deleteSnapshots() {
        showConfirmationDialog("Delete selected snapshots?", doDeleteSnapshots);
    }

    function doDeleteSnapshots() {
        const infoDialog = showInfoDialog("Deleting selected snapshots...");
        const snapshotNames = tableCard.getSelectedRows().map((row) => row.attributes['snapshot']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/snapshot-delete',
            data: JSON.stringify({snapshotNames: snapshotNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveSnapshots();
        });
    }

    function restoreSnapshot() {
        const infoDialog = showInfoDialog("Restoring snapshot...");
        const snapshotName = tableCard.getSelectedRows().map((row) => row.attributes['snapshot'])[0];
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/snapshot-restore',
            data: JSON.stringify({snapshotName: snapshotName}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }
}
