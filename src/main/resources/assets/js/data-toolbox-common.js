//
class HelpDialog extends RcdMaterialModalDialog {
    constructor(viewName, definitions = []) {
        super('Help: ' + viewName + ' view', undefined, true, true);
        this.definitions = definitions;
    }

    init() {
        const closeCallback = () =>  this.close();
        super.init().
            addAction('CLOSE', closeCallback).
            addKeyUpListener('Enter', closeCallback).
            addKeyUpListener('Escape', closeCallback);

        this.definitions.forEach(definition => {
            const definitionElement = new RcdPElement().init().
                setText(definition).
                addClass('help-definition');
            this.addItem(definitionElement);
        });
        this.dialog.addClass('help-dialog');
        return this;
    }

    addActionDefinition(params) {
        const actionDefinition = new RcdDivElement().init().
            addClass('help-action-definition');
        if (params.iconName) {
            actionDefinition.addChild(new RcdGoogleMaterialIcon(params.iconName).init());
        } else if (params.iconSrc) {
            actionDefinition.addChild(new RcdImageIcon(params.iconSrc).init().addClass('image'));
        }
        actionDefinition.addChild(new RcdPElement().init().setText(params.definition));
        return this.addItem(actionDefinition);
    }
}

class ImportResultDialog extends RcdMaterialModalDialog {
    constructor(exportName, importResult, type = 'node') {
        super('Import result', 'Added ' + type + 's: ' + importResult.addedNodeCount + '\n' +
                               'Updated ' + type + 's: ' + importResult.updatedNodeCount + '\n' +
                               'Imported binaries: ' + importResult.importedBinaryCount + '\n' +
                               'Errors: ' + importResult.errorCount, true, true);
        this.exportName = exportName;
        this.result = importResult;
        this.type = type;
    }

    init() {
        const closeCallback = () =>  this.close();
        const detailsCallback = () => {
            this.close();
            const addedNodes = this.type === 'content' ? this.result.addedNodes.map(nodePathToContentPath) : this.result.addedNodes;
            const updatedNodes = this.type === 'content' ? this.result.updatedNodes.map(nodePathToContentPath) : this.result.addedNodes;

            const text = '# added ' + this.type + 's: ' + this.result.addedNodeCount + '\n' +
                         '# updated ' + this.type + 's: ' + this.result.updatedNodeCount + '\n' +
                         '# imported binaries: ' + this.result.importedBinaryCount + '\n' +
                         '# errors: ' + this.result.errorCount + '\n' +
                         'Added ' + this.type + 's: ' + JSON.stringify(addedNodes, null, 2) + '\n' +
                         'Updated ' + this.type + 's: ' + JSON.stringify(updatedNodes, null, 2) + '\n' +
                         'Imported binaries: ' + JSON.stringify(this.result.importedBinaries, null, 2) + '\n' +
                         'Errors: ' + JSON.stringify(this.result.errors, null, 2);
            showDetailsDialog('Import result details', text);
        };
        super.init().
            addAction('CLOSE', closeCallback).
            addAction('DETAILS', detailsCallback).
            addKeyUpListener('Enter', detailsCallback).
            addKeyUpListener('Escape', closeCallback);
        return this;
    }
}

function nodePathToContentPath(nodePath) {
    if (!nodePath || !nodePath.startsWith('/content')) {
        return nodePath;
    }
    const contentPath = nodePath.substr('/content'.length);
    return contentPath === '' ? '/' : contentPath;
}