import {inject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'

@inject(Element)
export class AlwaysVisibleCustomAttribute {

    initialPosition;

    constructor(element) {
        this.element = element;
        
        this.scrollHandler = () => {
            if (window.pageYOffset > this.initialPosition) {
                this.element.style.position = 'fixed';
                this.element.style.top = 0;
                
                this.element.style.width = '100%';
                this.element.style.boxSizing='border-box';
                
            } else {
                this.element.style.position = 'relative';
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