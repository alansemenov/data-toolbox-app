class RcdMaterialHeader extends RcdHeaderElement {
    constructor(title) {
        super();
        var icon = new RcdGoogleMaterialIcon('menu').init();
        this.menuIcon = new RcdDivElement().
            init().
            addClass('rcd-material-menu').
            addChild(icon);

        this.title = new RcdTextDivisionElement(title).init().
            addClass('rcd-material-title');
    }

    init() {
        return this.addClass('rcd-material-header').
            addChild(this.menuIcon).
            addChild(this.title);
    }
}

class RcdMaterialNavLink extends RcdDivElement {
    constructor(iconName, text) {
        super();
        this.icon = new RcdGoogleMaterialIcon(iconName).init().addClass('rcd-material-nav-icon');
        this.text = new RcdTextElement(text).init();
    }

    init() {
        return this.addClass('rcd-material-nav-link').
            addChild(this.icon).
            addChild(this.text);
    }
}

class RcdMaterialNav extends RcdNavElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-nav');
    }

    addLink(iconName, text) {
        var link = new RcdMaterialNavLink(iconName, text).init();
        return this.addChild(link);
    }
}

class RcdMaterialMain extends RcdMainElement {
    constructor() {
        super();
        this.nav = new RcdMaterialNav().init();
    }

    init() {
        return this.addClass('rcd-material-main').addChild(this.nav);
    }
}

var header = new RcdMaterialHeader('Data toolbox').init();
document.body.appendChild(header.getDomElement());

var main = new RcdMaterialMain().init();
main.nav.addLink('file_download', 'Dumps').
    addLink('photo_camera', 'Snapshots');


document.body.appendChild(main.getDomElement());