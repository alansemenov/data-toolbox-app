function createDumpsTable() {
    var dumpsTable = new RcdMaterialTable().init();
    dumpsTable.header.addCell('Dump name').addCell('Size (bytes)').addCell('Timestamp');
    return dumpsTable;
}

function createDumpsView(dumpsTable) {
    //Creates the dump view
    var dumpsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Dumps'}];
    var dumpsViewDescription = 'To secure your data or migrate it to another installation, a dump of your installation can be made. ' +
                               'This dump includes all the current versions of your content, users, groups and roles.';
    var dumpsView = new RcdMaterialView('dumps', dumpsViewPathElements, dumpsViewDescription).init();

    var createDumpIcon = new RcdMaterialActionIcon('add', createDump).init();
    var deleteDumpIcon = new RcdMaterialActionIcon('delete', deleteDumps).init().enable(false);
    var loadDumpIcon = new RcdMaterialActionIcon('refresh', loadDumps).init().enable(false);
    var downloadDumpIcon = new RcdMaterialActionIcon('file_download', dowloadDumps).init().enable(false);
    var uploadDumpIcon = new RcdMaterialActionIcon('file_upload', uploadDump).init().enable(false);

    dumpsTable.addSelectionListener((nbRowsSelected) => {
        createDumpIcon.enable(nbRowsSelected == 0);
        deleteDumpIcon.enable(nbRowsSelected > 0);
        loadDumpIcon.enable(nbRowsSelected > 0);
        downloadDumpIcon.enable(nbRowsSelected > 0);
        uploadDumpIcon.enable(nbRowsSelected == 0);
    });

    var dumpsCard = new RcdMaterialCard('Dumps').
        init().
        addIcon(createDumpIcon).
        addIcon(deleteDumpIcon).
        addIcon(loadDumpIcon).
        addIcon(downloadDumpIcon).
        addIcon(uploadDumpIcon).
        addContent(dumpsTable);

    dumpsView.addChild(dumpsCard);

    return dumpsView;
}

function createDump() {
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-create',
        data: JSON.stringify({
            dumpName: 'dump-' + new Date().toISOString()
        }),
        contentType: 'application/json; charset=utf-8'
    }).always(() => {
        //TODO Check success & error
        router.setState('dumps');
    });
}

function loadDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-load',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        //TODO Check success & error
        router.setState('dumps');
    });
}

function deleteDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-delete',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        //TODO Check success & error
        router.setState('dumps');
    });
}

function retrieveDumps() {
    return $.ajax({
        url: config.servicesUrl + '/dump-list'
    }).done(function (result) {
        dumpsTable.body.clear();
        //TODO Check success & error
        result.success.forEach((dump) => {
            dumpsTable.body.createRow().
                addCell(dump.name).
                addCell(dump.size.toLocaleString()).
                addCell(new Date(dump.timestamp).toISOString()).
                setAttribute('dump', dump.name);
        });
    });
}

function dowloadDumps() {
    var dumpNames = dumpsTable.getSelectedRows().
        map((row) => row.attributes['dump']);

    var dumpNamesInput = new RcdInputElement().init().
        setAttribute('type', 'hidden').
        setAttribute('name', 'dumpNames').
        setAttribute('value', dumpNames);

    var downloadForm = new RcdFormElement().init().
        setAttribute('action', '/admin/rest/datatoolbox/dump/download').
        setAttribute('method', 'post').
        addChild(dumpNamesInput);

    document.body.appendChild(downloadForm.getDomElement());
    downloadForm.submit();
    document.body.removeChild(downloadForm.getDomElement());
}


var uploadForm;
function uploadDump() {
    var uploadFileInput = new RcdInputElement().init().
        setAttribute('type', 'file').
        setAttribute('name', 'uploadFile').
        setAttribute('onChange', 'doUploadDump()');

    uploadForm = new RcdFormElement().init().
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadDump() {
    var formData = new FormData(uploadForm.getDomElement());
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-upload',
        data: formData,
        contentType: false,
        processData: false
    }).always(function () {
        //TODO Check success & error
        router.setState('dumps');
    });
}