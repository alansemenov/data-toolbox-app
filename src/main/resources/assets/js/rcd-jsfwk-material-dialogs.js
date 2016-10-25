class RcdMaterialDialogContent extends RcdDivElement {
    constructor(content, title) {
        super();
        this.title = title ? new RcdTextDivElement(title).
            init().
            addClass('rcd-material-dialog-content-title') : undefined;
        this.body = new RcdTextDivElement(content).
            init().
            addClass('rcd-material-dialog-content-body');
    }

    init() {
        this.addClass('rcd-material-dialog-content');

        if (this.title) {
            this.addChild(this.title);
        }
        return this.addChild(this.body);
    }
}


class RcdMaterialDialog extends RcdDivElement {
    constructor(content, title) {
        super();
        this.content = new RcdMaterialDialogContent(content, title).init();
        this.actions = new RcdDivElement().init().
            addClass('rcd-material-dialog-actions');
    }

    init() {
        return this.addClass('rcd-material-dialog').
            addChild(this.content).
            addChild(this.actions);
    }

    addAction(action) {
        action.addClass('rcd-material-dialog-action'); //TODO
        this.actions.addChild(action);
        return this;
    }
}

class RcdMaterialModalDialog extends RcdDivElement {
    constructor(content, title) {
        super();
        this.dialog = new RcdMaterialDialog(content, title).init();
    }

    init() {
        return this.addClass('rcd-material-cache').
            addChild(this.dialog);
    }

    addAction(action) {
        this.dialog.addAction(action);
        return this;
    }
}