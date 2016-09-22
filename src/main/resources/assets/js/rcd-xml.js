class RcdXmlElement {
    constructor(name) {
        this.name = name;
        this.attributes = {};
        this.text;
        this.children = [];
    }

    setAttribute(key, value) {
        this.attributes[key] = value;
    }

    setText(text) {
        this.text = text;
    }

    addChild(child) {
        this.children.push(child);
    }

    removeChild(child) {
        var index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    toXml() {
        return '<' + this.name + this.getXmlAttributes() + this.getXmlOpeningTagEnd() + this.getXmlContent() + this.getXmlEndingTag();
    }

    getXmlAttributes() {
        var result = '';
        for (var attributeName in this.attributes) {
            result += ' ' + attributeName + '="' + this.attributes[attributeName] + '"'
        }
        return result;
    }

    getXmlOpeningTagEnd() {
        if (!this.text && this.children.length == 0) {
            return '/>';
        }
        return '>'
    }

    getXmlContent() {
        if (this.text) {
            return this.text;
        }
        return this.children.map(child =>  child.toXml()).
            join('');
    }

    getXmlEndingTag() {
        if (!this.text && this.children.length == 0) {
            return '';
        }
        return '</' + this.name + '>';
    }
}

class RcdHtmlElement extends RcdXmlElement {
    constructor(name) {
        super(name);
        this.classes = [];
    }

    setId(id) {
        this.setAttribute('id', id);
    }

    addClass(aClass) {
        this.classes.push(aClass);
        this.setAttribute("class", this.classes.join(' '));
    }

    removeClass(aClass) {
        var index = this.classes.indexOf(child);
        if (index > -1) {
            this.classes.splice(index, 1);
            this.setAttribute("class", this.classes.join(' '));
        }
    }
}

var myDiv = new RcdHtmlElement('div');
myDiv.setId('myID');

myDiv.addClass("hello");
myDiv.addClass("hello2-123");
myDiv.toXml();