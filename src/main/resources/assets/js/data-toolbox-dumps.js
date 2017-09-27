function createDumpsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('System dumps').init()).
        addChild(new RcdGoogleMaterialIconArea('help', displayHelp).init().setTooltip('Help'));

    const tableCard = new RcdMaterialTableCard('System dumps').init().
        addColumn('Dump name').
        addColumn('Timestamp', {classes: ['non-mobile-cell']}).
        addColumn('Version', {classes: ['non-mobile-cell', 'version-cell']}).
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createDump).init().setTooltip('Generate a system dump'),
        {max: 0}).
        addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/load.svg', loadDump).init().setTooltip('Load selected system dump'),
        {min: 1, max: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('file_download',
            dowloadDumps).init().setTooltip('Archive and download selected system dumps'), {min: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('file_upload', uploadDumps).init().setTooltip('Upload and unarchive system dumps', RcdMaterialTooltipAlignment.RIGHT), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteDumps).init().setTooltip('Delete selected system dumps', RcdMaterialTooltipAlignment.RIGHT), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'dumps',
        name: 'System Dumps',
        iconArea: new RcdImageIconArea(config.assetsUrl + '/icons/dump.svg').init(),
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveDumps();
        }
    };

    function retrieveDumps() {
        const infoDialog = showInfoDialog('Retrieving dump list...');
        return $.ajax({
            url: config.servicesUrl + '/dump-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((dump1, dump2) => dump2.timestamp - dump1.timestamp).
                    forEach((dump) => {
                        tableCard.createRow().
                            addCell(dump.name).
                            addCell(toLocalDateTimeFormat(new Date(dump.timestamp)), {classes: ['non-mobile-cell']}).
                            addCell(dump.version, {classes: ['non-mobile-cell', 'version-cell']}).
                            setAttribute('dump', dump.name).
                            setAttribute('type', dump.type);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createDump() {
        const defaultDumpName = 'dump-' + toLocalDateTimeFormat(new Date(), '-', '-');
        showInputDialog({
            title: 'Create dump',
            label: 'Dump name',
            placeholder: defaultDumpName,
            value: defaultDumpName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateDump(value || defaultDumpName)
        });
    }

    function doCreateDump(dumpName) {
        const infoDialog = showInfoDialog('Creating dump...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-create',
            data: JSON.stringify({
                dumpName: dumpName || ('dump-' + toLocalDateTimeFormat(new Date(), '-', '-'))
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => {
            if (handleResultError(result)) {
                new DumpResultDialog(result.success).init().
                    open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }

    function deleteDumps() {
        showConfirmationDialog('Delete selected dumps?', 'DELETE', doDeleteDumps);
    }

    function doDeleteDumps() {
        const infoDialog = showInfoDialog("Deleting selected dumps...");
        const dumpNames = tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-delete',
            data: JSON.stringify({dumpNames: dumpNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }

    function loadDump() {
        const dumpName = tableCard.getSelectedRows().map((row) => row.attributes['dump'])[0];
        const dumpType = tableCard.getSelectedRows().map((row) => row.attributes['type'])[0];
        if ('export' === dumpType) {
            doLoadDump(dumpName, dumpType);
        } else {
            showConfirmationDialog('Loading this dump will delete all existing repositories', 'LOAD',
                () => doLoadDump(dumpName, dumpType));
        }
    }

    function doLoadDump(dumpName, dumpType) {
        const infoDialog = showInfoDialog("Loading dump...");
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-load',
            data: JSON.stringify({dumpName: dumpName}),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => {
            if (handleResultError(result)) {
                if (dumpType === 'export') {
                    new LoadExportDumpDialog(result.success).init().
                    open();
                } else {
                    new DumpResultDialog(result.success, true).init().
                    open();
                }
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function dowloadDumps() {
        const dumpNames = tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        const dumpNamesInput = new RcdInputElement().init().
            setAttribute('type', 'hidden').
            setAttribute('name', 'dumpNames').
            setAttribute('value', dumpNames);
        const downloadForm = new RcdFormElement().init().
            setAttribute('action', config.servicesUrl + '/dump-download').
            setAttribute('method', 'post').
            addChild(dumpNamesInput);
        document.body.appendChild(downloadForm.getDomElement());
        downloadForm.submit();
        document.body.removeChild(downloadForm.getDomElement());
    }

    var uploadForm;

    function uploadDumps() {
        const uploadFileInput = new RcdInputElement().init().
            setAttribute('type', 'file').
            setAttribute('name', 'uploadFile').
            addChangeListener(doUploadDumps);
        uploadForm = new RcdFormElement().init().
            addChild(uploadFileInput);
        uploadFileInput.click();
    }

    function doUploadDumps() {
        const infoDialog = showInfoDialog("Uploading dump archive...");
        const formData = new FormData(uploadForm.getDomElement());
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-upload',
            data: formData,
            contentType: false,
            processData: false
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }

    function displayHelp() {
        const definition = 'A system dump is an export of your entire data (contents, users, groups, roles, ...) from your Enonic XP server to a serialized format.<br/>' +
                           'While a node/content export focuses on a given node and its children, a system dump is used to export an entire system (all repositories/branches/nodes). ' +
                           'This makes dumps well suited for migrating your data to another installation.<br/>' +
                           'Warning: System dumps generated by Enonic XP <6.11 are similar to exports. They contain only the latest version of the nodes and loading these system dumps will keep or overwrite existing data. ' +
                           'System dumps generated by Enonic XP >=6.11 are similar to backups. They contain the version history of the nodes and loading these system dumps will delete existing data.<br/>' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.11/operations/export.html">Export and Import</a> for more information.';

        const viewDefinition = 'The view lists in a table all the system dumps located in $XP_HOME/data/dump. ' +
                               'You can delete, load or archive (ZIP) and download existing dumps. ' +
                               'You can also generate a new dump of your system or upload previously archived dumps.';

        new HelpDialog('System Dumps', [definition, viewDefinition]).
            init().
            addActionDefinition({iconName: 'add_circle', definition: 'Generate a system dump into $XP_HOME/data/dump/[dump-name]'}).
            addActionDefinition({iconName: 'refresh', definition: 'Load the selected system dumps into Enonic XP'}).
            addActionDefinition({iconName: 'file_download', definition: 'Zip the selected dumps and download the archive'}).
            addActionDefinition({iconName: 'file_upload', definition: 'Upload archived dumps and unzip them into $XP_HOME/data/dump'}).
            addActionDefinition({iconName: 'delete', definition: 'Delete the selected system dumps.'}).
            open();
    }
}
