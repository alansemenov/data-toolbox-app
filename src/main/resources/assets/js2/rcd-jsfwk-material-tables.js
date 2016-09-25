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
        this.rows = [];
    }

    init() {
        return this.addClass('rcd-material-table-body');
    }

    createRow() {
        var row = new RcdMaterialTableRow().
            init();
        this.rows.push(row);
        this.addChild(row);
        return row;
    }

    clear() {
        super.clear();
        this.rows.length = 0;
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

    getSelectedRows() {
        return this.body.rows.filter((row) => row.isSelected());
    }
}