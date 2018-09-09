class SearchParamsCard extends RcdDivElement {
    constructor() {
        super();
        this.repositoryMap = {};
        this.repositoryDropdown = new RcdMaterialDropdown('Repositories', []).init();
        this.branchDropdown = new RcdMaterialDropdown('Branches', []).init();
        this.contextRow = new RcdDivElement().init()
            .addClass('dtb-search-params-row')
            .addClass('dtb-responsive-row')
            .addChild(this.repositoryDropdown)
            .addChild(this.branchDropdown);
        this.queryField = new RcdMaterialTextField('Query', '').init()
            .addClass('dtb-search-query');
        this.searchButtonArea = new RcdMaterialButtonArea('Search', () => {
        }, RcdMaterialButtonType.FLAT).init()
            .addClass('dtb-search-button');
    }

    init() {
        return super.init()
            .addClass('dtb-search-params')
            .addChild(this.contextRow)
            .addChild(this.queryField)
            .addChild(this.searchButtonArea);
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
            if (repoParameter) {
                this.repositoryDropdown.selectOption(repoParameter);
                this.branchDropdown.addOptions(this.repositoryMap[repoParameter]);

                const branchParameter = getBranchParameter();
                if (branchParameter) {
                    this.branchDropdown.selectOption(branchParameter);
                }
            }
        }

        this.queryField
            .focus()
            .select();
    }

    addListener(listener) {
        const onQueryAction = () => {
            const repositoryName = this.repositoryDropdown.getSelectedValue();
            const branchName = this.branchDropdown.getSelectedValue();
            const params = {
                repositoryName: repositoryName === 'All repositories' ? null : repositoryName,
                branchName: branchName === 'All branches' ? null : branchName,
                query: this.queryField.getValue()
            };
            listener(params);
        };
        this.addKeyUpListener('Enter', onQueryAction);
        this.searchButtonArea.addClickListener(onQueryAction);
        return this;
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
            .init()
            .addListener((params) => this.onSearchAction(params));
        this.resultCard = new RcdMaterialList()
            .init()
            .addClass('dtb-search-result');

        return new RcdMaterialLayout()
            .init()
            .addChild(this.paramsCard)
            .addChild(this.resultCard);
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
        this.resultCard.clear();
        if (handleResultError(result)) {
            this.paramsCard.setRepositories(result.success);
        }
    }

    onSearchAction(params) {
        const infoDialog = showShortInfoDialog('Querying nodes...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-query',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onNodesRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onNodesRetrieval(result) {
        this.resultCard.clear();
        if (handleResultError(result)) {
            result.success.hits.forEach(node => {
                const primary = node._name;
                const secondary = node.repositoryName + ':' + node.branchName + ':' + node._path;
                this.resultCard.addRow(primary, secondary);
            });
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
