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

    addActionDefinition(iconName, definition) {
        const actionDefinition = new RcdDivElement().init().
            addClass('help-action-definition').
            addChild(new RcdGoogleMaterialIcon(iconName).init()).
            addChild(new RcdPElement().init().setText(definition));
        return this.addItem(actionDefinition);
    }
}