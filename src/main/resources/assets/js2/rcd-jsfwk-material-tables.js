class RcdMaterialTableCell extends RcdTdElement {
    constructor() {
        super();
    }

    init() {
        return this.addClass('rcd-material-table-cell');
    }
}

class RcdMaterialTableCheckbox extends RcdMaterialTableCell {
    constructor() {
        super();
        this.checkbox = new RcdMaterialCheckbox().init();
    }

    init() {
        return this.addClass('rcd-material-table-checkbox').
            addChild(this.checkbox).
            setClickListener(() => this.select(!this.checkbox.isSelected()));
    }

    select(selected) {
        super.select(selected);
        this.checkbox.select(selected);
    }
}

class RcdMaterialTableRow extends RcdTrElement {
    constructor() {
        super();
        this.checkbox = new RcdMaterialTableCheckbox().init();
    }

    init() {
        this.checkbox.setClickListener(() => this.select(!this.isSelected()));
        return this.addClass('rcd-material-table-row').
            addChild(this.checkbox);
    }

    addCell(value) {
        var cell = new RcdMaterialTableCell().
            init().
            setText(value);
        return this.addChild(cell);
    }

    select(selected) {
        super.select(selected);
        this.checkbox.select(selected);
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

    selectAllRows(selected) {
        this.rows.forEach((row) => row.select(selected));
    }
}

class RcdMaterialTable extends RcdTableElement {
    constructor() {
        super();
        this.header = new RcdMaterialTableHeader().init();
        this.body = new RcdMaterialTableBody().init();

        this.header.row.checkbox.addClickListener(() => this.body.selectAllRows(this.header.row.checkbox.isSelected()));
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