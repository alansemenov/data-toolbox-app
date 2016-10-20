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
            addChild(this.checkbox);
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
        this.selectListeners = [];
    }

    init() {
        this.setClickListener(() => {
            this.select(!this.isSelected());
        });
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
        this.fireSelectEvent();
    }

    fireSelectEvent() {
        this.selectListeners.forEach((listener) => listener());
    }

    addSelectListener(listener) {
        this.selectListeners.push(listener);
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
        this.selectionListeners = [];
    }

    init() {
        return this.addClass('rcd-material-table-body');
    }

    createRow() {
        var row = new RcdMaterialTableRow().
            init();

        row.addSelectListener(() => this.fireSelectionEvent());
        this.rows.push(row);
        this.addChild(row);
        return row;
    }

    clear() {
        super.clear();
        this.rows.length = 0;
        this.fireSelectionEvent();
        return this;
    }

    selectAllRows(selected) {
        this.rows.forEach((row) => row.select(selected));
        return this;
    }

    getSelectedRows() {
        return this.rows.filter((row) => row.isSelected());
    }

    fireSelectionEvent() {
        var nbSelectedRows = this.getSelectedRows().length;
        this.selectionListeners.forEach((selectionListener) => {
            selectionListener(nbSelectedRows);
        }, this);
    }

    addSelectionListener(selectionListener) {
        this.selectionListeners.push(selectionListener);
        return this;
    }
}

class RcdMaterialTable extends RcdTableElement {
    constructor() {
        super();
        this.header = new RcdMaterialTableHeader().init();
        this.body = new RcdMaterialTableBody().init();

        this.header.row.addClickListener(() => this.body.selectAllRows(this.header.row.checkbox.isSelected()));
    }

    init() {
        return this.addClass('rcd-material-table').
            addChild(this.header).
            addChild(this.body);
    }

    getSelectedRows() {
        return this.body.getSelectedRows();
    }

    addSelectionListener(listener) {
        this.body.addSelectionListener(listener);
        return this;
    }
}