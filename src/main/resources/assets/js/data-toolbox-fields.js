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
            addClass('dtb-table-card-fields').
            addColumn('Name', {classes:['non-mobile-cell']}).
            addColumn('Index', {classes:['non-mobile-cell', 'index']}).
            addColumn('Name[Idx]', {classes:['mobile-cell']}).
            addColumn('Value', {classes:['non-mobile-cell']}).
            addColumn('Type', {classes:['non-mobile-cell', 'type']}).
            addColumn('Type: Value', {classes:['mobile-cell']});

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
                field: getFieldParameter(),
                start: getStartParameter(),
                count: getCountParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onFieldsRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onFieldsRetrieval(result) {
        this.tableCard.deleteRows();

        const headerRow = this.tableCard.createRow({selectable:false}).
            addCell('..', {classes:['non-mobile-cell']}).
            addCell('', {classes:['non-mobile-cell']}).
            addCell('..', {classes:['mobile-cell']}).
            addCell('', {classes:['non-mobile-cell']}).
            addCell('', {classes:['non-mobile-cell']}).
            addCell('', {classes:['mobile-cell']}).
            addClass('rcd-clickable');
        
        if(getFieldParameter()) {
            headerRow.addClickListener(() => setState('fields', {repo:getRepoParameter(), branch: getBranchParameter(), path: getPathParameter(), field: this.getParentField()}));
        } else {
            headerRow.addClickListener(() => setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter(), path: this.getParentPath()}));
        }
        
        if (handleResultError(result)) {
            const fields = result.success.hits;

            fields.forEach(field => {
                const row = this.tableCard.createRow({selectable:false}).
                    addCell(field.name, {classes:['non-mobile-cell']}).
                    addCell(field.index, {classes:['non-mobile-cell']}).
                    addCell(field.name + '[' + field.index + ']', {classes:['mobile-cell']}).
                    addCell(field.value, {classes:['non-mobile-cell']}).
                    addCell(field.type, {classes:['non-mobile-cell']}).
                    addCell(field.type + ': ' + field.value, {classes:['mobile-cell']});
                
                if(field.type === 'PropertySet') {
                    row.addClass('rcd-clickable').
                        addClickListener(() => setState('fields', {repo:getRepoParameter(), branch: getBranchParameter(), path: getPathParameter(), field: (getFieldParameter() ? getFieldParameter() + '.' + field.name : field.name) + '[' + field.index + ']'}))
                }
            });

            const startInt = parseInt(getStartParameter());
            const countInt = parseInt(getCountParameter());
            const previousCallback = () => setState('fields', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                field: getFieldParameter(),
                start: Math.max(0, startInt - countInt),
                count: getCountParameter()});
            const nextCallback = () => setState('fields', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                field: getFieldParameter(),
                start: startInt + countInt,
                count: getCountParameter()});
            this.tableCard.setFooter({
                start: parseInt(getStartParameter()),
                count: fields.length,
                total: result.success.total,
                previousCallback: previousCallback,
                nextCallback: nextCallback
            });
        }
    }
    
    refreshBreadcrumbs() {
        const repositoryName = getRepoParameter();
        const branchName = getBranchParameter();
        const path = getPathParameter();
        const field = getFieldParameter();

        this.breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
                new RcdMaterialBreadcrumb('Data Tree', () => setState('repositories')).init(),
                new RcdMaterialBreadcrumb(repositoryName, () => setState('branches', {repo: repositoryName})).init(),
                new RcdMaterialBreadcrumb(branchName, () => setState('nodes',{repo: repositoryName, branch: branchName})).init()]);

        if (path === '/') {
            this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb('root!data', field ? () => setState('fields', {repo: repositoryName, branch: branchName, path: path}) : undefined).init());
        } else {
            this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb('root', () => setState('nodes', {repo: repositoryName, branch: branchName, path: '/'})).init());
        }
        
        if (path === '/') {
            app.setTitle('Root node data');
        } else {
            const pathElements = path.substring(1).split('/');
            app.setTitle(pathElements[pathElements.length - 1] + ' data');

            let currentPath = '';
            pathElements.forEach((subPathElement, index, array) => {
                currentPath += '/' + subPathElement;
                const constCurrentPath = currentPath;
                
                if (index < array.length - 1) {
                    this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement, () => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath})).init()); 
                } else {
                    this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement + '!data', field ? () => setState('fields', {repo: repositoryName, branch: branchName, path: path}) : undefined).init());
                }
            });
        }
        
        if (field) {
            const fieldElements = field.split('.');
            let currentField = '';
            fieldElements.forEach((subFieldElement, index, array) => {
                currentField += currentField ? '.' + subFieldElement : subFieldElement;
                const constCurrentField = currentField;
                const simplifiedSubFieldElement = subFieldElement.endsWith('[0]') ? subFieldElement.substring(0, subFieldElement.length - 3) : subFieldElement;

                if (index < array.length - 1) {
                    this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(simplifiedSubFieldElement, () => setState('fields', {repo: repositoryName, branch: branchName, path: path, field: constCurrentField})).init(), ' . ');
                } else {
                    this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(simplifiedSubFieldElement, undefined).init(), ' . ');
                }
            });
        }
        
    }

    displayHelp() {
        const viewDefinition = 'The view represents node data fields in a tree structure. Modification of fields will be provided in an ulterior version.';
        new HelpDialog('Data', [viewDefinition]).
        init().
        open();
    }
}