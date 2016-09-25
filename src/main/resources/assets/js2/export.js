var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Dump name').addCell('Size (bytes)').addCell('Timestamp');

var card = new RcdMaterialCard('Export').
    init().
    addIcon('file_download', () => {
    }).
    addIcon('file_upload', () => {
    }).
    addIcon('delete', () => {
    }).
    addContent(exportsTable);


function retrieveExports() {
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (exports) {
        exportsTable.body.clear();
        exports.forEach((anExport) => {
            exportsTable.body.createRow().
                addCell(anExport.name).
                addCell(anExport.size.toLocaleString()).
                addCell(new Date(anExport.timestamp).toISOString()).
                setAttribute('dump', anExport.name);
        });
    });
}
retrieveExports();

var widgetBody = document.currentScript.parentElement;
widgetBody.appendChild(card.domElement);