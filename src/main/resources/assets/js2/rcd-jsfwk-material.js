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
    constructor(iconName, text, callback) {
        super();
        this.icon = new RcdGoogleMaterialIcon(iconName).init().addClass('rcd-material-nav-icon');
        this.text = new RcdTextElement(text).init();
        this.callback = callback;
    }

    init() {
        this.addClass('rcd-material-nav-link').
            addChild(this.icon).
            addChild(this.text);

        if (this.callback) {
            this.onClick(this.callback);
        }
        return this;
    }
}

class RcdMaterialNav extends RcdNavElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-nav');
    }

    addLink(iconName, text, callback) {
        var link = new RcdMaterialNavLink(iconName, text, callback).init();
        return this.addChild(link);
    }
}

class RcdMaterialBreadcrumbs extends RcdDivElement {
    constructor() {
        super();
        this.breadcrumbs = [];
    }

    init() {
        return this.addClass('rcd-material-breadcrumbs');
    }

    addPathElements(pathElements) {
        pathElements.forEach(this.addPathElement, this);
        return this;
    }

    addPathElement(pathElement) {
        this.breadcrumbs.push(pathElement.name);
        if (this.breadcrumbs.length > 1) {
            this.addChild(new RcdTextElement(' / ').init());
        }
        var breadcrumb = new RcdTextDivElement(pathElement.name).init().addClass('rcd-material-breadcrumb');
        return this.addChild(breadcrumb);
    }
}

class RcdMaterialView extends RcdDivElement {
    constructor(viewId, pathElements, description) {
        super();
        this.viewId = viewId;
        this.title = new RcdTextDivElement(pathElements[pathElements.length - 1].name).
            init().
            addClass('rcd-material-content-title');
        this.breadcrumbs = new RcdMaterialBreadcrumbs().
            init().
            addPathElements(pathElements);
        this.header = new RcdDivElement().
            init().
            addClass('rcd-material-content-header').
            addChild(this.title).
            addChild(this.breadcrumbs);

        this.description = new RcdParagraphDivElement(description).init().addClass('rcd-material-content-description');
    }

    init() {
        return this.addClass('rcd-material-view').
            addChild(this.header).
            addChild(this.description);
    }
}

class RcdMaterialContent extends RcdDivElement {
    constructor() {
        super();
        this.views = {};
        this.currentView;
    }

    init() {
        return this.addClass('rcd-material-content');
    }

    addView(view) {
        this.views[view.viewId] = view;
        return this;
    }

    displayView(viewId) {
        if (this.currentView) {
            this.removeChild(this.currentView);
        }
        this.currentView = this.views[viewId];
        this.addChild(this.currentView);
        return this;
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


/*****************************************************
 * Cards
 ****************************************************/
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

    addIcon(iconName) {
        var icon = new RcdGoogleMaterialIcon(iconName).init();
        var div = new RcdDivElement().
            init().
            addClass('rcd-material-card-action-icon').
            addChild(icon);
        this.icons.addChild(div);
        return this;
    }

    addContent(content) {
        this.content.addChild(content);
    }
}

/*****************************************************
 * Table
 ****************************************************/

class RcdMaterialTableCell extends RcdTdElement {
    constructor() {
        super();
    }
}

class RcdMaterialTableCheckbox extends RcdMaterialTableCell {
    constructor() {
        super();
        this.checkbox = new RcdMaterialCheckbox().init();
    }

    init() {
        return this.addChild(this.checkbox).
            onClick(() => this.checkbox.select(!this.checkbox.isSelected()));
    }
}

class RcdMaterialTableRow extends RcdTrElement {
    constructor() {
        super();
        this.checkbox = new RcdMaterialTableCheckbox().init();
    }

    init() {
        this.checkbox.onClick(() => this.select(!this.isSelected()));
        return this.addClass('rcd-material-table-row').
            addChild(this.checkbox);
    }

    addCell(value) {
        var cell = new RcdMaterialTableCell().
            init().
            setText(value);
        return this.addChild(cell);
    }
}

class RcdMaterialTableHeader extends RcdTheadElement {
    constructor() {
        super();
        this.row = new RcdMaterialTableRow().init();
    }

    init() {
        return this.addClass('rcd-material-table-header').
            addChild(this.row);
    }

    addCell(value) {
        var cell = new RcdMaterialTableCell().
            init().
            setText(value);
        return this.row.addChild(cell);
    }
}

class RcdMaterialTableBody extends RcdTbodyElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-table-body');
    }

    createRow() {
        var row = new RcdMaterialTableRow().
            init();
        this.addChild(row);
        return row;
    }
}

class RcdMaterialTable extends RcdTableElement {
    constructor() {
        super();
        this.header = new RcdMaterialTableHeader().init();
        this.body = new RcdMaterialTableBody().init();
    }

    init() {
        return this.addClass('rcd-material-table').
            addChild(this.header).
            addChild(this.body);
    }
}