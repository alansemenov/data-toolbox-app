const exportsTable = createExportsTable();
const exportsTableNoContent = new RcdMaterialTableNoContent('No export found').init();
const exportsView = createExportsView();

function createExportsTable() {
    const exportsTable = new RcdMaterialTable().init();
    exportsTable.header.addCell('Export name').
        addCell('Timestamp');
    return exportsTable;
}

function createExportsView() {
    //Creates the export view
    const exportsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Exports'}];
    const exportsViewDescription = 'An export is a serialization of a given content/node. ' +
                                   'While the export/import focuses on a given content, the dump/load is used to export an entire system (all repositories and branches). ' +
                                   'This makes exports well suited for transfering a specific content to another installation. ' +
                                   'Warning: The current export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                                   'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.';
    const exportsView = new RcdMaterialView('exports', exportsViewPathElements, exportsViewDescription).init();

    const deleteExportIcon = new RcdMaterialActionIcon('delete', deleteExports).init().setTooltip('Delete export').enable(false);
    const downloadExportIcon = new RcdMaterialActionIcon('file_download',
        dowloadExports).init().setTooltip('Download export').enable(false);
    const uploadExportIcon = new RcdMaterialActionIcon('file_upload', uploadExport).init().setTooltip('Upload export').enable(false);

    exportsTable.addSelectionListener(() => {
        const nbRowsSelected = exportsTable.getSelectedRows().length;
        deleteExportIcon.enable(nbRowsSelected > 0);
        downloadExportIcon.enable(nbRowsSelected > 0);
        uploadExportIcon.enable(nbRowsSelected == 0);
    });

    const exportsCard = new RcdMaterialCard('Exports').
        init().
        addIcon(deleteExportIcon).
        addIcon(downloadExportIcon).
        addIcon(uploadExportIcon).
        addContent(exportsTable).
        addChild(exportsTableNoContent);

    exportsView.addChild(exportsCard);

    return exportsView;
}

function deleteExports() {
    showConfirmationDialog("Delete selected exports?", doDeleteExports);
}

function doDeleteExports() {
    const infoDialog = showInfoDialog("Deleting export...");
    const exportNames = exportsTable.getSelectedRows().map((row) => row.attributes['export']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-delete',
        data: JSON.stringify({exportNames: exportNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function retrieveExports() {
    const infoDialog = showInfoDialog("Retrieving exports...");
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (result) {
        exportsTable.body.clear();
        if (handleResultError(result)) {
            exportsTableNoContent.show(result.success.length == 0);
            result.success.
                sort((export1, export2) => export2.timestamp - export1.timestamp).
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
    const exportNames = exportsTable.getSelectedRows().
        map((row) => row.attributes['export']);

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
function uploadExport() {
    const uploadFileInput = new RcdInputElement().init().
        setAttribute('type', 'file').
        setAttribute('name', 'uploadFile').
        addChangeListener(doUploadExport);

    uploadForm = new RcdFormElement().init().
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadExport() {
    const infoDialog = showInfoDialog("Uploading export...");
    const formData = new FormData(uploadForm.getDomElement());
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-upload',
        data: formData,
        contentType: false,
        processData: false
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}