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

        let addedNodeCount = 0;
        let updatedNodeCount = 0;
        let importedBinaryCount = 0;
        let errorCount = 0;
        for (let i = 0; i < this.exportNames.length; i++) {
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
        for (let i = 0; i < this.exportNames.length; i++) {
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

class ExportResultDialog extends RcdMaterialModalDialog {
    constructor(result, type = 'node') {
        super('Export result', undefined, true, true);
        this.result = result;
        this.type = type;
    }

    init() {
        const closeCallback = () =>  this.close();
        const detailsCallback = () => this.displayDetails();

        let exportedNodeCount = this.result.exportedNodeCount;
        let exportedBinaryCount = this.result.exportedBinaryCount;
        let errorCount = this.result.errorCount;

        const summary = 'Exported ' + this.type + 's: ' + exportedNodeCount + '\n' +
                        'Exported binaries: ' + exportedBinaryCount + '\n' +
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
        const exportedNodes = this.type === 'content' ? this.result.exportedNodes.map(nodePathToContentPath) : this.result.exportedNodes;

        text += '# exported ' + this.type + 's: ' + this.result.exportedNodeCount + '\n' +
                '# exported binaries: ' + this.result.exportedBinaryCount + '\n' +
                '# errors: ' + this.result.errorCount + '\n' +
                'Exported ' + this.type + 's: ' + JSON.stringify(exportedNodes, null, 2) + '\n' +
                'Exported binaries: ' + JSON.stringify(this.result.exportedBinaries, null, 2) + '\n' +
                'Errors: ' + JSON.stringify(this.result.errors, null, 2) + '\n\n';

        showDetailsDialog('Export result details', text);
    }
}

class DumpResultDialog extends RcdMaterialModalDialog {
    constructor(result, load) {
        super((load ? 'Load' : 'Dump') + ' result', undefined, true, true);
        this.result = result;
        this.load = load;
    }

    init() {
        const closeCallback = () =>  this.close();
        const errorsCallback = () => this.displayErrors();

        let summary = '';
        let dumpedNodeCount = 0;
        let errorCount = 0;
        for (let repositoryName in this.result) {
            const repositoryDumpResult = this.result[repositoryName];
            summary += '<b>Repository [' + repositoryName + ']</b>\n';
            for (let branchName in repositoryDumpResult) {
                const branchDumpResult = repositoryDumpResult[branchName];
                summary += 'Branch [' + branchName + ']: ' + branchDumpResult.successful +
                           ' nodes ' + (this.load ? 'loaded' : 'dumped');
                if (branchDumpResult.errorCount > 0) {
                    summary += ' and ' + branchDumpResult.errorCount + ' errors';
                }
                summary += '.\n';
                dumpedNodeCount += branchDumpResult.successful;
                errorCount += branchDumpResult.errorCount;
            }
            summary += '\n';
        }

        summary = (this.load ? 'Loaded' : 'Dumped') + ' nodes: ' + dumpedNodeCount + '\n' +
                  'Errors: ' + errorCount + '\n\n'
                  + summary;
        const resultItem = new RcdTextElement(summary).init();

        super.init().
            addItem(resultItem).
            addAction('CLOSE', closeCallback).
            addKeyUpListener('Escape', closeCallback);

        if (errorCount > 0) {
            this.addAction('ERRORS', errorsCallback).
                addKeyUpListener('Enter', errorsCallback);
        } else {
            this.addKeyUpListener('Enter', closeCallback);
        }

        return this;
    }

    displayErrors() {
        this.close();

        let text = '';
        for (let repositoryName in this.result) {
            const repositoryDumpResult = this.result[repositoryName];
            for (let branchName in repositoryDumpResult) {
                let branchText = '';
                if (repositoryDumpResult[branchName].errors) {
                    repositoryDumpResult[branchName].errors.forEach(error => {
                        branchText += error + '\n';
                    });
                }
                if (branchText) {
                    text += '<b>Repository/Branch [' + repositoryName + '/' + branchName + ']</b>\n' + branchText;
                }
            }
        }

        showDetailsDialog((this.load ? 'Load' : 'Dump') +' errors', text);
    }
}

function nodePathToContentPath(nodePath) {
    if (!nodePath || !nodePath.startsWith('/content')) {
        return nodePath;
    }
    const contentPath = nodePath.substr('/content'.length);
    return contentPath === '' ? '/' : contentPath;
}