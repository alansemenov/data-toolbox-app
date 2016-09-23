class RcdGoogleMaterialIcon extends RcdIElement {
    constructor(iconName) {
        super();
        this.iconName = iconName;
    }

    init() {
        return this.addClass('material-icons').
            setText(this.iconName);
    }
}

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

class RcdMaterialNav extends RcdNavElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-nav');
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
document.body.appendChild(main.getDomElement());