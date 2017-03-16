var branchesTable = createBranchesTable();
var branchesView = createBranchesView();

function createBranchesTable() {
    var branchesTable = new RcdMaterialTable().init();
    branchesTable.header.addCell('Branch name');
    return branchesTable;
}

function createBranchesView() {
    //Creates the node view
    var branchesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Branches'}];
    var branchesViewDescription = 'A branch is a set of data in a repository. ' +
                                  'All repositories have a default branch called master. ' +
                                  'Any number of branches could be added to facilitate your data. ' +
                                  'For example, the cms-repo repository contains two branches: ' +
                                  '"draft" containing the content as seen in the Content Studio and ' +
                                  '"master" containing the published content served by the portal. ' +
                                  'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/branch.html">Branch</a> for more information.';
    var branchesView = new RcdMaterialView('branches', branchesViewPathElements, branchesViewDescription).init();

    var createBranchIcon = new RcdMaterialActionIcon('add_circle', createBranch).init().setTooltip('Create branch');
    var deleteBranchIcon = new RcdMaterialActionIcon('delete', deleteBranches).init().setTooltip('Delete branch').enable(false);

    branchesTable.addSelectionListener(() => {
        var nbRowsSelected = branchesTable.getSelectedRows().length;
        createBranchIcon.enable(nbRowsSelected == 0);
        deleteBranchIcon.enable(nbRowsSelected > 0);
    });

    var branchesCard = new RcdMaterialCard('Branches').
        init().
        addIcon(createBranchIcon).
        addIcon(deleteBranchIcon).
        addContent(branchesTable);

    branchesView.addChild(branchesCard);

    return branchesView;
}

function createBranch() {
    var defaultBranchName = 'branch-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
    showInputDialog({
        title: "Create branch",
        ok: "CREATE",
        label: "Branch name",
        placeholder: defaultBranchName,
        value: defaultBranchName,
        callback: (value) => doCreateBranch(value || defaultBranchName)
    });
}

function doCreateBranch(branchName) {
    var infoDialog = showInfoDialog("Creating branch...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/branch-create',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchName: branchName || ('branch-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase())
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function deleteBranches() {
    showConfirmationDialog("Delete selected branches?", doDeleteBranches);
}

function doDeleteBranches() {
    var infoDialog = showInfoDialog("Deleting branch...");
    var branchNames = branchesTable.getSelectedRows().map((row) => row.attributes['branch']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/branch-delete',
        data: JSON.stringify({
            repositoryName: router.getParameters().repo,
            branchNames: branchNames
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function retrieveBranches() {
    var infoDialog = showInfoDialog("Retrieving branches...");
    return $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/repository-get',
        data: JSON.stringify({repositoryName: router.getParameters().repo}),
        contentType: 'application/json; charset=utf-8'
    }).done(function (result) {
        branchesTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                branches.
                sort((branch1, branch2) => branch1 - branch2).
                forEach((branch) => {
                    var row = branchesTable.body.createRow().
                        addCell(branch).
                        setAttribute('branch', branch).
                        addClass('clickable').
                        addClickListener(() => {
                            router.setState('nodes?repo=' + router.getParameters().repo + '&branch=' + branch + '&start=0&count=50');
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation());
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}

function refreshBranchesViewTitle(view) {
    var repositoryName = router.getParameters().repo;
    view.setPathElements([{name: 'Data Toolbox', callback: () => router.setState()},
        {name: 'Repositories', callback: () => router.setState('repositories')}, {name: repositoryName}]);
}