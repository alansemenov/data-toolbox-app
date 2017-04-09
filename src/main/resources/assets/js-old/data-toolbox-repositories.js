const repositoriesTable = createRepositoriesTable();
const repositoriesView = createRepositoriesView();
function createRepositoriesTable() {
    const repositoriesTable = new RcdMaterialTable().init();
    repositoriesTable.header.addCell('Repository name');
    return repositoriesTable;
}

function createRepositoriesView() {
    //Creates the node view
    const repositoriesViewPathElements = [{name: 'Data Toolbox', callback: () => router.setState()}, {name: 'Repositories'}];
    const repositoriesViewDescription = 'Enonic XP data is split in repositories. ' +
                                      'Data stored in a repository will typically belong to a common domain. ' +
                                      'Enonic XP uses by default 2 repositories: ' +
                                      '"system-repo", the core repository, containing users, groups, roles, references to other repositories, installed application, etc and ' +
                                      '"cms-repo", the content domain repository, containing the data managed by Content Studio. ' +
                                      'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/repository.html">Repository</a> for more information.';
    const repositoriesView = new RcdMaterialView('repositories', repositoriesViewPathElements, repositoriesViewDescription).init();

    const createRepositoryIcon = new RcdMaterialActionIcon('add_circle', createRepository).init().setTooltip('Create repository');
    const deleteRepositoryIcon = new RcdMaterialActionIcon('delete', deleteRepositories).init().setTooltip('Delete repository').enable(false);

    repositoriesTable.addSelectionListener(() => {
        const nbRowsSelected = repositoriesTable.getSelectedRows().length;
        createRepositoryIcon.enable(nbRowsSelected == 0);
        deleteRepositoryIcon.enable(nbRowsSelected > 0);
    });

    const repositoriesCard = new RcdMaterialCard('Repositories').
        init().
        addIcon(createRepositoryIcon).
        addIcon(deleteRepositoryIcon).
        addContent(repositoriesTable);

    repositoriesView.addChild(repositoriesCard);

    return repositoriesView;
}

function createRepository() {
    const defaultRepositoryName = 'repository-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
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
    const infoDialog = showInfoDialog("Creating repository...");
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/repository-create',
        data: JSON.stringify({
            repositoryName: repositoryName || ('repository-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase())
        }),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function deleteRepositories() {
    showConfirmationDialog("Delete selected repositories?", doDeleteRepositories);
}

function doDeleteRepositories() {
    const infoDialog = showInfoDialog("Deleting repository...");
    const repositoryNames = repositoriesTable.getSelectedRows().map((row) => row.attributes['repository']);
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/repository-delete',
        data: JSON.stringify({repositoryNames: repositoryNames}),
        contentType: 'application/json; charset=utf-8'
    }).done(handleResultError).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
        router.refreshState();
    });
}

function retrieveRepositories() {
    const infoDialog = showInfoDialog("Retrieving repositories...");
    return $.ajax({
        url: config.servicesUrl + '/repository-list'
    }).done(function (result) {
        repositoriesTable.body.clear();
        if (handleResultError(result)) {
            result.success.
                sort((repository1, repository2) => repository1.name - repository2.name).
                forEach((repository) => {
                    const row = repositoriesTable.body.createRow().
                        addCell(repository.name).
                        setAttribute('repository', repository.name).
                        addClass('clickable').
                        addClickListener(() => {
                            router.setState('branches?repo=' + repository.name);
                        });
                    row.checkbox.addClickListener((event) => event.stopPropagation());
                });
        }
    }).fail(handleAjaxError).always(() => {
        hideDialog(infoDialog);
    });
}