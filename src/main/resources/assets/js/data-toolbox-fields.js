class FieldsRoute extends DtbRoute {
    constructor() {
        super({
            state: 'fields'
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrieveFields();
    }
    
    createLayout() {
        this.tableCard = new RcdMaterialTableCard('Fields').init().
            addColumn('Name').
            addColumn('Index').
            addColumn('Value').
            addColumn('Type');

        return new RcdMaterialLayout().init().
            addChild(this.tableCard);
    }

    retrieveFields() {
        const infoDialog = showInfoDialog('Retrieving fields...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/fields-list',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                path: getPathParameter(),
                field: getFieldParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onFieldsRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onFieldsRetrieval(result) {
        this.tableCard.deleteRows();

        this.tableCard.createRow({selectable:false}).
            addCell('..').
            addCell('').
            addCell('').
            addCell('').
            addClass('rcd-clickable').
            addClickListener(() => setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter(), path: this.getParentPath()}));
        
        if (handleResultError(result)) {
            const fields = result.success;

            fields.forEach(field => {
                const row = this.tableCard.createRow({selectable:false}).
                    addCell(field.name).
                    addCell(field.index).
                    addCell(field.value).
                    addCell(field.type);
                
                if(field.type === 'PropertySet') {
                    row.addClass('rcd-clickable').
                        addClickListener(() => setState('fields', {repo:getRepoParameter(), branch: getBranchParameter(), path: this.getParentPath(), field: getFieldParameter() ? getFieldParameter() + '.' + field.name : field.name}))
                }
            });

            
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

        
        this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(path === '/' ? 'root!data' : 'root', path === '/' ? undefined :
                                                                          () => setState('nodes', {repo: repositoryName, branch: branchName, path: '/'})).init());

        if (path === '/') {
            app.setTitle('Root node data');
        } else {
            const pathElements = path.substring(1).split('/')
            app.setTitle(pathElements[pathElements.length - 1] + ' data');

            let currentPath = '';
            pathElements.forEach((subPathElement, index, array) => {
                currentPath += '/' + subPathElement;
                const constCurrentPath = currentPath;
                this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(index < array.length - 1 ?  subPathElement : subPathElement + '!data', index < array.length - 1
                    ? (() => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath}))
                    : undefined).init());
            });
        }
        
    }

    displayHelp() {
        const viewDefinition = 'The view lists in a table all the metadata of the current node. Modification of metadata will be provided in an ulterior version.';
        new HelpDialog('Metadata', [viewDefinition]).
        init().
        open();
    }
}
