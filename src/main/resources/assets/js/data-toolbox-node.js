class NodeDetailsCard extends RcdDivElement {
    constructor() {
        super();
    }

    init() {
        return super.init()
            .addClass('dtb-node-details');
    }

    setMeta(meta) {
        const primaryElement = new RcdTextElement('System properties').init();
        const detailsText = 'ID: ' + meta._id + '<br/>' +
                            'Path: ' + meta._path + '<br/>' +
                            'Version key: ' + meta._versionKey + '<br/>' +
                            'Type: ' + meta._nodeType + '<br/>' +
                            'Timestamp: ' + meta._timestamp + '<br/>' +
                            'State: ' + meta._state + '<br/>' +
                            'Child order: ' + meta._childOrder + '<br/>' +
                            'Manual order value: ' + meta._manualOrderValue;
        const detailsElement = new RcdTextElement(detailsText).init();
        this.addChild(primaryElement).addChild(detailsElement);
    }


}

class NodeRoute extends DtbRoute {
    constructor() {
        super({
            state: 'node'
        });
    }

    onDisplay() {
        this.refreshBreadcrumbs();
        this.retrieveMeta();
    }

    createLayout() {
        this.nodeDetails = new NodeDetailsCard()
            .init();

        this.displayCard = new RcdMaterialListCard().init()
            .addClass('dtb-node-display-card')
            .addRow('Display children ', null,
                {callback: () => alert('a'), icon: new RcdImageIcon(config.assetsUrl + '/icons/datatree.svg').init()})
            .addRow('Display children ', null,
                {callback: () => alert('a'), icon: new RcdImageIcon(config.assetsUrl + '/icons/datatree.svg').init()});

        return new RcdMaterialLayout()
            .init()
            .addClass('dtb-node-layout')
            .addChild(this.nodeDetails)
            .addChild(this.displayCard);
    }

    retrieveMeta() {
        const infoDialog = showShortInfoDialog('Retrieving2 system properties...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/meta-get',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: getKeyParameter()
            }),
            contentType: 'application/json; charset=utf-8'
        })
            .done((result) => this.onMetaRetrieval(result))
            .fail(handleAjaxError)
            .always(() => {
                infoDialog.close();
            });
    }

    onMetaRetrieval(result) {
        this.nodeDetails.clear();
        this.displayCard.deleteRows();
        if (handleResultError(result)) {
            const meta = result.success;
            this.nodeDetails.setMeta(meta);


            const displayChildrenCallback = () => setState('nodes',
                {repo: getRepoParameter(), branch: getBranchParameter(), path: meta._path});
            const displayPropertiesCallback = () => setState('properties',
                {repo: getRepoParameter(), branch: getBranchParameter(), path: meta._path});
            const displayPermissionsCallback = () => setState('permissions',
                {repo: getRepoParameter(), branch: getBranchParameter(), path: meta._path});
            const displayJsonCallback = () => this.displayNodeAsJson(meta._id);

            this.displayCard
                .addRow('Display children ', null,
                    {callback: displayChildrenCallback, icon: new RcdImageIcon(config.assetsUrl + '/icons/datatree.svg').init()})
                .addRow('Display properties ', null,
                    {callback: displayPropertiesCallback, icon: new RcdImageIcon(config.assetsUrl + '/icons/properties.svg').init()})
                .addRow('Display permission ', null,
                    {callback: displayPermissionsCallback, icon: new RcdGoogleMaterialIcon('lock').init()})
                .addRow('Display as JSON ', null,
                    {callback: displayJsonCallback, icon: new RcdImageIcon(config.assetsUrl + '/icons/json.svg').init()})
        }
    }

    displayNodeAsJson(nodeKey) {
        const infoDialog = showShortInfoDialog("Retrieving node info...");
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/node-get',
            data: JSON.stringify({
                repositoryName: getRepoParameter(),
                branchName: getBranchParameter(),
                key: nodeKey
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => {
            if (handleResultError(result)) {
                const formattedJson = this.formatJson(result.success, '');
                showDetailsDialog('Node [' + nodeKey + ']', formattedJson).addClass('node-details-dialog');
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    formatJson(value, tab) {
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
                formattedArray += tab + '  ' + this.formatJson(arrayElement, tab + '  ') + (i < (value.length - 1) ? ',' : '') + '\n';
            }
            formattedArray += tab + ']';
            return formattedArray;
        } else if (typeof value === "object") {
            let formattedObject = '{\n';
            const attributeNames = Object.keys(value);
            for (let i = 0; i < attributeNames.length; i++) {
                const attributeName = attributeNames[i];
                formattedObject += tab + '  "' + attributeName + '": ' + this.formatJson(value[attributeName], tab + '  ') +
                                   (i < (attributeNames.length - 1) ? ',' : '') + '\n';
            }
            formattedObject += tab + '}';
            return formattedObject;
        } else {
            return value;
        }
    }

    refreshBreadcrumbs() {
        const key = getKeyParameter();
        const fullId = getRepoParameter() + ':' + getBranchParameter() + ':' + key;

        this.breadcrumbsLayout.setBreadcrumbs([
            new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init(),
            new RcdMaterialBreadcrumb('Node Search', () => setState('search')).init(),
            new RcdMaterialBreadcrumb('Node ' + fullId).init()
        ]);
        app.setTitle(fullId);
    }

    displayHelp() {
        const viewDefinition = 'The view lists in a table all the system properties of the current node\' +\n' +
                               '                               \'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/developer/node-domain/system-properties.html">System properties</a> for more information. ';
        new HelpDialog('System properties', [viewDefinition]).init().open();
    }
}
