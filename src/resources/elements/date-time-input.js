import {bindable, inject, BindingEngine} from 'aurelia-framework'
import moment from 'moment';

@inject(BindingEngine)
export class DateTimeInputCustomElement {

    @bindable target;
    @bindable targetProperty;
    date;
    time;

    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    attached() {

        if (this.target && this.targetProperty) {
            let value = this.target[this.targetProperty];
            this.time = moment(value).format("HH:mm");
            this.date = moment(value).format("YYYY-MM-DD");
        }
        this.bindingEngine
            .propertyObserver(this, 'date')
            .subscribe((newDate) => {
                this.date = newDate;
                if (this.date && this.time) {
                    this.target[this.targetProperty] = moment(`${this.date} ${this.time}`, "YYYY/MM/DD HH:mm").toDate();
                }
            });
        this.bindingEngine
            .propertyObserver(this, 'time')
            .subscribe((newTime) => {
                this.time = newTime;
                if (this.date && this.time) {
                    this.target[this.targetProperty] = moment(`${this.date} ${this.time}`, "YYYY/MM/DD HH:mm").toDate();
                }
            });
    }
}