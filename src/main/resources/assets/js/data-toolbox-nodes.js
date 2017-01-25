function createNodesTable() {
    var nodesTable = new RcdMaterialTable().init();
    nodesTable.header.addCell('Node ID').addCell('Node name');
    return nodesTable;
}

function createNodesView(nodesTable) {
    //Creates the node view
    var nodesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Nodes'}];
    var nodesViewDescription = 'TODO: Define nodes.';
    var nodesView = new RcdMaterialView('nodes', nodesViewPathElements, nodesViewDescription).init();

    var createNodeIcon = new RcdMaterialActionIcon('add_circle', createNode).init().setTooltip('Create node');
    var deleteNodeIcon = new RcdMaterialActionIcon('delete', deleteNodes).init().setTooltip('Delete node').enable(false);

    nodesTable.addSelectionListener(() => {
        var nbRowsSelected = nodesTable.getSelectedRows().length;
        createNodeIcon.enable(nbRowsSelected == 0);
        deleteNodeIcon.enable(nbRowsSelected > 0);
    });

    var nodesCard = new RcdMaterialCard('Nodes').
        init().
        addIcon(createNodeIcon).
        addIcon(deleteNodeIcon).
        addContent(nodesTable);

    nodesView.addChild(nodesCard);

    return nodesView;
}

function createNode() {
    var defaultNodeName = 'node-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
    showInputDialog({
        title: "Create node",
        ok: "CREATE",
        label: "Node name",
        placeholder: defaultNodeName,
        value: defaultNodeName,
        callback: (value) => doCreateNode(value || defaultNodeName)
    });
}

function doCreateNode(nodeName) {
    var infoDialog = showInfoDialog("Creating node...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-create',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            parentPath: router.getParameters().path,
            nodeName: nodeName || ('node-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase())
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
    var nodeNames = nodesTable.getSelectedRows().map((row) => row.attributes['node']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/node-delete',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: router.getParameters().branch,
            parentPath: router.getParameters().path,
            nodeNames: nodeNames
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
            parentPath: router.getParameters().path
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(function (result) {
        nodesTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((node1, node2) => node1.name - node2.name).
                forEach((node) => {
                    var row = nodesTable.body.createRow().
                        addCell(node._id).
                        addCell(node._name).
                        setAttribute('node', node._id).
                        addClass('clickable').
                        setClickListener(() => {
                            router.setState('nodes?repo=' + router.getParameters().repo + '&branch=' + router.getParameters().branch +
                                            '&path=' + node._path);
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation());
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function refreshNodesViewTitle(view) {
    var repositoryName = router.getParameters().repo;
    var branchName = router.getParameters().branch;
    view.setPathElements([{name: 'Data Toolbox', callback: () => router.setState()},
        {name: 'Repositories', callback: () => router.setState('repositories')},
        {name: repositoryName, callback: () => router.setState('repositories?repo=' + repositoryName)},
        {name: branchName}]); //TODO 
}