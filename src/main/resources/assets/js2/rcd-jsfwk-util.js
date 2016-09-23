class RcdTextDivisionElement extends RcdDivElement {
    constructor(text) {
        super();
        this.span = new RcdSpanElement().init().setText(text);
    }

    init() {
        return this.addChild(this.span);
    }
}