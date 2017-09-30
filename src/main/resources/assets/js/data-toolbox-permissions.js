class PermissionsRoute extends DtbRoute {
    constructor() {
        super({
            state: 'permissions'
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrievePermissions();
    }
    
    createLayout() {
        const inheritanceIconArea = new RcdGoogleMaterialIconArea('arrow_upward', () => this.editPermissionInheritance()).init().
            setTooltip('Change permission inheritance');
        const createIconArea = new RcdGoogleMaterialIconArea('add_circle', () => this.createPermission()).init().
            setTooltip('Create permission');
        const deleteIconArea = new RcdGoogleMaterialIconArea('delete', () => this.deletePermissions()).init().
            setTooltip('Delete selected permissions', RcdMaterialTooltipAlignment.RIGHT);
        this.tableCard = new RcdMaterialTableCard('Permissions').init().
            addColumn('Principal').
            addColumn('Read').
            addColumn('Create').
            addColumn('Modify').
            addColumn('Delete').
            addColumn('Publish').
            addColumn('Read Permissions').
            addColumn('Write Permissions').
            addIconArea(inheritanceIconArea).
            addIconArea(createIconArea, {max: 0}).
            addIconArea(deleteIconArea, {min: 1});

        return new RcdMaterialLayout().init().
            addChild(this.tableCard);
    }

    retrievePermissions() {
        const infoDialog = showInfoDialog('Retrieving permissions...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/permission-list',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: getPathParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => this.onPermissionsRetrieval(result)).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    onPermissionsRetrieval(result) {
        this.tableCard.deleteRows();

        this.tableCard.createRow({selectable:false}).
            addCell('..').
            addCell('').
            addCell('').
            addCell('').
            addCell('').
            addCell('').
            addCell('').
            addCell('').
            addClass('rcd-clickable').
            addClickListener(() => setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter(), path: this.getParentPath()})); //TODO
        
        if (handleResultError(result)) {
            result.success._permissions.forEach((accessControlEntry) => {
                this.tableCard.createRow().
                    addCell(accessControlEntry.principal).
                    addCell(this.createPermissionIcon(accessControlEntry, 'READ'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'CREATE'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'MODIFY'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'DELETE'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'PUBLISH'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'READ_PERMISSIONS'), {icon: true}).
                    addCell(this.createPermissionIcon(accessControlEntry, 'WRITE_PERMISSIONS'), {icon: true}).
                    setAttribute('principal', accessControlEntry.principal);
            });
        }
    }
    
    createPermissionIcon(accessControlEntry, permission ) {
        if (accessControlEntry.allow.indexOf(permission) !== -1) {
            return new RcdGoogleMaterialIconArea('check').init();
        }
        if (accessControlEntry.deny.indexOf(permission) !== -1) {
            return new RcdGoogleMaterialIconArea('block').init();
        }
        return '';
    }
    
    createPermission() {
        //TODO
    }
    
    deletePermissions() {
        showConfirmationDialog("Delete selected permissions?", 'DELETE', () => this.doDeletePermissions());
    }

    doDeletePermissions() {
        const infoDialog = showInfoDialog("Deleting selected permissions...");
        const principals = this.tableCard.getSelectedRows().map((row) => row.attributes['principal']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/permission-delete',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                keys: getPathParameter(),
                principals: principals,
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            this.retrievePermissions();
        });
    }

    refreshBreadcrumbs() {
        const repositoryName = getRepoParameter();
        const branchName = getBranchParameter();
        const path = getPathParameter();

        this.breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
                new RcdMaterialBreadcrumb('Data Tree', () => setState('repositories')).init(),
                new RcdMaterialBreadcrumb(repositoryName, () => setState('branches', {repo: repositoryName})).init(),
                new RcdMaterialBreadcrumb(branchName, path && (() => setState('nodes',{repo: repositoryName, branch: branchName}))).init()]);

        if (path) {
            this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb('root', path === '/' ? undefined :
                                                                              () => setState('nodes', {repo: repositoryName, branch: branchName, path: '/'})).init());

            if (path === '/') {
                app.setTitle('Root node');
            } else {
                const pathElements = path.substring(1).split('/')
                app.setTitle(pathElements[pathElements.length - 1]);

                let currentPath = '';
                pathElements.forEach((subPathElement, index, array) => {
                    currentPath += '/' + subPathElement;
                    const constCurrentPath = currentPath;
                    this.breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement, index < array.length - 1
                        ? (() => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath}))
                        : undefined).init());
                });
            }
        } else {
            app.setTitle(branchName);
        }
    }

    displayHelp() {
        const definition = 'A Node represents a single storable entity of data. ' +
                           'It can be compared to a row in sql or a document in document oriented storage models.<br/>' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/developer/node-domain/nodes.html">Nodes</a> for more information. ';

        const structureDefinition = 'This tool represent nodes in a tree structure. ' +
                                    'While this solution is adapted to repositories like cms-repo or system-repo, ' +
                                    'it may be problematic for custom repositories or for nodes with too many children. ' +
                                    'Node search for all paths will be available in the future, but if this representation is blocking we recommend using the tool ' +
                                    '<a class="rcd-material-link" href="https://market.enonic.com/vendors/runar-myklebust/repoxplorer">repoXPlorer</a>.';

        const viewDefinition = 'The view lists in a table all the direct children nodes of the current node (or the root node for a branch). Click on a row to display its direct children.';
        new HelpDialog('Nodes', [definition, structureDefinition, viewDefinition]).
        init().
        addActionDefinition({
            iconSrc: config.assetsUrl + '/icons/export-icon.svg',
            definition: 'Export the selected node into $XP_HOME/data/export/[export-name]. The display will switch to the Exports view.'
        }).
        addActionDefinition({
            iconSrc: config.assetsUrl + '/icons/import-icon.svg',
            definition: 'Import previously exported nodes as children under the current node (or as root node)'
        }).
        addActionDefinition({
            iconName: 'filter_list',
            definition: 'Filter the nodes based on a query expression. ' +
                        'Example: "_id = \'role:system.admin"\'. ' +
                        'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/reference/query-language.html#compareexpr">Query language</a> for more information.'
        }).
        addActionDefinition({
            iconName: 'sort',
            definition: 'Sort the nodes based on an expression. ' +
                        'The sorting expression is composed of a node field to sort on and the direction: ascending or descending.' +
                        'Examples: "_timestamp DESC", "_name ASC"'
        }).
        addActionDefinition({iconName: 'delete', definition: 'Delete the selected nodes.'}).
        addActionDefinition({iconName: 'info', definition: 'Display the node content.'}).
        open();
    }
}
