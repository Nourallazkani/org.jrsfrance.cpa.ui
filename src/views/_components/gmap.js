import {inject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'

@inject(Element)
export class GmapCustomElement {

    googleMap;
    markers = [];
    @bindable center;
    @bindable places;
    x = false;

    constructor(element) {
        this.element = element;
    }

    placesChanged() {
        this.showPlaces();
    }

    showPlaces() {
        for (let p of this.places) {
            let myLatLng = { lat: p.item.address.lat, lng: p.item.address.lng };
            let marker = new google.maps.Marker({ position: myLatLng, map: this.googleMap, title: p.item.organisation });
            this.markers.push(marker);
        }
        if (this.googleMap)/* this.googleMap is null if the element is not attached yet*/ {
            let newBoundary = new google.maps.LatLngBounds();
            for (let marker of this.markers) {
                newBoundary.extend(marker.position);
            }
            this.googleMap.fitBounds(newBoundary);
        }
    }

    attached() {
        var mapDiv = this.element.getElementsByTagName("div")[0];
        var center = this.center ? { lat: this.center.lat, lng: this.center.lng } : { lat: 48.866667, lng: 2.333333 };
        this.googleMap = new google.maps.Map(mapDiv, { center: center, zoom: 8 });
        this.showPlaces();
    }
}