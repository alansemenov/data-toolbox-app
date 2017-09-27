function createExportsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('Node exports').init()).
        addChild(new RcdGoogleMaterialIconArea('help', displayHelp).init().setTooltip('Help'));


    const tableCard = new RcdMaterialTableCard('Node exports').init().
        addColumn('Export name').
        addColumn('Timestamp', {classes: ['non-mobile-cell']}).
        addIconArea(new RcdGoogleMaterialIconArea('file_download',
            dowloadExports).init().setTooltip('Archive and download selected node exports'),
        {min: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('file_upload', uploadExports).init().setTooltip('Upload and unarchive node exports', RcdMaterialTooltipAlignment.RIGHT), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteExports).init().setTooltip('Delete selected node exports', RcdMaterialTooltipAlignment.RIGHT), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'exports',
        name: 'Node Exports',
        iconArea: new RcdGoogleMaterialIconArea('import_export').init(),
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveExports();
        }
    };

    function retrieveExports() {
        const infoDialog = showInfoDialog('Retrieving export list...');
        return $.ajax({
            url: config.servicesUrl + '/export-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((export1, export2) => export2.timestamp - export1.timestamp).
                    forEach((anExport) => {
                        tableCard.createRow().
                            addCell(anExport.name).
                            addCell(toLocalDateTimeFormat(new Date(anExport.timestamp)), {classes: ['non-mobile-cell']}).
                            setAttribute('export', anExport.name);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function deleteExports() {
        showConfirmationDialog('Delete selected exports?', 'DELETE', doDeleteExports);
    }

    function doDeleteExports() {
        const infoDialog = showInfoDialog("Deleting selected exports...");
        const exportNames = tableCard.getSelectedRows().map((row) => row.attributes['export']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-delete',
            data: JSON.stringify({exportNames: exportNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function dowloadExports() {
        const exportNames = tableCard.getSelectedRows().map((row) => row.attributes['export']);
        const exportNamesInput = new RcdInputElement().init().
            setAttribute('type', 'hidden').
            setAttribute('name', 'exportNames').
            setAttribute('value', exportNames);
        const downloadForm = new RcdFormElement().init().
            setAttribute('action', config.servicesUrl + '/export-download').
            setAttribute('method', 'post').
            addChild(exportNamesInput);
        document.body.appendChild(downloadForm.getDomElement());
        downloadForm.submit();
        document.body.removeChild(downloadForm.getDomElement());
    }

    var uploadForm;

    function uploadExports() {
        const uploadFileInput = new RcdInputElement().init().
            setAttribute('type', 'file').
            setAttribute('name', 'uploadFile').
            addChangeListener(doUploadExports);
        uploadForm = new RcdFormElement().init().
            addChild(uploadFileInput);
        uploadFileInput.click();
    }

    function doUploadExports() {
        const infoDialog = showInfoDialog("Uploading export archive...");
        const formData = new FormData(uploadForm.getDomElement());
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-upload',
            data: formData,
            contentType: false,
            processData: false
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function displayHelp() {
        const definition = 'A node export is a serialization of a given content/node and its children. ' +
                           'This makes node exports well suited for transferring a specific content to another installation. ' +
                           'Warning: The export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.11/operations/export.html">Export and Import</a> for more information.';

        const viewDefinition = 'The view lists in a table all the node exports located in $XP_HOME/data/export. ' +
                               'You can delete or archive (ZIP) and download existing exports. ' +
                               'You can also upload previously archived exports.<br/>' +
                               'Node exports can be generated and imported from the nodes view (Under "Repositories").';

        new HelpDialog('Node Exports', [definition, viewDefinition]).
            init().
            addActionDefinition({iconName: 'file_download', definition: 'Zip the selected exports and download the archive'}).
            addActionDefinition({iconName: 'file_upload', definition: 'Upload archived exports and unzip them into $XP_HOME/data/export'}).
            addActionDefinition({iconName: 'delete', definition: 'Delete the selected node exports.'}).
            open();
    }
}
