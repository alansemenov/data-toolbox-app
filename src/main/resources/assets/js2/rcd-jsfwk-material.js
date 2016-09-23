class RcdMaterialHeader extends RcdHeaderElement {
    constructor(title) {
        super();
        var icon = new RcdGoogleMaterialIcon('menu').init();
        this.menuIcon = new RcdDivElement().
            init().
            addClass('rcd-material-menu').
            addChild(icon);

        this.title = new RcdTextDivElement(title).init().
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

class RcdMaterialView extends RcdDivElement {
    constructor(title) {
        super();
        this.title = new RcdTextDivElement(title).
            init().
            addClass('rcd-material-content-title')
        this.header = new RcdDivElement().
            init().
            addClass('rcd-material-content-header').
            addChild(this.title);
    }

    init() {
        return this.addClass('rcd-material-view').addChild(this.header);
    }
}

class RcdMaterialContent extends RcdDivElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-content');
    }
}

class RcdMaterialMain extends RcdMainElement {
    constructor() {
        super();
        this.nav = new RcdMaterialNav().init();
        this.content = new RcdMaterialContent().init();
    }

    init() {
        return this.addClass('rcd-material-main').
            addChild(this.nav).
            addChild(this.content);
    }
}

var header = new RcdMaterialHeader('Data toolbox').init();
document.body.appendChild(header.getDomElement());

var main = new RcdMaterialMain().init();

//Fills the nav bar
main.nav.addLink('file_download', 'Dumps').
    addLink('photo_camera', 'Snapshots');

//Creates presentation view
var presentationView = new RcdMaterialView('Presentation').init();
main.content.addChild(presentationView);


document.body.appendChild(main.getDomElement());