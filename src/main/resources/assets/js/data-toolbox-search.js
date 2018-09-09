class SearchParamsCard extends RcdDivElement {
    constructor() {
        super();
        this.repositoryMap = {};
        this.repositoryDropdown = new RcdMaterialDropdown('Repositories', []).init();
        this.branchDropdown = new RcdMaterialDropdown('Branches', []).init();
        this.contextRow = new RcdDivElement().init()
            .addClass('dtb-node-row')
            .addChild(this.repositoryDropdown)
            .addChild(this.branchDropdown);
    }

    init() {
        return super.init()
            .addClass('dtb-search-params')
            .addChild(this.contextRow);
    }

    setRepositories(repositories) {
        this.repositoryMap = {};
        this.repositoryDropdown.clear();
        this.repositoryDropdown.addOption('All repositories');
        this.branchDropdown.clear();
        this.branchDropdown.addOption('All branches');

        if (repositories && repositories.length) {
            repositories.forEach(repository => {
                this.repositoryMap[repository.name] = repository.branches;
            });

            this.repositoryDropdown.addOptions(repositories.map(repository => repository.name));

            const repoParameter = getRepoParameter();
            console.log(repoParameter);
            if (repoParameter) {
                this.repositoryDropdown.selectOption(repoParameter);
                this.branchDropdown.addOptions(this.repositoryMap[repoParameter]);

                const branchParameter = getBranchParameter();
                if (branchParameter) {
                    this.branchDropdown.selectOption(branchParameter);
                }
            }
        }
    }
}

class SearchRoute extends DtbRoute {
    constructor() {
        super({
            state: 'search',
            name: 'Search',
            iconArea: new RcdGoogleMaterialIconArea('search').init()
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrieveRepositories();
    }

    createLayout() {
        this.paramsCard = new SearchParamsCard()
            .init();

        return new RcdMaterialLayout()
            .init()
            .addChild(this.paramsCard);
    }

    retrieveRepositories() {
        const infoDialog = showShortInfoDialog('Retrieving repositories...');
        return $.ajax({
            method: 'GET',
            url: config.servicesUrl + '/repository-list',
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onRepositoriesRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onRepositoriesRetrieval(result) {
        this.paramsCard.setRepositories([]);
        if (handleResultError(result)) {
            this.paramsCard.setRepositories(result.success);
        }
    }

    refreshBreadcrumbs() {
        this.breadcrumbsLayout.setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
            new RcdMaterialBreadcrumb('Search').init()]);
    }

    displayHelp() {
        const viewDefinition = 'The view lists in a table all the system properties of the current node\' +\n' +
                               '                               \'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/developer/node-domain/system-properties.html">System properties</a> for more information. ';
        new HelpDialog('System properties', [viewDefinition]).init().open();
    }
}
