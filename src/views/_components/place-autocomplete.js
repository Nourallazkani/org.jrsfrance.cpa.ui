import {inject} from 'aurelia-framework';

@inject(Element)
export class PlaceAutocompleteCustomAttribute {

    element;
    bounds;

    constructor(element) {
        this.element = element;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                let circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
                autocomplete.setBounds(circle.getBounds());
            });
        }
    }

    attached() {
        let autocomplete = new google.maps.places.Autocomplete(this.element, { types: ['geocode'] });
        autocomplete.addListener('place_changed', () => {
            let place = autocomplete.getPlace();
            let googleObject = {};
            // extract array elements and map them to object properties.
            place.address_components.forEach(x => {
                let googlePropertyName = x.types[0];
                googleObject[googlePropertyName] = x["short_name"];
            });
            googleObject.lat = place.geometry.location.lat();
            googleObject.lng = place.geometry.location.lng();

            // home made object, will be use for API calls.
            var appPlace = {};

            if (googleObject.street_number || googleObject.route) {
                appPlace.street1 = googleObject.street_number ? googleObject.street_number + " " + googleObject.route : googleObject.route;
            }
            if (googleObject.postal_code) {
                appPlace.postalCode = googleObject.postal_code;
            }
            appPlace.locality = googleObject.locality;
            appPlace.country = googleObject.country;

            appPlace.lat = googleObject.lat
            appPlace.lng = googleObject.lng;
            
            this.appPlace = appPlace;
            console.log(appPlace);
        });
    }
}