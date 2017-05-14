function createSnapshotsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('Snapshots').init()).
        addChild(new RcdGoogleMaterialIconArea('help', displayHelp).init().setTooltip('Help'));

    const tableCard = new RcdMaterialTableCard('Snapshots').init().
        addColumn('Snapshot name').
        addColumn('Timestamp', {classes: ['non-mobile-cell']}).
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createSnapshot).init().setTooltip('Create a snapshot'), {max: 0}).
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
                            addCell(toLocalDateTimeFormat(new Date(snapshot.timestamp)), {classes: ['non-mobile-cell']}).
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

    function displayHelp() {
        const definition = 'A snapshot is a record of your Enonic XP indexes at a particular point in time. ' +
                           'Your first snapshot will be a complete copy of your indexes, but all subsequent snapshots will save the delta between the existing snapshots and the current state.' +
                           'This makes snapshots optimized for repetitive saves and allow to quickly rollback to a previous state in one click. It is also used, in addition to blobs backup (not covered by this tool), for backing up your data. ' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/stable/operations/backup.html#backing-up-indexes">Backing up indexes</a> for more information.';

        const viewDefinition = 'The view lists in a table all the snapshots. ' +
                               'You can generate a new snapshot, restore the indexes to a previous state or delete existing snapshots.';

        new HelpDialog('Snaphots', [definition, viewDefinition]).
            init().
            addActionDefinition({iconName: 'add_circle', definition: 'Generate a snapshot of the indexes'}).
            addActionDefinition({iconName: 'restore', definition: 'Restore the indexes to the selected snapshot'}).
            addActionDefinition({iconName: 'delete', definition: 'Delete the selected snapshots.'}).
            open();
    }
}
