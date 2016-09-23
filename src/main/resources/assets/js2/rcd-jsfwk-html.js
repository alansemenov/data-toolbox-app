class RcdXmlElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.attributes = {};
        this.text;
        this.children = [];
    }

    setAttribute(key, value) {
        this.attributes[key] = value;
        return this;
    }

    setText(text) {
        this.text = text;
        return this;
    }

    addChild(child) {
        this.children.push(child);
        return this;
    }

    removeChild(child) {
        var index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        return this;
    }
}

class RcdDomElement extends RcdXmlElement {
    constructor(name) {
        super(name);
        this.domElement = document.createElement(name);
    }

    getDomElement() {
        return this.domElement;
    }

    setAttribute(key, value) {
        super.setAttribute(key, value);
        this.domElement.setAttribute(key, value);
        return this;
    }

    setText(text) {
        super.setText(text);
        this.domElement.innerHTML = text;
        return this;
    }

    addChild(child) {
        super.addChild(child);
        this.domElement.appendChild(child.getDomElement());
        return this;
    }

    removeChild(child) {
        super.removeChild(child);
        this.domElement.removeChild(child);
        return this;
    }
}

class RcdHtmlElement extends RcdDomElement {
    constructor(name) {
        super(name);
        this.classes = [];
    }

    setId(id) {
        this.setAttribute('id', id);
        return this;
    }

    addClass(aClass) {
        this.classes.push(aClass);
        this.setAttribute("class", this.classes.join(' '));
        return this;
    }

    removeClass(aClass) {
        var index = this.classes.indexOf(child);
        if (index > -1) {
            this.classes.splice(index, 1);
            this.setAttribute("class", this.classes.join(' '));
        }
        return this;
    }

    init() {
        return this;
    }
}

class RcdDivisionElement extends RcdHtmlElement {
    constructor() {
        super('div');
    }
}

class RcdParagraphElement extends RcdHtmlElement {
    constructor() {
        super('p');
    }
}

class RcdHeaderElement extends RcdHtmlElement {
    constructor() {
        super('header');
    }
}

class RcdItalicElement extends RcdHtmlElement {
    constructor() {
        super('i');
    }
}

class RcdSpanElement extends RcdHtmlElement {
    constructor() {
        super('span');
    }
}



