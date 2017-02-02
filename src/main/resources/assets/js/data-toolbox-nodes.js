function createNodesTable() {
    var nodesTable = new RcdMaterialTable().init();
    nodesTable.header.addCell('Node name').
        addCell('Node ID').
        addCell('');
    return nodesTable;
}

function createNodesView(nodesTable) {
    //Creates the node view
    var nodesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Nodes'}];
    var nodesViewDescription = 'TODO: Define nodes.';
    var nodesView = new RcdMaterialView('nodes', nodesViewPathElements, nodesViewDescription).init();

    var deleteNodeIcon = new RcdMaterialActionIcon('delete', deleteNodes).init().setTooltip('Delete node').enable(false);

    nodesTable.addSelectionListener(() => {
        var nbRowsSelected = nodesTable.getSelectedRows().length;
        deleteNodeIcon.enable(nbRowsSelected > 0);
    });

    var nodesCard = new RcdMaterialCard('Nodes').
        init().
        addIcon(deleteNodeIcon).
        addContent(nodesTable);

    nodesView.addChild(nodesCard);

    return nodesView;
}

function retrieveNodeInfo(nodeKey) {
    var infoDialog = showInfoDialog("Retrieving node info...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-get',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            key: nodeKey
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (result) {
        console.log(result);
        if (handleResultError(result)) {
            showDetailsDialog({text: JSON.stringify(result.success, null, 2), title: 'Node [' + nodeKey + ']'});
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function deleteNodes() {
    showConfirmationDialog("Delete selected nodes?", doDeleteNodes);
}

function doDeleteNodes() {
    var infoDialog = showInfoDialog("Deleting node...");
    var nodeKeys = nodesTable.getSelectedRows().map((row) => row.attributes['node']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-delete',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            keys: nodeKeys
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function retrieveNodes() {
    var infoDialog = showInfoDialog("Retrieving nodes...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-getchildren',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            parentPath: router.getParameters().path,
            start: router.getParameters().start,
            count: router.getParameters().count
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (result) {
        nodesTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((node1, node2) => node1.name - node2.name).
                forEach((node) => {

                    var retrieveNodeInfoIcon = new RcdMaterialActionIcon('info', () => retrieveNodeInfo(node._id)).
                        init().
                        setTooltip('Retrieve node info');
                    var row = nodesTable.body.createRow().
                        addCell(node._name).
                        addCell(node._id).
                        addIcon(retrieveNodeInfoIcon).
                        setAttribute('node', node._id).
                        addClass('clickable').
                        setClickListener(() => {
                            router.setState('nodes?repo=' + router.getParameters().repo + '&branch=' + router.getParameters().branch +
                                            '&path=' + node._path + '&start=0&count=50');
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation()); //TODO
                    row.icons.addClickListener((event) => event.stopPropagation()); //TODO

                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function refreshNodesViewTitle(view) {
    var repositoryName = router.getParameters().repo;
    var branchName = router.getParameters().branch;
    var path = router.getParameters().path;

    var pathElements = [{name: 'Data Toolbox', callback: () => router.setState()},
        {name: 'Repositories', callback: () => router.setState('repositories')},
        {name: repositoryName, callback: () => router.setState('branches?repo=' + repositoryName)},
        {name: branchName, callback: path && (() => router.setState('nodes?repo=' + repositoryName + '&branch=' + branchName))}];

    if (path) {
        pathElements.push({
            name: 'root',
            callback: path !== '/'
                ? (() => router.setState('nodes?repo=' + repositoryName + '&branch=' + branchName + '&path=/'))
                : undefined
        });


        if (path !== '/') {
            var currentPath = '';
            path.substring(1).split('/').forEach((subPathElement, index, array) => {
                currentPath += '/' + subPathElement;
                pathElements.push({
                    name: subPathElement,
                    callback: index < array.length - 1
                        ? (() => router.setState('nodes?repo=' + repositoryName + '&branch=' + branchName + '&path=' + currentPath))
                        : undefined
                });

            });
        }
    }

    view.setPathElements(pathElements);
}