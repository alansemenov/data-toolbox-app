function createNodesRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init();

    const tableCard = new RcdMaterialTableCard('Nodes').init().
        addColumn('Node name').
        addColumn('Node ID').
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteNodes).init(), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'nodes',
        callback: (main) => {
            refreshBreadcrumbs();
            retrieveNodes();
            app.setTitle(RcdHistoryRouter.getParameters().repo);
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
                    const row = tableCard.createRow().
                        addCell(node._name).
                        addCell(node._id).
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

            if (path !== '/') {
                let currentPath = '';
                path.substring(1).split('/').forEach((subPathElement, index, array) => {
                    currentPath += '/' + subPathElement;
                    const constCurrentPath = currentPath;
                    breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement, index < array.length - 1
                        ? (() => RcdHistoryRouter.setState('nodes?repo=' + repositoryName + '&branch=' + branchName +
                                                                         '&path=' + constCurrentPath))
                        : undefined).init());
                });
            }
        }
    }
}
