class VersionsRoute extends DtbRoute {
    constructor() {
        super({
            state: 'versions'
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrieveVersions();
    }

    createLayout() {
        this.tableCard = new RcdMaterialTableCard('Versions',{selectable: false}).init()
            .addClass('dtb-table-card-versions')
            .addColumn('Version ID')
            .addColumn('Blob key', {classes: ['non-mobile-cell']})
            .addColumn('Path', {classes: ['non-mobile-cell']})
            .addColumn('Timestamp');

        return new RcdMaterialLayout().init()
            .addChild(this.tableCard);
    }

    retrieveVersions() {
        const infoDialog = showShortInfoDialog('Retrieving versions...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/version-list',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                id: getIdParameter(),
                start: getStartParameter(),
                count: getCountParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        })
            .done((result) => this.onVersionsRetrieval(result))
            .fail(handleAjaxError)
            .always(() => {
                infoDialog.close();
            });
    }

    onVersionsRetrieval(result) {
        this.tableCard.deleteRows();

        this.tableCard.createRow({selectable: false})
            .addCell('..')
            .addCell('', {classes: ['non-mobile-cell']})
            .addCell('', {classes: ['non-mobile-cell']})
            .addCell('')
            .addClass('rcd-clickable')
            .addClickListener(() => setState('node', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getIdParameter()
            }));


        if (handleResultError(result)) {
            const properties = result.success.hits;

            properties.forEach(property => {
                this.tableCard.createRow()
                    .addCell(property.versionId)
                    .addCell(property.blobKey, {classes: ['non-mobile-cell']})
                    .addCell(property.nodePath, {classes: ['non-mobile-cell']})
                    .addCell(property.timestamp);

            });

            const startInt = parseInt(getStartParameter());
            const countInt = parseInt(getCountParameter());
            const previousCallback = () => setState('versions', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                id: getIdParameter(),
                start: Math.max(0, startInt - countInt),
                count: getCountParameter()
            });
            const nextCallback = () => setState('versions', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                id: getIdParameter(),
                start: startInt + countInt,
                count: getCountParameter()
            });
            this.tableCard.setFooter({
                start: parseInt(getStartParameter()),
                count: properties.length,
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

        this.breadcrumbsLayout.setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
            new RcdMaterialBreadcrumb('Data Tree', () => setState('repositories')).init(),
            new RcdMaterialBreadcrumb(repositoryName, () => setState('branches', {repo: repositoryName})).init(),
            new RcdMaterialBreadcrumb(branchName, () => setState('nodes', {repo: repositoryName, branch: branchName})).init()]);


        this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(path === '/' ? 'root!versions' : 'root',
            path === '/' ? undefined : () => setState('nodes', {repo: repositoryName, branch: branchName, path: '/'})).init());

        if (path === '/') {
            app.setTitle('Root node versions');
        } else {
            const pathElements = path.substring(1).split('/')
            app.setTitle(pathElements[pathElements.length - 1] + ' versions');

            let currentPath = '';
            pathElements.forEach((subPathElement, index, array) => {
                currentPath += '/' + subPathElement;
                const constCurrentPath = currentPath;
                this.breadcrumbsLayout.addBreadcrumb(
                    new RcdMaterialBreadcrumb(index < array.length - 1 ? subPathElement : subPathElement + '!versions',
                        index < array.length - 1
                            ? (() => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath}))
                            : undefined).init());
            });
        }
    }

    displayHelp() {
        const viewDefinition = 'Node versions. ';
        new HelpDialog('Versions', [viewDefinition]).init()
            .open();
    }
}
