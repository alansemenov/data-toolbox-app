var nodesTable = createNodesTable();
var nodesTableNoContent = new RcdMaterialTableNoContent('No child node found').init();
var nodesTableNav = new RcdMaterialTableNav(navigateBefore, navigateAfter).init();
var nodesCard = createNodesCard();
var nodesView = createNodesView();

function createNodesTable() {
    var nodesTable = new RcdMaterialTable().init();
    nodesTable.header.addCell('Node name').
        addCell('Node ID').
        addCell('');
    return nodesTable;
}

function navigateBefore() {
    navigate(false);
}

function navigateAfter() {
    navigate(true);
}

function navigate(after) {
    var repositoryName = router.getParameters().repo;
    var branchName = router.getParameters().branch;
    var path = router.getParameters().path;
    var start = router.getParameters().start ? parseInt(router.getParameters().start) : 0;
    var count = router.getParameters().count ? parseInt(router.getParameters().count) : 50;
    start = after ? start + count : Math.max(0, start - count);
    router.setState('nodes?repo=' + repositoryName + '&branch=' + branchName + (path ? '&path=' + path : '') + '&start=' + start +
                    '&count=' + count);
}

function createNodesCard() {
    var exportNodeIcon = new RcdMaterialActionIcon('save', exportNode).init().setTooltip('Export node').enable(false);
    var importNodeIcon = new RcdMaterialActionIcon('refresh', importNode).init().setTooltip('Import node').enable(false);
    var deleteNodeIcon = new RcdMaterialActionIcon('delete', deleteNodes).init().setTooltip('Delete node').enable(false);
    nodesTable.addSelectionListener(() => {
        var nbRowsSelected = nodesTable.getSelectedRows().length;
        exportNodeIcon.enable(nbRowsSelected == 1);
        importNodeIcon.enable(nbRowsSelected == 0);
        deleteNodeIcon.enable(nbRowsSelected > 0);
    });

    return new RcdMaterialCard('Nodes').
        init().
        addIcon(exportNodeIcon).
        addIcon(importNodeIcon).
        addIcon(deleteNodeIcon).
        addContent(nodesTable).
        addChild(nodesTableNoContent).
        addChild(nodesTableNav);
}

function createNodesView() {
    //Creates the node view
    var nodesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Nodes'}];
    var nodesViewDescription = 'A Node represents a single storable entity of data. ' +
                               'It can be compared to a row in sql or a document in document oriented storage models. ' +
                               'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/nodes.html">Nodes</a> for more information. ' +
                               'The nodes are represented here in a tree structure. ' +
                               'While this solution is adapted to repositories like cms-repo or system-repo, ' +
                               'it may be problematic for repositories not following a tree structure or for nodes with too many children. ' +
                               'If you need a tool to browse these repositories or if you need browsing based on queries, we recommend using the tool <a href="https://market.enonic.com/vendors/runar-myklebust/repoxplorer">repoXPlorer</a>.' +
                               '';
    return new RcdMaterialView('nodes', nodesViewPathElements, nodesViewDescription).
        init().
        addChild(nodesCard);
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

function exportNode() {
    var nodeName = router.getParameters().path
        ? (nodesTable.getSelectedRows().map((row) => row.attributes['name'])[0] || 'export')
        : router.getParameters().repo + '-' + router.getParameters().branch;
    var defaultExportName = nodeName + '-' + toLocalDateTimeFormat(new Date(), '-', '-');
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
    var infoDialog = showInfoDialog("Exporting node...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-export',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            nodePath: nodesTable.getSelectedRows().map((row) => row.attributes['path'])[0],
            exportName: exportName
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('exports');
    });
}

function importNode() {
    var infoDialog = showInfoDialog("Retrieving exports...");
    return $.ajax({
        url: config.servicesUrl + '/export-list'
    }).done(function (result) {
        if (handleResultError(result)) {
            var exportNames = result.success.
                sort((export1, export2) => export1.timestamp - export2.timestamp).
                map((anExport) =>anExport.name);
            doImportNode(exportNames);
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function doImportNode(exportNames) {
    showSelectionDialog({
        title: "Import node",
        ok: "IMPORT",
        label: "Export name",
        options: exportNames,
        callback: (value) => doDoImportNode(value)
    });
}

function doDoImportNode(exportName) { //TODO Find proper naming convention
    var infoDialog = showInfoDialog("Importing node...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-import',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            nodePath: router.getParameters().path || '/',
            exportName: exportName
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function deleteNodes() {
    showConfirmationDialog("Delete selected nodes?", doDeleteNodes);
}

function doDeleteNodes() {
    var infoDialog = showInfoDialog("Deleting node...");
    var nodeKeys = nodesTable.getSelectedRows().map((row) => row.attributes['id']);
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
            nodesTableNoContent.display(result.success.hits.length == 0);
            result.success.hits.
                sort((node1, node2) => node1.name - node2.name).
                forEach((node) => {

                    var retrieveNodeInfoIcon = new RcdMaterialActionIcon('info', () => retrieveNodeInfo(node._id)).
                        init().
                        setTooltip('Display node details');
                    var row = nodesTable.body.createRow().
                        addCell(node._name).
                        addCell(node._id).
                        addIcon(retrieveNodeInfoIcon).
                        setAttribute('id', node._id).
                        setAttribute('path', node._path).
                        setAttribute('name', node._name).
                        addClass('clickable').
                        setClickListener(() => {
                            router.setState('nodes?repo=' + router.getParameters().repo + '&branch=' + router.getParameters().branch +
                                            '&path=' + node._path + '&start=0&count=50');
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation()); //TODO
                    row.icons.addClickListener((event) => event.stopPropagation()); //TODO

                });
            nodesTableNav.setValues(router.getParameters().start ? parseInt(router.getParameters().start) : 0, result.success.hits.length,
                result.success.total);
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
                var constCurrentPath = currentPath;
                pathElements.push({
                    name: subPathElement,
                    callback: index < array.length - 1
                        ? (() => router.setState('nodes?repo=' + repositoryName + '&branch=' + branchName + '&path=' + constCurrentPath))
                        : undefined
                });

            });
        }
    }

    view.setPathElements(pathElements);
}