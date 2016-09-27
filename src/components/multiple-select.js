import {bindable, customElement, inject} from 'aurelia-framework'

@inject(Element)
export class MultipleSelectCustomElement {

    @bindable
    placeholder;

    @bindable
    source;

    @bindable
    selection;

    constructor(element) {
        this.element = element;
    }

    clear() {
        this.source.forEach(x => x.selected = false);
        this.selection.splice(0, this.selection.length);
        this.input.value = this.selection.join(", ");
    }

    click(e) {
        e.selected = !e.selected;

        if (e.selected) {
            this.selection.push(e.item.name);
        }
        else {
            this.selection.splice(this.selection.indexOf(e.item.name), 1);
        }
        this.input.value = this.selection.join(", ");
    }


    bodyClickEventListener;
    inputClickEventListener;

    attached() {
        this.input = this.element.children[0];
        this.ul = this.element.children[1];

        if (this.selection == null) {
            this.selection = [];
        }
        this.source = this.source.map(x => ({ item: x, selected: this.selection.indexOf(x.name) >= 0 }))
        this.input.value = this.selection.join(", ");


        this.ul.style.width = this.input.getBoundingClientRect().width + "px";
        this.ul.style.display = "none";

        this.input.addEventListener("focus", this.input.blur);

        
        this.inputClickEventListener = (e) => {
            this.input.blur();
            this.ul.style.display = this.ul.style.display == "block" ? "none" : "block";
        };
        
        this.input.addEventListener("click", this.inputClickEventListener);

        this.bodyClickEventListener = (e) => {
            if (e.target.parentNode != this.ul && e.target != this.input) {
                this.ul.style.display = "none";
            }
        };
        document.body.addEventListener('click', this.bodyClickEventListener);
    }

    detached() {
        document.body.removeEventListener('click', this.clickEventListener);
        this.input.removeEventListener("click", this.inputClickEventListener);
    }
}