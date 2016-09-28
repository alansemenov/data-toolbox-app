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

class RcdMaterialCheckbox extends RcdGoogleMaterialIcon {
    constructor() {
        super('check_box_outline_blank');
    }

    init() {
        super.init();
        return this.addClass('rcd-material-checkbox');
    }

    select(selected) {
        super.select(selected);
        if (selected) {
            this.setText('check_box');
        } else {
            this.setText('check_box_outline_blank');
        }
    }
}