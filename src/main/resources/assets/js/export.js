var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Export name');

var createExportIcon = new RcdMaterialActionIcon('add_circle', createExport).init().setTooltip('Create export');
var deleteExportsIcon = new RcdMaterialActionIcon('delete', deleteExports).init().setTooltip('Delete export').enable(false);
var loadExportsIcon = new RcdMaterialActionIcon('refresh', loadExports).init().setTooltip('Load export').enable(false);
var downloadExportsIcon = new RcdMaterialActionIcon('file_download', dowloadExports).init().setTooltip('Dowload export').enable(false);
var uploadExportsIcon = new RcdMaterialActionIcon('file_upload', uploadExports).init().setTooltip('Upload export').enable(false);

exportsTable.addSelectionListener(() => {
    var nbRowsSelected = exportsTable.getSelectedRows().length;
    createExportIcon.enable(nbRowsSelected == 0);
    deleteExportsIcon.enable(nbRowsSelected > 0);
    loadExportsIcon.enable(nbRowsSelected > 0);
    downloadExportsIcon.enable(nbRowsSelected > 0);
    uploadExportsIcon.enable(nbRowsSelected == 0);
});

var card = new RcdMaterialCard('').
    init().
    addIcon(createExportIcon).
    addIcon(deleteExportsIcon).
    addIcon(loadExportsIcon).
    addIcon(downloadExportsIcon).
    addIcon(uploadExportsIcon).
    addContent(exportsTable);

retrieveExports();

var exportWidgetContainer;
var interval = setInterval(() => {
    exportWidgetContainer = document.getElementById('exportWidgetContainer');
    if (exportWidgetContainer) {
        exportWidgetContainer.appendChild(card.domElement);
        clearInterval(interval);
    }
}, 100);


function retrieveExports() {
    showInfoDialog("Retrieving exports...");
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (result) {
        exportsTable.body.clear();
        result.success.forEach((anExport) => {
            exportsTable.body.createRow().
                addCell(anExport.name).
                setAttribute('export', anExport.name);
        });
    }).always(function () {
        hideDialog();
        //TODO Check success & error
    });
}

function createExport() {
    showInfoDialog("Creating export...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-create',
        data: JSON.stringify({
            contentPath: config.contentPath,
            exportName: config.contentName + '-' + toLocalDateTimeFormat(new Date(), '-', '-')
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        hideDialog();
        retrieveExports();
    });
}

function loadExports() {
    showInfoDialog("Loading export...");
    var exportNames = exportsTable.getSelectedRows().
        map((row) => row.attributes['export']);
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-load',
        data: JSON.stringify({
            contentPath: config.contentPath,
            exportNames: exportNames
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        hideDialog();
        retrieveExports();
    });
}
function deleteExports() {
    showConfirmationDialog("Delete selected exports?", doDeleteExports);
}

function doDeleteExports() {
    showInfoDialog("Deleting export...");
    var exportNames = exportsTable.getSelectedRows().
        map((row) => row.attributes['export']);
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-delete',
        data: JSON.stringify({exportNames: exportNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        hideDialog();
        retrieveExports();
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

    exportWidgetContainer.appendChild(downloadForm.getDomElement());
    downloadForm.submit();
    exportWidgetContainer.removeChild(downloadForm.getDomElement());
}


var uploadForm;
function uploadExports() {
    var uploadFileInput = new RcdInputElement().init().
        setAttribute('type', 'file').
        setAttribute('name', 'uploadFile').
        setAttribute('onChange', 'doUploadExports()');

    uploadForm = new RcdFormElement().init().
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadExports() {
    showInfoDialog("Uploading export...");
    var formData = new FormData(uploadForm.getDomElement());
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-upload',
        data: formData,
        contentType: false,
        processData: false
    }).always(function () {
        hideDialog();
        //TODO Check success & error
        retrieveExports();
    });
}


