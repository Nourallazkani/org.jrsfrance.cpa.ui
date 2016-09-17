import {inject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'

@inject(Element)
export class FixedIfOnTopCustomAttribute {

    initialPosition;

    constructor(element) {
        this.element = element;
        this.scrollHandler = () => {
            if (window.pageYOffset > this.initialPosition) {
                this.element.style.position = 'fixed';
                this.element.style.top = 0;
                this.element.style.width = '100%';
            } else {
                this.element.style.position = 'relative';
                this.element.style.width = 'auto';
            }
        };
    }

    attached() {
        this.initialPosition = this.element.getBoundingClientRect().top;
        window.onscroll = this.scrollHandler;
        window.addEventListener('scroll', this.scrollHandler, false);
    }

    detached() {
        window.removeEventListener('scroll', this.scrollHandler, false);
    }
}