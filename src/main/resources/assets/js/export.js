var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Export name');

var card = new RcdMaterialCard('Exports').
    init().
    addIcon('file_download', createExport).
    addIcon('file_upload', loadExports).
    addIcon('delete', deleteExports).
    addContent(exportsTable);

//TODO Forgive me these 3 next lines
setTimeout(() => {
    document.getElementById('exportWidgetContainer').appendChild(card.domElement);
}, 300);

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

retrieveExports();

