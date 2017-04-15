(function () {
    //@widgetWorkAround@
    let tableCard;
    let exportWidgetContainer;
    const interval = setInterval(() => {
        exportWidgetContainer = document.getElementById('exportWidgetContainer');
        if (exportWidgetContainer) {
            tableCard = new RcdMaterialTableCard('Exports').init().
                addColumn('Export name').
                addIconArea(new RcdGoogleMaterialIconArea('add_circle', createExport).init().setTooltip('Export content', exportWidgetContainer), {max: 0}).
                addIconArea(new RcdGoogleMaterialIconArea('refresh', loadExports).init().setTooltip('Import selected exports', exportWidgetContainer), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('delete', deleteExports).init().setTooltip('Delete selected exports', exportWidgetContainer), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('file_download',
                    dowloadExports).init().setTooltip('Archive and download selected exports', exportWidgetContainer, RcdMaterialTooltipAlignment.RIGHT), {min: 1}).
                addIconArea(new RcdGoogleMaterialIconArea('file_upload', uploadExports).init().setTooltip('Upload and unarchive exports', exportWidgetContainer, RcdMaterialTooltipAlignment.RIGHT),
                {max: 0});
            
            retrieveExports();
            tableCard.setParent(exportWidgetContainer);
            clearInterval(interval);
        }
    }, 200);

    function retrieveExports() {
        const infoDialog = showInfoDialog('Retrieving export list...');
        return $.ajax({
            url: config.servicesUrl + '/export-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((export1, export2) => export2.timestamp - export1.timestamp).
                    forEach((anExport) => {
                        tableCard.createRow().
                            addCell(anExport.name).
                            setAttribute('export', anExport.name);
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createExport() {
        const defaultExportName = config.contentName + '-' + toLocalDateTimeFormat(new Date(), '-', '-');
        showInputDialog({
            title: "Export content",
            ok: "CREATE",
            label: "Export name",
            placeholder: defaultExportName,
            value: defaultExportName,
            callback: (value) => doCreateExport(value || defaultExportName)
        });
    }

    function doCreateExport(exportName) {
        const infoDialog = showInfoDialog("Exporting content...", exportWidgetContainer);
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-create',
            data: JSON.stringify({
                contentPath: config.contentPath,
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function loadExports() {
        const infoDialog = showInfoDialog("Loading selected exports...", exportWidgetContainer);
        const exportNames = tableCard.getSelectedRows().
            map((row) => row.attributes['export']);
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-load',
            data: JSON.stringify({
                contentPath: config.contentPath,
                exportNames: exportNames
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function deleteExports() {
        showConfirmationDialog("Delete selected exports?", doDeleteExports);
    }

    function doDeleteExports() {
        const infoDialog = showInfoDialog("Deleting selected exports...");
        const exportNames = tableCard.getSelectedRows().map((row) => row.attributes['export']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-delete',
            data: JSON.stringify({exportNames: exportNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function dowloadExports() {
        const exportNames = tableCard.getSelectedRows().map((row) => row.attributes['export']);
        const exportNamesInput = new RcdInputElement().init().
            setAttribute('type', 'hidden').
            setAttribute('name', 'exportNames').
            setAttribute('value', exportNames);
        const downloadForm = new RcdFormElement().init().
            setAttribute('action', config.servicesUrl + '/export-download').
            setAttribute('method', 'post').
            addChild(exportNamesInput);
        document.body.appendChild(downloadForm.getDomElement());
        downloadForm.submit();
        document.body.removeChild(downloadForm.getDomElement());
    }

    var uploadForm;

    function uploadExports() {
        const uploadFileInput = new RcdInputElement().init().
            setAttribute('type', 'file').
            setAttribute('name', 'uploadFile').
            addChangeListener(doUploadExports);
        uploadForm = new RcdFormElement().init().
            addChild(uploadFileInput);
        uploadFileInput.click();
    }

    function doUploadExports() {
        const infoDialog = showInfoDialog("Uploading export archive...");
        const formData = new FormData(uploadForm.getDomElement());
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/export-upload',
            data: formData,
            contentType: false,
            processData: false
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveExports();
        });
    }

    function handleResultError(result) {
        if (result.error) {
            new RcdMaterialSnackbar(result.error).init().open(exportWidgetContainer);
            return false;
        }
        return true;
    }

    function handleAjaxError(jqXHR) {
        if (jqXHR.status) {
            new RcdMaterialSnackbar('Error ' + jqXHR.status + ': ' + jqXHR.statusText).
                init().open(exportWidgetContainer);
        } else {
            new RcdMaterialSnackbar('Connection refused').
                init().open(exportWidgetContainer);
        }
    }

    function showInfoDialog(text) {
        return new RcdMaterialInfoDialog({text: text}).
            init().
            open(exportWidgetContainer);
    }

    function showConfirmationDialog(text, callback) {
        return new RcdMaterialConfirmationDialog({text: text, callback: callback}).
            init().
            open();
    }

    function showInputDialog(params) {
        return new RcdMaterialInputDialog(params).
            init().
            open();
    }

    function showSelectionDialog(params) {
        return new RcdMaterialSelectionDialog(params).
            init().
            open();
    }
}());


