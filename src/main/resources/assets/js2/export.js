var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Export name');

var card = new RcdMaterialCard('Exports').
    init().
    addIcon('file_download', () => {
    }).
    addIcon('file_upload', () => {
    }).
    addIcon('delete', () => {
    }).
    addContent(exportsTable);


setTimeout(() => {
    document.getElementById('exportWidgetContainer').appendChild(card.domElement);
}, 300);

function retrieveExports() {
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (exports) {
        exportsTable.body.clear();
        exports.forEach((anExport) => {
            exportsTable.body.createRow().
                addCell(anExport.name).
                setAttribute('export', anExport.name);
        });
    });
}

retrieveExports();

