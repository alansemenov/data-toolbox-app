var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Export name');

var createExportIcon = new RcdMaterialActionIcon('add', createExport).init();
var deleteExportsIcon = new RcdMaterialActionIcon('delete', deleteExports).init().enable(false);
var loadExportsIcon = new RcdMaterialActionIcon('refresh', loadExports).init().enable(false);
var downloadExportsIcon = new RcdMaterialActionIcon('file_download', dowloadExports).init().enable(false);
var uploadExportsIcon = new RcdMaterialActionIcon('file_upload', uploadExports).init().enable(false);

exportsTable.addSelectionListener((nbRowsSelected) => {
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
    console.log(exportWidgetContainer);
    if (exportWidgetContainer) {
        exportWidgetContainer.appendChild(card.domElement);
        clearInterval(interval);
    }
}, 100);


function retrieveExports() {
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (result) {
        exportsTable.body.clear();
        result.success.forEach((anExport) => {
            exportsTable.body.createRow().
                addCell(anExport.name).
                setAttribute('export', anExport.name);
        });
    });
}

function createExport() {
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-create',
        data: JSON.stringify({
            contentPath: config.contentPath,
            exportName: config.contentName + '-' + new Date().toISOString()
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        retrieveExports();
    });
}

function loadExports() {
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
        retrieveExports();
    });
}

function deleteExports() {
    var exportNames = exportsTable.getSelectedRows().
        map((row) => row.attributes['export']);
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/export-delete',
        data: JSON.stringify({exportNames: exportNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
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
        setAttribute('action', '/admin/rest/datatoolbox/export/download').
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
        setAttribute('action', config.servicesUrl + '/export-upload').
        setAttribute('method', 'post').
        setAttribute('enctype', 'multipart/form-data').
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadExports() {
    exportWidgetContainer.appendChild(uploadForm.getDomElement());
    uploadForm.submit();
    exportWidgetContainer.removeChild(uploadForm.getDomElement());
}


