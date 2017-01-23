function createRepositoriesTable() {
    var repositoriesTable = new RcdMaterialTable().init();
    repositoriesTable.header.addCell('Repository name');
    return repositoriesTable;
}

function createRepositoriesView(repositoriesTable) {
    //Creates the node view
    var repositoriesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Repositories'}];
    var repositoriesViewDescription = 'TBD.' +
                                      'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/index.html">Export and Import</a> for more information.';
    var repositoriesView = new RcdMaterialView('repositories', repositoriesViewPathElements, repositoriesViewDescription).init();

    var createRepositoryIcon = new RcdMaterialActionIcon('add_circle', createRepository).init().setTooltip('Create repository');
    var deleteRepositoryIcon = new RcdMaterialActionIcon('delete', deleteRepositories).init().setTooltip('Delete repository').enable(false);

    repositoriesTable.addSelectionListener(() => {
        var nbRowsSelected = repositoriesTable.getSelectedRows().length;
        createRepositoryIcon.enable(nbRowsSelected == 0);
        deleteRepositoryIcon.enable(nbRowsSelected > 0);
    });

    var repositoriesCard = new RcdMaterialCard('Repositories').
        init().
        addIcon(createRepositoryIcon).
        addIcon(deleteRepositoryIcon).
        addContent(repositoriesTable);

    repositoriesView.addChild(repositoriesCard);

    return repositoriesView;
}

function createRepository() {
    var defaultRepositoryName = 'repository-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
    showInputDialog({
        title: "Create repository",
        ok: "CREATE",
        label: "Repository name",
        placeholder: defaultRepositoryName,
        value: defaultRepositoryName,
        callback: (value) => doCreateRepository(value || defaultRepositoryName)
    });
}

function doCreateRepository(repositoryName) {
    var infoDialog = showInfoDialog("Creating repository...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/repository-create',
        data: JSON.stringify({
            repositoryName: repositoryName || ('repository-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase())
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('repositories');
    });
}

function deleteRepositories() {
    showConfirmationDialog("Delete selected repositories?", doDeleteRepositories);
}

function doDeleteRepositories() {
    var infoDialog = showInfoDialog("Deleting repository...");
    var repositoryNames = repositoriesTable.getSelectedRows().map((row) => row.attributes['repository']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/repository-delete',
        data: JSON.stringify({repositoryNames: repositoryNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.setState('repositories');
    });
}

function retrieveRepositories() {
    var infoDialog = showInfoDialog("Retrieving repositories...");
    return $.ajax({
        url: config.servicesUrl + '/repository-list'
    }).done(function (result) {
        repositoriesTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((repository1, repository2) => repository1.name - repository2.name).
                forEach((repository) => {
                    repositoriesTable.body.createRow().
                        addCell(repository.name).
                        setAttribute('repository', repository.name);
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}