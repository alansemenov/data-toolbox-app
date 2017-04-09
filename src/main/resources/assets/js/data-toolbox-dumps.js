function createDumpsRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.getInstance().setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('Dumps').init());

    const tableCard = new RcdMaterialTableCard('Dumps').init().
        addColumn('Dump name').
        addColumn('Timestamp').
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createDump).init(), {max: 0});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'dumps',
        name: 'Dumps',
        iconArea: new RcdGoogleMaterialIconArea('file_download').init(),
        callback: (main) => main.addChild(breadcrumbsLayout).
            addChild(layout)
    };
    
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
        const loaderDialog = new RcdMaterialTextualLoaderDialog({
            text: 'Creating dump...'
        }).init().open();
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-create',
            data: JSON.stringify({
                dumpName: dumpName || ('dump-' + toLocalDateTimeFormat(new Date(), '-', '-'))
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            loaderDialog.close();
            RcdHistoryRouter.getInstance().refreshState();
        });
    }
}
