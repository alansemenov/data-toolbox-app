var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Export name');

var createExportIcon = new RcdMaterialActionIcon('file_download', createExport).init();
var loadExportsIcon = new RcdMaterialActionIcon('file_upload', loadExports).init().enable(false);
var deleteExportsIcon = new RcdMaterialActionIcon('delete', deleteExports).init().enable(false);

exportsTable.addSelectionListener((nbRowsSelected) => {
    createExportIcon.enable(nbRowsSelected == 0);
    loadExportsIcon.enable(nbRowsSelected > 0);
    deleteExportsIcon.enable(nbRowsSelected > 0);
});

var card = new RcdMaterialCard('Exports').
    init().
    addIcon(createExportIcon).
    addIcon(loadExportsIcon).
    addIcon(deleteExportsIcon).
    addContent(exportsTable);

retrieveExports();

var interval = setInterval(() => {
    var exportWidgetContainer = document.getElementById('exportWidgetContainer');
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


