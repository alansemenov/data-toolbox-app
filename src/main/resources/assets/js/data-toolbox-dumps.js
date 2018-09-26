class DtbDumpInputDialog extends RcdMaterialInputDialog {
    constructor(params) {
        super({
            title: 'Create dump',
            label: 'Dump name',
            placeholder: params.defaultValue,
            value: params.defaultValue,
            confirmationLabel: 'CREATE',
            callback: (value) => {
                params.callback({
                    name: value || params.defaultValue,
                    includeVersions: this.includeVersionsCheckbox.isSelected(),
                    maxVersions: this.includeVersionsCheckbox.isSelected() && this.maxVersionsField.getValue() ? Number(
                        this.maxVersionsField.getValue()) : undefined,
                    maxVersionsAge: this.includeVersionsCheckbox.isSelected() && this.maxVersionsAgeField.getValue() ? Number(
                        this.maxVersionsAgeField.getValue()) : undefined
                });
            }
        });

        this.includeVersionsCheckbox = new RcdMaterialCheckbox().init()
            .select(true)
            .addClickListener(() => {
                const includeVersion = !this.includeVersionsCheckbox.isSelected();
                this.includeVersionsCheckbox.select(includeVersion);
                this.maxVersionsField.show(includeVersion);
                this.maxVersionsAgeField.show(includeVersion);
                this.checkValidity();
            });
        this.includeVersionsLabel = new RcdTextDivElement('Include version history')
            .init()
            .addClass('dtb-include-versions-label');
        this.includeVersionsField = new RcdDivElement()
            .init()
            .addClass('dtb-include-versions-field')
            .addChild(this.includeVersionsCheckbox)
            .addChild(this.includeVersionsLabel);

        this.maxVersionsField = new RcdMaterialTextField('', 'Max. number of versions (opt.)')
            .init()
            .setPattern('[0-9]*')
            .addInputListener(() => this.checkValidity());

        this.maxVersionsAgeField = new RcdMaterialTextField('', 'Max. age of versions (days) (opt.)')
            .init()
            .setPattern('[0-9]*')
            .addInputListener(() => this.checkValidity());
    }

    init() {
        super.init();

        //TODO Remove after upgrade of min Enonic XP version
        if (config.xpVersion.indexOf('6.13.') !== 0) {
            this.addItem(this.includeVersionsField)
            // .addItem(this.maxVersionsField)
            // .addItem(this.maxVersionsAgeField);
        }
        return this;
    }

    checkValidity() {
        this.enable(this.isValid());
        return this;
    }

    isValid() {
        if (this.includeVersionsCheckbox.isSelected()) {
            if (!this.maxVersionsField.checkValidity()) {
                return false;
            }
            if (!this.maxVersionsAgeField.checkValidity()) {
                return false;
            }
        }
        return true;
    }
}

class DumpsRoute extends DtbRoute {
    constructor() {
        super({
            state: 'dumps',
            name: 'System Dumps',
            iconArea: new RcdImageIconArea(config.assetsUrl + '/icons/dump.svg').init()
        });
    }

    onDisplay() {
        this.retrieveDumps();
    }

    createBreadcrumbsLayout() {
        return new RcdMaterialBreadcrumbsLayout().init().addBreadcrumb(
            new RcdMaterialBreadcrumb('Data Toolbox', () => setState()).init()).addBreadcrumb(
            new RcdMaterialBreadcrumb('System dumps').init()).addChild(
            new RcdGoogleMaterialIconArea('help', () => this.displayHelp()).init().setTooltip('Help'));
    }

    createLayout() {
        this.tableCard = new RcdMaterialTableCard('System dumps').init().addColumn('Dump name').addColumn('Timestamp',
            {classes: ['non-mobile-cell']}).addColumn('Version', {classes: ['non-mobile-cell', 'version-cell']}).addIconArea(
            new RcdGoogleMaterialIconArea('add_circle', () => this.createDump()).init().setTooltip('Generate a system dump'),
            {max: 0}).addIconArea(new RcdImageIconArea(config.assetsUrl + '/icons/load.svg', () => this.loadDump()).init().setTooltip(
            'Load selected system dump'),
            {min: 1, max: 1}).addIconArea(new RcdGoogleMaterialIconArea('file_download',
            () => this.downloadDumps()).init().setTooltip('Archive and download selected system dumps'), {min: 1}).addIconArea(
            new RcdGoogleMaterialIconArea('file_upload', () => this.uploadDumps()).init().setTooltip('Upload and unarchive system dumps',
                RcdMaterialTooltipAlignment.RIGHT), {max: 0}).addIconArea(
            new RcdGoogleMaterialIconArea('delete', () => this.deleteDumps()).init().setTooltip('Delete selected system dumps',
                RcdMaterialTooltipAlignment.RIGHT), {min: 1});
        return new RcdMaterialLayout().init().addChild(this.tableCard);
    }

    retrieveDumps() {
        const infoDialog = showShortInfoDialog('Retrieving dump list...');
        return $.ajax({
            url: config.servicesUrl + '/dump-list'
        }).done((result) => {
            this.tableCard.deleteRows();
            if (handleResultError(result)) {
                result.success.sort((dump1, dump2) => dump2.timestamp - dump1.timestamp).forEach((dump) => {
                    this.tableCard.createRow().addCell(dump.name).addCell(toLocalDateTimeFormat(new Date(dump.timestamp)),
                        {classes: ['non-mobile-cell']}).addCell(dump.version, {classes: ['non-mobile-cell', 'version-cell']}).setAttribute(
                        'dump', dump.name).setAttribute('type', dump.type);
                });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    createDump() {
        const defaultDumpName = 'dump-' + toLocalDateTimeFormat(new Date(), '-', '-');
        new DtbDumpInputDialog({
            defaultValue: defaultDumpName,
            callback: (value) => this.doCreateDump(value)
        }).init().open();
    }

    doCreateDump(params) {
        const infoDialog = showLongInfoDialog('Creating dump...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-create',
            data: JSON.stringify({
                dumpName: params.name || ('dump-' + toLocalDateTimeFormat(new Date(), '-', '-')),
                includeVersions: params.includeVersions,
                maxVersions: params.maxVersions,
                maxVersionsAge: params.maxVersionsAge,
            }),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => handleTaskCreation(result, {
            taskId: result.taskId,
            message: 'Creating dump...',
            doneCallback: (success) => new DumpResultDialog(success).init().open(),
            alwaysCallback: () => this.retrieveDumps()
        })).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    deleteDumps() {
        showConfirmationDialog('Delete selected dumps?', 'DELETE', () => this.doDeleteDumps());
    }

    doDeleteDumps() {
        const infoDialog = showLongInfoDialog("Deleting dumps...");
        const dumpNames = this.tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-delete',
            data: JSON.stringify({dumpNames: dumpNames}),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => handleTaskCreation(result, {
            taskId: result.taskId,
            message: 'Deleting dumps...',
            doneCallback: () => displaySnackbar('Dump' + (dumpNames.length > 1 ? 's' : '') + ' deleted'),
            alwaysCallback: () => this.retrieveDumps()
        })).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    loadDump() {
        const dumpName = this.tableCard.getSelectedRows().map((row) => row.attributes['dump'])[0];
        const dumpType = this.tableCard.getSelectedRows().map((row) => row.attributes['type'])[0];
        if ('export' === dumpType) {
            this.doLoadDump(dumpName, dumpType);
        } else {
            showConfirmationDialog('Loading this dump will delete all existing repositories', 'LOAD',
                () => this.doLoadDump(dumpName, dumpType));
        }
    }

    doLoadDump(dumpName, dumpType) {
        const infoDialog = showLongInfoDialog("Loading dump...");
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-load',
            data: JSON.stringify({dumpName: dumpName}),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => handleTaskCreation(result, {
            taskId: result.taskId,
            message: 'Loading dump...',
            doneCallback: (success) => {
                if (dumpType === 'export') {
                    new LoadExportDumpDialog(success).init().open();
                } else {
                    new DumpResultDialog(success, true).init().open();
                }
            }
        })).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    downloadDumps() {
        const dumpNames = this.tableCard.getSelectedRows().map((row) => row.attributes['dump']);
        const infoDialog = showLongInfoDialog("Archiving dumps...");
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-archive',
            data: JSON.stringify({dumpNames: dumpNames}),
            contentType: 'application/json; charset=utf-8'
        }).done((result) => handleTaskCreation(result, {
            taskId: result.taskId,
            message: 'Archiving dumps...',
            doneCallback: (success) => {
                const archiveNameInput = new RcdInputElement().init().setAttribute('type', 'hidden').setAttribute('name',
                    'archiveName').setAttribute('value', success);
                const fileNameInput = new RcdInputElement().init().setAttribute('type', 'hidden').setAttribute('name',
                    'fileName').setAttribute('value', (dumpNames.length == 1 ? dumpNames[0] : "dump-download") + '.zip');
                const downloadForm = new RcdFormElement().init().setAttribute('action', config.servicesUrl + '/dump-download').setAttribute(
                    'method', 'post').addChild(archiveNameInput).addChild(fileNameInput);
                document.body.appendChild(downloadForm.domElement);
                downloadForm.submit();
                document.body.removeChild(downloadForm.domElement);
            }
        })).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    uploadDumps() {
        const uploadFileInput = new RcdInputElement().init().setAttribute('type', 'file').setAttribute('name',
            'uploadFile').addChangeListener(() => this.doUploadDumps());
        this.uploadForm = new RcdFormElement().init().addChild(uploadFileInput);
        uploadFileInput.click();
    }

    doUploadDumps() {
        const infoDialog = showLongInfoDialog("Uploading dumps...");
        const formData = new FormData(this.uploadForm.domElement);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/dump-upload',
            data: formData,
            contentType: false,
            processData: false
        }).done((result) => handleTaskCreation(result, {
            taskId: result.taskId,
            message: 'Uploading dumps...',
            doneCallback: () => displaySnackbar('Dump(s) uploaded'),
            alwaysCallback: () => this.retrieveDumps()
        })).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    displayHelp() {
        const definition = 'A system dump is an export of your entire data (contents, users, groups, roles, ...) from your Enonic XP server to a serialized format.<br/>' +
                           'While a node/content export focuses on a given node and its children, a system dump is used to export an entire system (all repositories/branches/nodes). ' +
                           'This makes dumps well suited for migrating your data to another installation.<br/>' +
                           'Warning: System dumps generated by Enonic XP <6.11 are similar to exports. They contain only the latest version of the nodes and loading these system dumps will keep or overwrite existing data. ' +
                           'System dumps generated by Enonic XP >=6.11 are similar to backups. They contain the version history of the nodes and loading these system dumps will delete existing data.<br/>' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.11/operations/export.html">Export and Import</a> for more information.';

        const viewDefinition = 'The view lists in a table all the system dumps located in $XP_HOME/data/dump. ' +
                               'You can delete, load or archive (ZIP) and download existing dumps. ' +
                               'You can also generate a new dump of your system or upload previously archived dumps.';

        new HelpDialog('System Dumps', [definition, viewDefinition]).init().addActionDefinition(
            {iconName: 'add_circle', definition: 'Generate a system dump into $XP_HOME/data/dump/[dump-name]'}).addActionDefinition(
            {iconName: 'refresh', definition: 'Load the selected system dumps into Enonic XP'}).addActionDefinition(
            {iconName: 'file_download', definition: 'Zip the selected dumps and download the archive'}).addActionDefinition(
            {iconName: 'file_upload', definition: 'Upload archived dumps and unzip them into $XP_HOME/data/dump'}).addActionDefinition(
            {iconName: 'delete', definition: 'Delete the selected system dumps.'}).open();
    }

}
