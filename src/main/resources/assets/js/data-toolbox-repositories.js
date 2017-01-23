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

    repositoriesTable.addSelectionListener(() => {
        var nbRowsSelected = repositoriesTable.getSelectedRows().length;
    });

    var repositoriesCard = new RcdMaterialCard('Repositories').
        init().
        addContent(repositoriesTable);

    repositoriesView.addChild(repositoriesCard);

    return repositoriesView;
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