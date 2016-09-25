var exportsTable = new RcdMaterialTable().init();
exportsTable.header.addCell('Dump name');

var card = new RcdMaterialCard('Export').
    init().
    addIcon('file_download', () => {
    }).
    addIcon('file_upload', () => {
    }).
    addIcon('delete', () => {
    }).
    addContent(exportsTable);

var widgetBody = document.currentScript.parentElement;
widgetBody.appendChild(card.domElement);


function retrieveExports() {
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (exports) {
        exportsTable.body.clear();
        exports.forEach((anExport) => {
            exportsTable.body.createRow().
                addCell(anExport.name).
                setAttribute('dump', anExport.name);
        });
    });
}
retrieveExports();

