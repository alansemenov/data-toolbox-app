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
    constructor(exportNames, result, type = 'node') {
        super('Import result', undefined, true, true);
        this.exportNames = exportNames;
        this.result = result;
        this.type = type;
    }

    init() {
        const closeCallback = () =>  this.close();
        const detailsCallback = () => this.displayDetails();

        
        let addedNodeCount= 0;
        let updatedNodeCount= 0;
        let importedBinaryCount= 0;
        let errorCount= 0;
        for(let i = 0; i < this.exportNames.length; i++) {
            const result = this.result[this.exportNames[i]];
            addedNodeCount += result.addedNodeCount;
            updatedNodeCount += result.updatedNodeCount;
            importedBinaryCount += result.importedBinaryCount;
            errorCount += result.errorCount;
        }
        const summary = 'Added ' + this.type + 's: ' + addedNodeCount + '\n' +
                        'Updated ' + this.type + 's: ' + updatedNodeCount + '\n' +
                        'Imported binaries: ' + importedBinaryCount + '\n' +
                        'Errors: ' + errorCount;
        const resultItem = new RcdTextElement(summary).init();
        
        super.init().
            addItem(resultItem).
            addAction('CLOSE', closeCallback).
            addAction('DETAILS', detailsCallback).
            addKeyUpListener('Enter', detailsCallback).
            addKeyUpListener('Escape', closeCallback);
        return this;
    }
    
    displayDetails() {
        this.close();
        
        let text = '';
        for(let i = 0; i < this.exportNames.length; i++) {
            if (this.exportNames.length > 1) {
                text += '<b>' + this.exportNames[i] + '</b>\n';
            }
            const result = this.result[this.exportNames[i]];
            const addedNodes = this.type === 'content' ? result.addedNodes.map(nodePathToContentPath) : result.addedNodes;
            const updatedNodes = this.type === 'content' ? result.updatedNodes.map(nodePathToContentPath) : result.updatedNodes;

            text += '# added ' + this.type + 's: ' + result.addedNodeCount + '\n' +
                    '# updated ' + this.type + 's: ' + result.updatedNodeCount + '\n' +
                    '# imported binaries: ' + result.importedBinaryCount + '\n' +
                    '# errors: ' + result.errorCount + '\n' +
                    'Added ' + this.type + 's: ' + JSON.stringify(addedNodes, null, 2) + '\n' +
                    'Updated ' + this.type + 's: ' + JSON.stringify(updatedNodes, null, 2) + '\n' +
                    'Imported binaries: ' + JSON.stringify(result.importedBinaries, null, 2) + '\n' +
                    'Errors: ' + JSON.stringify(result.errors, null, 2) + '\n\n';
        }
        showDetailsDialog('Import result details', text);
    }
}

function nodePathToContentPath(nodePath) {
    if (!nodePath || !nodePath.startsWith('/content')) {
        return nodePath;
    }
    const contentPath = nodePath.substr('/content'.length);
    return contentPath === '' ? '/' : contentPath;
}