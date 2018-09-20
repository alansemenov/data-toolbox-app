class SearchParamsCard extends RcdDivElement {
    constructor() {
        super();
        this.searchListeners = [];
        this.repositoryMap = {};
        this.repositoryDropdown = new RcdMaterialDropdown('Repositories', []).init()
            .addChangeListener(() => {
                this.branchDropdown.clear();
                this.branchDropdown.addOption('All branches');
                const selectedRepositoryName = this.repositoryDropdown.getSelectedValue();
                if (selectedRepositoryName && selectedRepositoryName !== 'All repositories') {
                    this.branchDropdown.addOptions(this.repositoryMap[selectedRepositoryName]);
                }
            });
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
            .addClass('dtb-search-button')
            .addClickListener(() => this.search());
    }

    init() {
        return super.init()
            .addClass('dtb-search-params')
            .addChild(this.contextRow)
            .addChild(this.queryField)
            .addChild(this.searchButtonArea)
            .addKeyUpListener('Enter', () => this.search());
    }

    search() {
        const repo = this.repositoryDropdown.getSelectedValue();
        const branch = this.branchDropdown.getSelectedValue();
        const query = this.queryField.getValue();
        RcdHistoryRouter.setState('search', {
            repo: repo === 'All repositories' ? undefined : repo,
            branch: branch === 'All branches' ? undefined : branch,
            query: query
        });
    }

    onDisplay(repositories) {
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
            if (repoParameter && this.repositoryMap[repoParameter]) {
                this.repositoryDropdown.selectOption(repoParameter);
                this.branchDropdown.addOptions(this.repositoryMap[repoParameter]);

                const branchParameter = getBranchParameter();
                if (branchParameter && this.repositoryMap[repoParameter].indexOf(branchParameter) !== -1) {
                    this.branchDropdown.selectOption(branchParameter);
                }
            }
        }

        const queryParameter = getQueryParameter();

        this.queryField
            .setValue(queryParameter)
            .focus()
            .select();

        if (queryParameter) {
            this.notifySearchListeners();
        }
    }

    addSearchListener(listener) {
        this.searchListeners.push(listener);
        return this;
    }

    notifySearchListeners() {
        const repositoryName = this.repositoryDropdown.getSelectedValue();
        const branchName = this.branchDropdown.getSelectedValue();
        const params = {
            repositoryName: repositoryName === 'All repositories' ? null : repositoryName,
            branchName: branchName === 'All branches' ? null : branchName,
            query: this.queryField.getValue()
        };
        this.searchListeners.forEach((listener) => listener(params));
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
        this.layout.removeChild(this.resultCard);
        this.retrieveRepositories();
    }

    createLayout() {
        this.paramsCard = new SearchParamsCard()
            .init()
            .addSearchListener((params) => this.onSearchAction(params));
        this.resultCard = new RcdMaterialList()
            .init()
            .addClass('dtb-search-result');

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
        this.resultCard.clear();
        if (handleResultError(result)) {
            this.paramsCard.onDisplay(result.success);
        } else {
            this.paramsCard.onDisplay([]);
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
            if (result.success.count === 0) {
                this.resultCard.addRow('No node found');
            } else {
                result.success.hits.forEach(node => {
                    const primary = node._name;
                    const secondary = node.repositoryName + ':' + node.branchName + ':' + node._path;
                    this.resultCard.addRow(primary, secondary, {
                        callback: () => setState('node', {repo: node.repositoryName, branch: node.branchName, id: node._id})
                    });
                });
            }
        } else {
            this.resultCard.addRow('Search failure');
        }
        this.layout.addChild(this.resultCard);
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
