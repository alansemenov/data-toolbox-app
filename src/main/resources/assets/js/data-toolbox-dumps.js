function createDumpsTable() {
    var dumpsTable = new RcdMaterialTable().init();
    dumpsTable.header.addCell('Dump name').
        //addCell('Size (bytes)').
        addCell('Timestamp');
    return dumpsTable;
}

function createDumpsView(dumpsTable) {
    //Creates the dump view
    var dumpsViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Dumps'}];
    var dumpsViewDescription = 'A dump is an export of your data (contents, users, groups and roles) from your Enonic XP server to a serialized format. ' +
                               'While the export/import focuses on a given content, the dump/load is used to export an entire system (all repositories and branches). ' +
                               'This makes dumps well suited for migrating your data to another installation. ' +
                               'Warning: The current dump mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                               'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.';
    var dumpsView = new RcdMaterialView('dumps', dumpsViewPathElements, dumpsViewDescription).init();

    var createDumpIcon = new RcdMaterialActionIcon('add_circle', createDump).init().setTooltip('Create dump');
    var deleteDumpIcon = new RcdMaterialActionIcon('delete', deleteDumps).init().setTooltip('Delete dump').enable(false);
    var loadDumpIcon = new RcdMaterialActionIcon('refresh', loadDumps).init().setTooltip('Load dump').enable(false);
    var downloadDumpIcon = new RcdMaterialActionIcon('file_download', dowloadDumps).init().setTooltip('Download dump').enable(false);
    var uploadDumpIcon = new RcdMaterialActionIcon('file_upload', uploadDump).init().setTooltip('Upload dump').enable(false);

    dumpsTable.addSelectionListener(() => {
        var nbRowsSelected = dumpsTable.getSelectedRows().length;
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
    var defaultDumpName = 'dump-' + toLocalDateTimeFormat(new Date(), '-', '-');
    showInputDialog({
        title: "Create dump",
        ok: "CREATE",
        label: "Dump name",
        placeholder: defaultDumpName,
        value: defaultDumpName,
        callback: (value) => doCreateDump(value || defaultDumpName)
    });
}

function doCreateDump(dumpName) {
    var infoDialog = showInfoDialog("Creating dump...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-create',
        data: JSON.stringify({
            dumpName: dumpName || ('dump-' + toLocalDateTimeFormat(new Date(), '-', '-'))
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('dumps');
    });
}

function loadDumps() {
    var infoDialog = showInfoDialog("Loading dump...");
    var dumpNames = dumpsTable.getSelectedRows().map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-load',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('dumps');
    });
}

function deleteDumps() {
    showConfirmationDialog("Delete selected dumps?", doDeleteDumps);
}

function doDeleteDumps() {
    var infoDialog = showInfoDialog("Deleting dump...");
    var dumpNames = dumpsTable.getSelectedRows().map((row) => row.attributes['dump']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-delete',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('dumps');
    });
}

function retrieveDumps() {
    var infoDialog = showInfoDialog("Retrieving dumps...");
    return $.ajax({
        url: config.servicesUrl + '/dump-list'
    }).done(function (result) {
        dumpsTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((dump1, dump2) => dump1.timestamp - dump2.timestamp).
                forEach((dump) => {
                    dumpsTable.body.createRow().
                        addCell(dump.name).
                        //addCell(dump.size.toLocaleString()).
                        addCell(toLocalDateTimeFormat(new Date(dump.timestamp))).
                        setAttribute('dump', dump.name);
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
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
        setAttribute('action', config.servicesUrl + '/dump-download').
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
        addChangeListener(doUploadDump);

    uploadForm = new RcdFormElement().init().
        addChild(uploadFileInput);

    uploadFileInput.click();
}

function doUploadDump() {
    var infoDialog = showInfoDialog("Uploading dump...");
    var formData = new FormData(uploadForm.getDomElement());
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-upload',
        data: formData,
        contentType: false,
        processData: false
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('dumps');
    });
}