function createExportsTable() {
    var exportsTable = new RcdMaterialTable().init();
    exportsTable.header.addCell('Export name').
        addCell('Timestamp');
    return exportsTable;
}

function createExportsView(exportsTable) {
    //Creates the export view
    var exportsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Exports'}];
    var exportsViewDescription = 'An export is a serialization of a given content/node. ' +
                                 'While the export/import focuses on a given content, the dump/load is used to export an entire system (all repositories and branches). ' +
                                 'This makes exports well suited for transfering a specific to another installation. ' +
                                 'Warning: The current export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                                 'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.';
    var exportsView = new RcdMaterialView('exports', exportsViewPathElements, exportsViewDescription).init();

    var deleteExportIcon = new RcdMaterialActionIcon('delete', deleteExports).init().setTooltip('Delete export').enable(false);
    var downloadExportIcon = new RcdMaterialActionIcon('file_download', dowloadExports).init().setTooltip('Download export').enable(false);
    var uploadExportIcon = new RcdMaterialActionIcon('file_upload', uploadExport).init().setTooltip('Upload export').enable(false);

    exportsTable.addSelectionListener(() => {
        var nbRowsSelected = exportsTable.getSelectedRows().length;
        deleteExportIcon.enable(nbRowsSelected > 0);
        downloadExportIcon.enable(nbRowsSelected > 0);
        uploadExportIcon.enable(nbRowsSelected == 0);
    });

    var exportsCard = new RcdMaterialCard('Exports').
        init().
        addIcon(deleteExportIcon).
        addIcon(downloadExportIcon).
        addIcon(uploadExportIcon).
        addContent(exportsTable);

    exportsView.addChild(exportsCard);

    return exportsView;
}

function deleteExports() {
    showConfirmationDialog("Delete selected exports?", doDeleteExports);
}

function doDeleteExports() {
    var infoDialog = showInfoDialog("Deleting export...");
    var exportNames = exportsTable.getSelectedRows().map((row) => row.attributes['export']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-delete',
        data: JSON.stringify({exportNames: exportNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('exports');
    });
}

function retrieveExports() {
    var infoDialog = showInfoDialog("Retrieving exports...");
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (result) {
        exportsTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((export1, export2) => export1.timestamp - export2.timestamp).
                forEach((anExport) => {
                    exportsTable.body.createRow().
                        addCell(anExport.name).
                        //addCell(export.size.toLocaleString()).
                        addCell(toLocalDateTimeFormat(new Date(anExport.timestamp))).
                        setAttribute('export', anExport.name);
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function dowloadExports() {
    var exportNames = exportsTable.getSelectedRows().
        map((row) => row.attributes['export']);

    var exportNamesInput = new RcdInputElement().init().
        setAttribute('type', 'hidden').
        setAttribute('name', 'exportNames').
        setAttribute('value', exportNames);

    var downloadForm = new RcdFormElement().init().
        setAttribute('action', config.servicesUrl + '/export-download').
        setAttribute('method', 'post').
        addChild(exportNamesInput);

    document.body.appendChild(downloadForm.getDomElement());
    downloadForm.submit();
    document.body.removeChild(downloadForm.getDomElement());
}

var uploadForm;
function uploadExport() {
    var uploadFileInput = new RcdInputElement().init().
        setAttribute('type', 'file').
        setAttribute('name', 'uploadFile').
        addChangeListener(doUploadExport);

    uploadForm = new RcdFormElement().init().
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadExport() {
    var infoDialog = showInfoDialog("Uploading export...");
    var formData = new FormData(uploadForm.getDomElement());
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-upload',
        data: formData,
        contentType: false,
        processData: false
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('exports');
    });
}