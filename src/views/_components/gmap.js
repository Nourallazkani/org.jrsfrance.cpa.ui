import {inject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'

@inject(Element)
export class GmapCustomElement {

    @bindable center;
    @bindable places;

    constructor(element) {
        this.element = element;

    }

    placesChanged() {
        this.showPlaces();
    }

    showPlaces() {
    }

    attached() {
        var mapDiv = this.element.getElementsByTagName("div")[0];
        var center = this.center ? { lat: this.center.lat, lng: this.center.lng } : { lat: 48.866667, lng: 2.333333 };
        var map = new google.maps.Map(mapDiv, {
            center: center,
            zoom: 8
        });
        this.showPlaces();
    }
}