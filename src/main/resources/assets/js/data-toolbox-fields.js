function createFieldsRoute() {
    const breadcrumbsLayout = createBreadcrumbsLayout();
    const tableCard = createTableCard();
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);;
    
    return {
        state: 'fields',
        callback: (main) => {
            refreshBreadcrumbs();
            retrieveNode();
            main.addChild(breadcrumbsLayout).addChild(layout);
        }
    };
    
    function createBreadcrumbsLayout() {
        const helpIconArea = new RcdGoogleMaterialIconArea('help', displayHelp).init().
            setTooltip('Help');
        return new RcdMaterialBreadcrumbsLayout().init().
            addChild(helpIconArea);
    }
    
    function createTableCard() {
        return new RcdMaterialTableCard('Fields').init().
            addColumn('Field name').
            addColumn('Fields value').
            addColumn('Fields type', {classes: ['non-mobile-cell']});
    }

    function retrieveNode() {
        const infoDialog = showInfoDialog('Retrieving node...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-get',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: getNodeParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(onNodeRetrieval).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function onNodeRetrieval(result) {
        tableCard.deleteRows();

        //TODO
        // tableCard.createRow({selectable:false}).
        //     addCell('..').
        //     addCell('', {classes: ['non-mobile-cell']}).
        //     addCell(null, {icon: true}).
        //     addCell(null, {icon: true}).
        //     addClass('rcd-clickable').
        //     addClickListener(() => {
        //         if (getPathParameter()) {
        //             setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter() + (getPathParameter() === '/' ? '' : '&path=' + getParentPath() ) })
        //         } else {
        //             setState('branches', {repo:getRepoParameter()});
        //         }
        //     });

        if (handleResultError(result)) {
            const node = result.success;
            for(let fieldName in node) {
                const row = tableCard.createRow().
                    addCell(fieldName).
                    addCell(node[fieldName]).
                    addCell('TODO', {classes: ['non-mobile-cell']}).
                    setAttribute('name', fieldName).
                    addClass('rcd-clickable').
                    //TODO
                    addClickListener(() => setState('fields', {repo: getRepoParameter(), branch: getBranchParameter(), node: getNodeParameter()}));
                row.checkbox.addClickListener((event) => event.stopPropagation());
            }
        }
    }

    function deleteNodes() {
        showConfirmationDialog("Delete selected nodes?", 'DELETE', doDeleteNodes);
    }

    function doDeleteNodes() {
        const infoDialog = showInfoDialog("Deleting selected nodes...");
        const nodeKeys = tableCard.getSelectedRows().map((row) => row.attributes['id']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-delete',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                keys: nodeKeys
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveNodes();
        });
    }

    function refreshBreadcrumbs() {
        const repositoryName = getRepoParameter();
        const branchName = getBranchParameter();
        const path = getPathParameter();

        breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
                new RcdMaterialBreadcrumb('Data Tree', () => setState('repositories')).init(),
                new RcdMaterialBreadcrumb(repositoryName, () => setState('branches', {repo: repositoryName})).init(),
                new RcdMaterialBreadcrumb(branchName, path && (() => setState('nodes',{repo: repositoryName, branch: branchName}))).init()]);

        if (path) {
            breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb('root', path === '/' ? undefined :
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
                    breadcrumbsLayout.addBreadcrumb(new RcdMaterialBreadcrumb(subPathElement, index < array.length - 1
                        ? (() => setState('nodes', {repo: repositoryName, branch: branchName, path: constCurrentPath}))
                        : undefined).init());
                });
            }
        } else {
            app.setTitle(branchName);
        }
    }

    function displayHelp() {
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
