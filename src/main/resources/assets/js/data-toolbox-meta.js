class MetaRoute extends DtbRoute {
    constructor() {
        super({
            state: 'system-properties'
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrieveMeta();
    }
    
    createLayout() {
        this.tableCard = new RcdMaterialTableCard('System properties').init().
            addColumn('Name').
            addColumn('Value');

        return new RcdMaterialLayout().init().
            addChild(this.tableCard);
    }

    retrieveMeta() {
        const infoDialog = showShortInfoDialog('Retrieving system properties...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/meta-get',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: getPathParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onMetaRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onMetaRetrieval(result) {
        this.tableCard.deleteRows();

        this.tableCard.createRow({selectable:false}).
            addCell('..').
            addCell('').
            addClass('rcd-clickable').
            addClickListener(() => setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter(), path: this.getParentPath()}));
        
        if (handleResultError(result)) {
            const meta = result.success;
            this.tableCard.createRow({selectable:false}).
                addCell('ID').
                addCell(meta._id);
            this.tableCard.createRow({selectable:false}).
                addCell('Name').
                addCell(meta._name);
            this.tableCard.createRow({selectable:false}).
                addCell('Path').
                addCell(meta._path);
            this.tableCard.createRow({selectable:false}).
                addCell('Child order').
                addCell(meta._childOrder);
            this.tableCard.createRow({selectable:false}).
                addCell('State').
                addCell(meta._state);
            this.tableCard.createRow({selectable:false}).
                addCell('Version key').
                addCell(meta._versionKey);
            this.tableCard.createRow({selectable:false}).
                addCell('Manual order value').
                addCell(meta._manualOrderValue || '');
            this.tableCard.createRow({selectable:false}).
                addCell('Timestamp').
                addCell(meta._ts);
        }
    }
    
    refreshBreadcrumbs() {
        const repositoryName = getRepoParameter();
        const branchName = getBranchParameter();
        const path = getPathParameter();

        this.breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
                new RcdMaterialBreadcrumb('Data Tree', () => setState('repositories')).init(),
                new RcdMaterialBreadcrumb(repositoryName, () => setState('branches', {repo: repositoryName})).init(),
                new RcdMaterialBreadcrumb(branchName, () => setState('nodes',{repo: repositoryName, branch: branchName})).init()]);

        
        this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(path === '/' ? 'root!system-properties' : 'root', path === '/' ? undefined :
                                                                          () => setState('nodes', {repo: repositoryName, branch: branchName, path: '/'})).init());

        if (path === '/') {
            app.setTitle('Root node system properties');
        } else {
            const pathElements = path.substring(1).split('/')
            app.setTitle(pathElements[pathElements.length - 1] + ' system properties');

            let currentPath = '';
            pathElements.forEach((subPathElement, index, array) => {
                currentPath += '/' + subPathElement;
                const constCurrentPath = currentPath;
                this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(index < array.length - 1 ?  subPathElement : subPathElement + '!system-properties', index < array.length - 1
                    ? (() => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath}))
                    : undefined).init());
            });
        }
        
    }

    displayHelp() {
        const viewDefinition = 'The view lists in a table all the system properties of the current node\' +\n' +
                               '                               \'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/developer/node-domain/system-properties.html">System properties</a> for more information. ';
        new HelpDialog('System properties', [viewDefinition]).
        init().
        open();
    }
}
