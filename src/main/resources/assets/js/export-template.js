(function () {
    //@widgetWorkAround@
    //@widgetWorkAround2@
    let tableCard;
    let exportWidgetContainer;
    const interval = setInterval(() => {
        exportWidgetContainer = document.getElementById('exportWidgetContainer');
        if (exportWidgetContainer) {
            tableCard = new RcdMaterialTableCard('Exports').init().
                addColumn('Export name').
                addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/export-icon.svg',
                    createExport).init().setTooltip('Export current content', exportWidgetContainer), {max: 0}).
                addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/import-icon.svg',
                    loadExports).init().setTooltip('Import selected exports',
                    exportWidgetContainer), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('file_download',
                    dowloadExports).init().setTooltip('Archive and download selected exports', exportWidgetContainer,
                    RcdMaterialTooltipAlignment.RIGHT), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('file_upload', uploadExports).init().setTooltip('Upload and unarchive exports',
                    exportWidgetContainer, RcdMaterialTooltipAlignment.RIGHT),
                {max: 0}).
                addIconArea(new RcdGoogleMaterialIconArea('delete', deleteExports).init().setTooltip('Delete selected exports',
                    exportWidgetContainer), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('help', displayHelp).init().setTooltip('Help', exportWidgetContainer),
                {max: 0});

            retrieveExports();
            tableCard.setParent(exportWidgetContainer);
            clearInterval(interval);
        }
    }, 200);

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
                            setAttribute('export', anExport.name);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createExport() {
        const defaultExportName = config.contentName + '-' + toLocalDateTimeFormat(new Date(), '-', '-');
        showInputDialog({
            title: "Export content",
            confirmationLabel: "CREATE",
            label: "Export name",
            placeholder: defaultExportName,
            value: defaultExportName,
            callback: (value) => doCreateExport(value || defaultExportName)
        });
    }

    function doCreateExport(exportName) {
        const infoDialog = showInfoDialog("Exporting content...", exportWidgetContainer);
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-create',
            data: JSON.stringify({
                contentPath: config.contentPath,
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            if (handleResultError(result)) {
                new ExportResultDialog(result.success, 'content').init().
                    open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function loadExports() {
        const infoDialog = showInfoDialog("Loading selected exports...", exportWidgetContainer);
        const exportNames = tableCard.getSelectedRows().
            map((row) => row.attributes['export']);
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-load',
            data: JSON.stringify({
                contentPath: config.contentPath,
                exportNames: exportNames
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            if (handleResultError(result)) {
                new ImportResultDialog(exportNames, result.success, 'content').init().
                    open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function deleteExports() {
        showConfirmationDialog("Delete selected exports?", 'DELETE', doDeleteExports);
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
        const definition = 'A content export is a serialization of a given content and its children. ' +
                           'This makes content exports well suited for transferring a specific content to another installation. ' +
                           'Warning: The export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.11/operations/export.html">Export and Import</a> for more information.';

        const viewDefinition = 'This widget lists in a table all the exports located in $XP_HOME/data/export. ' +
                               'You can export the current content or upload previously archived exports. ' +
                               'Importing exports will import them as children under the current content. ' +
                               'You can also delete or archive (ZIP) and download existing exports.';

        new HelpDialog('Content Exports', [definition, viewDefinition]).
            init().
            addActionDefinition({
                iconSrc: config.assetsUrl + '/icons/export-icon.svg',
                definition: 'Export the current content into $XP_HOME/data/export/[export-name].'
            }).
            addActionDefinition({iconName: 'file_upload', definition: 'Upload archived exports and unzip them into $XP_HOME/data/export'}).
            addActionDefinition({
                iconSrc: config.assetsUrl + '/icons/import-icon.svg',
                definition: 'Import the selected exports. Their contents will be imported as children under the current content.'
            }).
            addActionDefinition({iconName: 'file_download', definition: 'Zip the selected exports and download the archive'}).
            addActionDefinition({iconName: 'delete', definition: 'Delete the selected exports.'}).
            open();
    }

    function handleResultError(result) {
        if (result.error) {
            console.log(result.error);
            new RcdMaterialSnackbar(result.error).init().open(exportWidgetContainer);
            return false;
        }
        return true;
    }

    function handleAjaxError(jqXHR) {
        let errorMessage;
        if (jqXHR.status) {
            errorMessage = 'Error ' + jqXHR.status + ': ' + jqXHR.statusText;
        } else {
            errorMessage = 'Connection refused';
        }
        console.log(errorMessage);
        new RcdMaterialSnackbar(errorMessage).
            init().open(exportWidgetContainer);
    }

    function showInfoDialog(text) {
        return new RcdMaterialInfoDialog({text: text}).
            init().
            open(exportWidgetContainer);
    }

    function showConfirmationDialog(text, confirmationLabel, callback) {
        return new RcdMaterialConfirmationDialog({text: text, confirmationLabel: confirmationLabel, callback: callback}).
            init().
            open();
    }

    function showInputDialog(params) {
        return new RcdMaterialInputDialog(params).
            init().
            open();
    }

    function showSelectionDialog(params) {
        return new RcdMaterialSelectionDialog(params).
            init().
            open();
    }

    function showDetailsDialog(title, text, callback) {
        return new RcdMaterialDetailsDialog({title: title, text: text, callback: callback}).
            init().
            open();
    }
}());


