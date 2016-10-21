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
        this.domElement.removeChild(child.getDomElement());
        return this;
    }

    clear() {
        this.domElement.innerHTML = '';
    }
}

class RcdHtmlElement extends RcdDomElement {
    constructor(name) {
        super(name);
        this.classes = [];
        this.clickListeners = []; //TODO Make it event generic
    }

    init() {
        return this;
    }

    setId(id) {
        this.setAttribute('id', id);
        return this;
    }

    addClass(aClass) {
        if (this.classes.indexOf(aClass) == -1) {
            this.classes.push(aClass);
            this.setAttribute("class", this.classes.join(' '));
        }
        return this;
    }

    removeClass(aClass) {
        var index = this.classes.indexOf(aClass);
        if (index != -1) {
            this.classes.splice(index, 1);
            this.setAttribute("class", this.classes.join(' '));
        }
        return this;
    }

    addEventListener(type, listener) {
        this.domElement.addEventListener(type, listener);
        return this;
    }

    removeEventListener(type, listener) {
        this.domElement.removeEventListener(type, listener);
        return this;
    }

    setClickListener(listener) {
        this.clickListeners.forEach((clickListener) => this.removeClickListener(clickListener));
        return this.addClickListener(listener);
    }

    addClickListener(listener) {
        this.clickListeners.push(listener);
        return this.addEventListener('click', listener);
    }

    removeClickListener(listener) {
        var index = this.clickListeners.indexOf(listener);
        if (index > -1) {
            this.clickListeners.splice(index, 1);
        }
        return this.removeEventListener('click', listener);
    }

    isSelected() {
        return this.classes.indexOf('selected') != -1;
    }

    select(selected) {
        if (selected) {
            this.addClass('selected');
        } else {
            this.removeClass('selected');
        }
    }
}

class RcdDivElement extends RcdHtmlElement {
    constructor() {
        super('div');
    }
}

class RcdPElement extends RcdHtmlElement {
    constructor() {
        super('p');
    }
}

class RcdHeaderElement extends RcdHtmlElement {
    constructor() {
        super('header');
    }
}

class RcdIElement extends RcdHtmlElement {
    constructor() {
        super('i');
    }
}

class RcdSpanElement extends RcdHtmlElement {
    constructor() {
        super('span');
    }
}

class RcdMainElement extends RcdHtmlElement {
    constructor() {
        super('main');
    }
}

class RcdNavElement extends RcdHtmlElement {
    constructor() {
        super('nav');
    }
}

class RcdTableElement extends RcdHtmlElement {
    constructor() {
        super('table');
    }
}

class RcdTheadElement extends RcdHtmlElement {
    constructor() {
        super('thead');
    }
}

class RcdTbodyElement extends RcdHtmlElement {
    constructor() {
        super('tbody');
    }
}

class RcdTrElement extends RcdHtmlElement {
    constructor() {
        super('tr');
    }
}

class RcdThElement extends RcdHtmlElement {
    constructor() {
        super('th');
    }
}

class RcdTdElement extends RcdHtmlElement {
    constructor() {
        super('td');
    }
}

class RcdFormElement extends RcdHtmlElement {
    constructor() {
        super('form');
    }

    submit() {
        this.getDomElement().submit();
    }
}

class RcdInputElement extends RcdHtmlElement {
    constructor() {
        super('input');
    }
}



