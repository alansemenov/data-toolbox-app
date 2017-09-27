function createNodesRoute() {
    const breadcrumbsLayout = createBreadcrumbsLayout();
    const tableCard = createTableCard();
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);;
    
    return {
        state: 'nodes',
        callback: (main) => {
            refreshBreadcrumbs();
            retrieveNodes();
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
        const exportIconArea = new RcdImageIconArea(config.assetsUrl + '/icons/export-icon.svg', exportNode).init().
            setTooltip('Export selected node');
        const importIconArea = new RcdImageIconArea(config.assetsUrl + '/icons/import-icon.svg', importNode).init().
            setTooltip('Import node export');
        const filterIconArea = new RcdGoogleMaterialIconArea('filter_list', filterNodes).init().
            setTooltip('Filter nodes');
        const sortIconArea = new RcdGoogleMaterialIconArea('sort', sortNodes).init().
            setTooltip('Sort nodes');
        const deleteIconArea = new RcdGoogleMaterialIconArea('delete', deleteNodes).init().
            setTooltip('Delete selected nodes', RcdMaterialTooltipAlignment.RIGHT);
        return new RcdMaterialTableCard('Nodes').init().
            addColumn('Node name').
            addColumn('Node ID', {classes: ['non-mobile-cell']}).
            addColumn('', {icon: true}).
            addColumn('', {icon: true}).
            addIconArea(exportIconArea, {min: 1, max: 1}).
            addIconArea(importIconArea, {max: 0}).
            addIconArea(filterIconArea, {max: 0}).
            addIconArea(sortIconArea, {max: 0}).
            addIconArea(deleteIconArea, {min: 1});
    }

    function retrieveNodes() {
        const infoDialog = showInfoDialog('Retrieving node list...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-getchildren',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                parentPath: getPathParameter(),
                start: getStartParameter(),
                count: getCountParameter(),
                filter: getFilterParameter(),
                sort: getSortParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(onNodesRetrieval).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function onNodesRetrieval(result) {
        tableCard.deleteRows();

        tableCard.createRow({selectable:false}).
            addCell('..').
            addCell('', {classes: ['non-mobile-cell']}).
            addCell(null, {icon: true}).
            addCell(null, {icon: true}).
            addClass('rcd-clickable').
            addClickListener(() => {
                if (getPathParameter()) {
                    setState('nodes', {repo:getRepoParameter(), branch: getBranchParameter() + (getPathParameter() === '/' ? '' : '&path=' + getParentPath() ) })
                } else {
                    setState('branches', {repo:getRepoParameter()});
                }
            });

        if (handleResultError(result)) {
            result.success.hits.forEach((node) => {
                const displayFieldsIconArea = new RcdImageIconArea(config.assetsUrl + '/icons/fields.svg', (source, event) => {
                    setState('fields',{repo: getRepoParameter(), branch: getBranchParameter(), path: node._path, field:'/'});
                    event.stopPropagation();
                }).init().setTooltip('Display fields');
                const displayJsonIconArea = new RcdImageIconArea(config.assetsUrl + '/icons/json.svg', (source, event) => {
                    displayNodeAsJson(node._id);
                    event.stopPropagation();
                }).init().setTooltip('Display as JSON');

                const row = tableCard.createRow().
                    addCell(node._name).
                    addCell(node._id, {classes: ['non-mobile-cell']}).
                    addCell(displayFieldsIconArea, {icon: true}).
                    addCell(displayJsonIconArea, {icon: true}).
                    setAttribute('id', node._id).
                    setAttribute('path', node._path).
                    setAttribute('name', node._name).
                    addClass('rcd-clickable').
                    addClickListener(() => setState('nodes', {repo: getRepoParameter(), branch: getBranchParameter(), path: node._path}));
                row.checkbox.addClickListener((event) => event.stopPropagation());
            });

            const startInt = parseInt(getStartParameter());
            const countInt = parseInt(getCountParameter());
            const previousCallback = () => setState('nodes', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                start: Math.max(0, startInt - countInt),
                count: getCountParameter(),
                filter: getFilterParameter(),
                sort: getSortParameter()});
            const nextCallback = () => setState('nodes', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                start: startInt + countInt,
                count: getCountParameter(),
                filter: getFilterParameter(),
                sort: getSortParameter()});
            tableCard.setFooter({
                start: parseInt(getStartParameter()),
                count: result.success.hits.length,
                total: result.success.total,
                previousCallback: previousCallback,
                nextCallback: nextCallback
            });
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

    function displayNodeAsJson(nodeKey) {
        if (!nodeKey) {
            nodeKey = tableCard.getSelectedRows().map((row) => row.attributes['id'])[0];
        }

        const infoDialog = showInfoDialog("Retrieving node info...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-get',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: nodeKey
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            if (handleResultError(result)) {
                const formattedJson = formatJson(result.success, '');
                showDetailsDialog('Node [' + nodeKey + ']', formattedJson).
                    addClass('node-details-dialog');
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function formatJson(value, tab) {
        if (typeof value === 'string') {
            return '<a class=json-string>"' + value + '"</a>';
        } else if (typeof value === "number") {
            return '<a class=json-number>' + value + '</a>';
        } else if (typeof value === "boolean") {
            return '<a class=json-boolean>' + value + '</a>';
        } else if (Array.isArray(value)) {
            let formattedArray = '[\n';
            for (let i = 0; i < value.length; i++) {
                const arrayElement = value[i];
                formattedArray += tab + '  ' + formatJson(arrayElement, tab + '  ') + (i < (value.length - 1) ? ',' : '') + '\n';
            }
            formattedArray += tab + ']';
            return formattedArray;
        } else if (typeof value === "object") {
            let formattedObject = '{\n';
            const attributeNames = Object.keys(value);
            for (let i = 0; i < attributeNames.length; i++) {
                const attributeName = attributeNames[i];
                formattedObject += tab + '  "' + attributeName + '": ' + formatJson(value[attributeName], tab + '  ') +
                                   (i < (attributeNames.length - 1) ? ',' : '') + '\n';
            }
            formattedObject += tab + '}';
            return formattedObject;
        } else {
            return value;
        }
    }

    function filterNodes() {
        showInputDialog({
            title: "Filter nodes",
            confirmationLabel: "FILTER",
            label: "Query expression",
            placeholder: '',
            value: decodeURIComponent(getFilterParameter()),
            callback: (value) => setState('nodes', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                start: 0,
                count: getCountParameter(),
                filter: encodeURIComponent(value),
                sort: getSortParameter()})
        });
    }

    function sortNodes() {
        showInputDialog({
            title: "Sort nodes",
            confirmationLabel: "SORT",
            label: "Sort expression",
            placeholder: '',
            value: decodeURIComponent(getSortParameter()),
            callback: (value) => setState('nodes', {
                repo: getRepoParameter(),
                branch: getBranchParameter(),
                path: getPathParameter(),
                start: 0,
                count: getCountParameter(),
                filter: getFilterParameter(),
                sort: encodeURIComponent(value)})
        });
    }

    function exportNode() {
        const nodeName = getPathParameter()
            ? (tableCard.getSelectedRows().map((row) => row.attributes['name'])[0] || 'export')
            : getRepoParameter() + '-' + getBranchParameter();
        const defaultExportName = nodeName + '-' + toLocalDateTimeFormat(new Date(), '-', '-');
        showInputDialog({
            title: "Export node",
            confirmationLabel: "EXPORT",
            label: "Export name",
            placeholder: defaultExportName,
            value: defaultExportName,
            callback: (value) => doExportNode(value || defaultExportName)
        });
    }

    function doExportNode(exportName) {
        const infoDialog = showInfoDialog("Exporting selected node...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-export',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                nodePath: tableCard.getSelectedRows().map((row) => row.attributes['path'])[0],
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function(result) {
            if (handleResultError(result)) {
                new ExportResultDialog(result.success).init().
                    open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            setState('exports');
        });
    }

    function importNode() {
        const infoDialog = showInfoDialog("Retrieving node export list...");
        return $.ajax({
            url: config.servicesUrl + '/export-list'
        }).done(function (result) {
            if (handleResultError(result)) {
                const exportNames = result.success.
                    sort((export1, export2) => export2.timestamp - export1.timestamp).
                    map((anExport) =>anExport.name);
                selectNodeExport(exportNames);
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function selectNodeExport(exportNames) {
        showSelectionDialog({
            title: "Select node export",
            confirmationLabel: "IMPORT",
            label: "Export name",
            options: exportNames,
            callback: (value) => doImportNode(value)
        });
    }

    function doImportNode(exportName) {
        const infoDialog = showInfoDialog("Importing node...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-import',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                nodePath: getPathParameter() || '/',
                exportName: exportName
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            if (handleResultError(result)) {
                new ImportResultDialog([exportName], result.success).init().
                    open();
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
            RcdHistoryRouter.refresh();
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
    
    function getParentPath() {
        const path = getPathParameter();
        const parentPath = path && path.substring(0, path.lastIndexOf('/'));
        return parentPath ? parentPath : '/';
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
