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
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveDumps();
        }
    };

    function retrieveDumps() {
        const infoDialog = new RcdMaterialInfoDialog({text: 'Retrieving dump list...'}).init().open();
        return $.ajax({
            url: config.servicesUrl + '/dump-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((dump1, dump2) => dump2.timestamp - dump1.timestamp).
                    forEach((dump) => {
                        tableCard.createRow().
                            addCell(dump.name).
                            addCell(toLocalDateTimeFormat(new Date(dump.timestamp))).
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
        const infoDialog = new RcdMaterialInfoDialog({text: 'Creating dump...'}).init().open();
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
}
