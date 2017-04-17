function createNodesRoute() {

    class RcdMaterialNodeImportResultDialog extends RcdMaterialModalDialog {
        constructor(exportName, importResult) {
            super('[' + exportName + '] import result', 'Added nodes: ' + importResult.addedNodes.length + '\n' +
                                                        'Updated nodes: ' + importResult.updatedNodes.length + '\n' +
                                                        'Imported binaries: ' + importResult.importedBinaries.length + '\n' +
                                                        'Errors: ' + importResult.errors.length, true);
            this.exportName = exportName;
            this.result = importResult;
        }

        init() {
            const closeCallback = () =>  this.close();
            const detailsCallback = () => {
                this.close();
                showDetailsDialog('[' + this.exportName + '] import result details', JSON.stringify(this.result, null, 2));
            };
            super.init().
                addAction('CLOSE', closeCallback).
                addAction('DETAILS', detailsCallback).
                addKeyUpListener('Enter', detailsCallback).
                addKeyUpListener('Escape', closeCallback);
            return this;
        }
    }

    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init();

    const tableCard = new RcdMaterialTableCard('Nodes').init().
        addColumn('Node name').
        addColumn('Node ID').
        addColumn('', {icon: true}).
        addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/import-icon.svg', importNode).init().setTooltip('Import node export',
            undefined, RcdMaterialTooltipAlignment.RIGHT),
        {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('info', () => retrieveNodeInfo()).init().setTooltip('Display selected node detail'),
        {min: 1, max: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteNodes).init().setTooltip('Delete selected nodes'), {min: 1}).
        addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/export-icon.svg', exportNode).init().setTooltip('Export selected node',
            undefined, RcdMaterialTooltipAlignment.RIGHT),
        {min: 1, max: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'nodes',
        callback: (main) => {
            refreshBreadcrumbs();
            retrieveNodes();
            main.addChild(breadcrumbsLayout).addChild(layout);
        }
    };

    function retrieveNodes() {
        const infoDialog = showInfoDialog('Retrieving node list...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-getchildren',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: RcdHistoryRouter.getParameters().branch,
                parentPath: RcdHistoryRouter.getParameters().path,
                start: RcdHistoryRouter.getParameters().start,
                count: RcdHistoryRouter.getParameters().count
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.hits.forEach((node) => {

                    const retrieveNodeInfoIcon = new RcdGoogleMaterialIconArea('info', (source, event) => {
                        retrieveNodeInfo(node._id);
                        event.stopPropagation();
                    }).
                        init().
                        setTooltip('Display node details');

                    const row = tableCard.createRow().
                        addCell(node._name).
                        addCell(node._id).
                        addCell(retrieveNodeInfoIcon, {icon: true}).
                        setAttribute('id', node._id).
                        setAttribute('path', node._path).
                        setAttribute('name', node._name).
                        addClass('rcd-clickable').
                        addClickListener(() => {
                            RcdHistoryRouter.
                                setState('nodes?repo=' + RcdHistoryRouter.getParameters().repo + '&branch=' +
                                         RcdHistoryRouter.getParameters().branch +
                                         '&path=' + node._path + '&start=0&count=50');
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation());
                });

                const startInt = parseInt(RcdHistoryRouter.getParameters().start);
                const countInt = parseInt(RcdHistoryRouter.getParameters().count);
                const previousCallback = () => RcdHistoryRouter.
                    setState('nodes?repo=' + RcdHistoryRouter.getParameters().repo + '&branch=' + RcdHistoryRouter.getParameters().branch +
                             '&path=' + RcdHistoryRouter.getParameters().path +
                             '&start=' + Math.max(0, startInt - countInt) +
                             '&count=' + RcdHistoryRouter.getParameters().count);
                const nextCallback = () => RcdHistoryRouter.
                    setState('nodes?repo=' + RcdHistoryRouter.getParameters().repo + '&branch=' + RcdHistoryRouter.getParameters().branch +
                             '&path=' + RcdHistoryRouter.getParameters().path +
                             '&start=' + (startInt + countInt) +
                             '&count=' + RcdHistoryRouter.getParameters().count);
                tableCard.setFooter({
                    start: RcdHistoryRouter.getParameters().start ? parseInt(RcdHistoryRouter.getParameters().start) : 0,
                    count: result.success.hits.length,
                    total: result.success.total,
                    previousCallback: previousCallback,
                    nextCallback: nextCallback
                });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function deleteNodes() {
        showConfirmationDialog("Delete selected nodes?", doDeleteNodes);
    }

    function doDeleteNodes() {
        const infoDialog = showInfoDialog("Deleting selected nodes...");
        const nodeKeys = tableCard.getSelectedRows().map((row) => row.attributes['id']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-delete',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: RcdHistoryRouter.getParameters().branch,
                keys: nodeKeys
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveNodes();
        });
    }

    function retrieveNodeInfo(nodeKey) {
        if (!nodeKey) {
            nodeKey = tableCard.getSelectedRows().map((row) => row.attributes['id'])[0];
        }

        const infoDialog = showInfoDialog("Retrieving node info...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-get',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: RcdHistoryRouter.getParameters().branch,
                key: nodeKey
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            console.log(result);
            if (handleResultError(result)) {
                showDetailsDialog('Node [' + nodeKey + ']', JSON.stringify(result.success, null, 2));
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function exportNode() {
        const nodeName = RcdHistoryRouter.getParameters().path
            ? (tableCard.getSelectedRows().map((row) => row.attributes['name'])[0] || 'export')
            : RcdHistoryRouter.getParameters().repo + '-' + RcdHistoryRouter.getParameters().branch;
        const defaultExportName = nodeName + '-' + toLocalDateTimeFormat(new Date(), '-', '-');
        showInputDialog({
            title: "Export node",
            ok: "EXPORT",
            label: "Export name",
            placeholder: defaultExportName,
            value: defaultExportName,
            callback: (value) => doExportNode(value || defaultExportName)
        });
    }

    function doExportNode(exportName) {
        const infoDialog = showInfoDialog("Exporting selected node...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-export',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: RcdHistoryRouter.getParameters().branch,
                nodePath: tableCard.getSelectedRows().map((row) => row.attributes['path'])[0],
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            RcdHistoryRouter.setState('exports');
        });
    }

    function importNode() {
        const infoDialog = showInfoDialog("Retrieving node export list...");
        return $.ajax({
            url: config.servicesUrl + '/export-list'
        }).done(function (result) {
            if (handleResultError(result)) {
                const exportNames = result.success.
                    sort((export1, export2) => export2.timestamp - export1.timestamp).
                    map((anExport) =>anExport.name);
                selectNodeExport(exportNames);
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function selectNodeExport(exportNames) {
        showSelectionDialog({
            title: "Select node export",
            ok: "IMPORT",
            label: "Export name",
            options: exportNames,
            callback: (value) => doImportNode(value)
        });
    }

    function doImportNode(exportName) {
        const infoDialog = showInfoDialog("Importing node...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-import',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: RcdHistoryRouter.getParameters().branch,
                nodePath: RcdHistoryRouter.getParameters().path ||   '/',
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            if (handleResultError(result)) {
                const importResult = result.success[exportName];
                new RcdMaterialNodeImportResultDialog(exportName, importResult).init().open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            RcdHistoryRouter.refresh();
        });
    }

    function refreshBreadcrumbs() {
        const repositoryName = RcdHistoryRouter.getParameters().repo;
        const branchName = RcdHistoryRouter.getParameters().branch;
        const path = RcdHistoryRouter.getParameters().path;

        breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init(),
                new RcdMaterialBreadcrumb('Repositories', () => RcdHistoryRouter.setState('repositories')).init(),
                new RcdMaterialBreadcrumb(repositoryName,
                    () => RcdHistoryRouter.setState('branches?repo=' + repositoryName)).init(),
                new RcdMaterialBreadcrumb(branchName, path &&
                                                      (() => RcdHistoryRouter.setState('nodes?repo=' + repositoryName +
                                                                                       '&branch=' + branchName))).init()]);

        if (path) {
            breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb('root', path !== '/'
                ? (() => RcdHistoryRouter.setState('nodes?repo=' + repositoryName + '&branch=' + branchName + '&path=/'))
                : undefined).init());

            if (path === '/') {
                app.setTitle('Root node');
            } else {
                const pathElements = path.substring(1).split('/')
                app.setTitle(pathElements[pathElements.length - 1]);

                let currentPath = '';
                pathElements.forEach((subPathElement, index, array) => {
                    currentPath += '/' + subPathElement;
                    const constCurrentPath = currentPath;
                    breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement, index < array.length - 1
                        ? (() => RcdHistoryRouter.setState('nodes?repo=' + repositoryName + '&branch=' + branchName +
                                                           '&path=' + constCurrentPath))
                        : undefined).init());
                });

            }
        } else {
            app.setTitle(branchName);
        }
    }
}
