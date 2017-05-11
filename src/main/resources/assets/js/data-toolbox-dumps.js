function createDumpsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('System dumps').init());

    const tableCard = new RcdMaterialTableCard('System dumps').init().
        addColumn('Dump name').
        addColumn('Timestamp', {classes: ['non-mobile-cell']}).
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createDump).init().setTooltip('Create a system dump'), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('refresh', loadDumps).init().setTooltip('Load selected system dumps'), {min: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('file_download',
            dowloadDumps).init().setTooltip('Archive and download selected system dumps'), {min: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('file_upload', uploadDumps).init().setTooltip('Upload and unarchive system dumps',
            undefined, RcdMaterialTooltipAlignment.RIGHT), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteDumps).init().setTooltip('Delete selected system dumps', undefined,
            RcdMaterialTooltipAlignment.RIGHT), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'dumps',
        name: 'System Dumps',
        iconArea: new RcdGoogleMaterialIconArea('file_download').init(),
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveDumps();
        }
    };

    function retrieveDumps() {
        const infoDialog = showInfoDialog('Retrieving dump list...');
        return $.ajax({
            url: config.servicesUrl + '/dump-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((dump1, dump2) => dump2.timestamp - dump1.timestamp).
                    forEach((dump) => {
                        tableCard.createRow().
                            addCell(dump.name).
                            addCell(toLocalDateTimeFormat(new Date(dump.timestamp)), {classes: ['non-mobile-cell']}).
                            setAttribute('dump', dump.name);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createDump() {
        const defaultDumpName = 'dump-' + toLocalDateTimeFormat(new Date(), '-', '-');
        new RcdMaterialInputDialog({
            title: 'Create dump',
            label: 'Dump name',
            placeholder: defaultDumpName,
            value: defaultDumpName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateDump(value || defaultDumpName)
        }).init().open();
    }

    function doCreateDump(dumpName) {
        const infoDialog = showInfoDialog('Creating dump...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-create',
            data: JSON.stringify({
                dumpName: dumpName || ('dump-' + toLocalDateTimeFormat(new Date(), '-', '-'))
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }

    function deleteDumps() {
        showConfirmationDialog("Delete selected dumps?", doDeleteDumps);
    }

    function doDeleteDumps() {
        const infoDialog = showInfoDialog("Deleting selected dumps...");
        const dumpNames = tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-delete',
            data: JSON.stringify({dumpNames: dumpNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }

    function loadDumps() {
        const infoDialog = showInfoDialog("Loading dumps...");
        const dumpNames = tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-load',
            data: JSON.stringify({dumpNames: dumpNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function dowloadDumps() {
        const dumpNames = tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        const dumpNamesInput = new RcdInputElement().init().
            setAttribute('type', 'hidden').
            setAttribute('name', 'dumpNames').
            setAttribute('value', dumpNames);
        const downloadForm = new RcdFormElement().init().
            setAttribute('action', config.servicesUrl + '/dump-download').
            setAttribute('method', 'post').
            addChild(dumpNamesInput);
        document.body.appendChild(downloadForm.getDomElement());
        downloadForm.submit();
        document.body.removeChild(downloadForm.getDomElement());
    }

    var uploadForm;

    function uploadDumps() {
        const uploadFileInput = new RcdInputElement().init().
            setAttribute('type', 'file').
            setAttribute('name', 'uploadFile').
            addChangeListener(doUploadDumps);
        uploadForm = new RcdFormElement().init().
            addChild(uploadFileInput);
        uploadFileInput.click();
    }

    function doUploadDumps() {
        const infoDialog = showInfoDialog("Uploading dump archive...");
        const formData = new FormData(uploadForm.getDomElement());
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-upload',
            data: formData,
            contentType: false,
            processData: false
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveDumps();
        });
    }
}
