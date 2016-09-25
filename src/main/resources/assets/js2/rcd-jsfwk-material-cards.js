class RcdMaterialCard extends RcdDivElement {
    constructor(title) {
        super();
        this.title = new RcdTextDivElement(title).
            init().
            addClass('rcd-material-card-title');
        this.icons = new RcdDivElement().init().
            addClass('rcd-material-card-action-icons');
        this.header = new RcdDivElement().init().
            addClass('rcd-material-card-header').
            addChild(this.title).
            addChild(this.icons);
        this.content = new RcdDivElement().
            init().
            addClass('rcd-material-card-content');
    }

    init() {
        return this.addClass('rcd-material-card').
            addChild(this.header).
            addChild(this.content);
    }

    addIcon(iconName, callback) {
        var icon = new RcdGoogleMaterialIcon(iconName).init();
        var div = new RcdDivElement().
            init().
            addClass('rcd-material-card-action-icon').
            addChild(icon).
            onClick(callback);
        this.icons.addChild(div);
        return this;
    }

    addContent(content) {
        this.content.addChild(content);
    }
}