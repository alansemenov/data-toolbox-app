function createRepositoriesRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init()).
        addBreadcrumb(new RcdMaterialBreadcrumb('Repositories').init());

    const tableCard = new RcdMaterialTableCard('Repositories').init().
        addColumn('Repository name').
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createRepository).init(), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteRepositories).init(), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'repositories',
        name: 'Repositories',
        iconArea: new RcdGoogleMaterialIconArea('storage').init(),
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            retrieveRepositories();
        }
    };

    function retrieveRepositories() {
        const infoDialog = showInfoDialog('Retrieving repository list...');
        return $.ajax({
            url: config.servicesUrl + '/repository-list'
        }).done(function (result) {
            tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((repository1, repository2) => repository1.name - repository2.name).
                    forEach((repository) => {
                        const row = tableCard.createRow().
                            addCell(repository.name).
                            setAttribute('repository', repository.name).
                            addClass('rcd-clickable').
                            addClickListener(() => {
                                RcdHistoryRouter.setState('branches?repo=' + repository.name);
                            });
                        row.checkbox.addClickListener((event) => event.stopPropagation());
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createRepository() {
        const defaultRepositoryName = 'repository-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
        new RcdMaterialInputDialog({
            title: 'Create repository',
            label: 'Repository name',
            placeholder: defaultRepositoryName,
            value: defaultRepositoryName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateRepository(value || defaultRepositoryName)
        }).init().open();
    }

    function doCreateRepository(repositoryName) {
        const infoDialog = showInfoDialog('Creating repository...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/repository-create',
            data: JSON.stringify({
                repositoryName: repositoryName || ('repository-' + toLocalDateTimeFormat(new Date(), '-', '-')).toLowerCase()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveRepositories();
        });
    }

    function deleteRepositories() {
        showConfirmationDialog("Delete selected repositories?", doDeleteRepositories);
    }

    function doDeleteRepositories() {
        const infoDialog = showInfoDialog("Deleting selected repositories...");
        const repositoryNames = tableCard.getSelectedRows().map((row) => row.attributes['repository']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/repository-delete',
            data: JSON.stringify({repositoryNames: repositoryNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveRepositories();
        });
    }
}
