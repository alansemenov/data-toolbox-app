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