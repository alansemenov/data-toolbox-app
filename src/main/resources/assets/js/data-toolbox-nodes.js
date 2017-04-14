function createNodesRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init();

    const tableCard = new RcdMaterialTableCard('Nodes').init().
        addColumn('Node name').
        addColumn('Node ID').
        addColumn('', {icon: true}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteNodes).init().setTooltip('Delete selected nodes'), {min: 1}).
        addIconArea(new RcdGoogleMaterialIconArea('info', () => retrieveNodeInfo()).init().setTooltip('Display selected node detail'),
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
                console.log('startInt:' + startInt);
                console.log('countInt:' + countInt);
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
