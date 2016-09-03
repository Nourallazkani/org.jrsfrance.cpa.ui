import {inject} from 'aurelia-framework';
import {UserDetails} from 'common';

@inject(Element, UserDetails)
export class PlaceAutocompleteCustomAttribute {

    element;
    bounds;

    constructor(element, userDetails) {
        this.element = element;
        this.userDetails = userDetails;
        if (this.userDetails.address && this.userDetails.address.formattedAddress) {
            element.value = this.userDetails.address.formattedAddress;
        }
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
            let googleObject = { formatted_address: place.formatted_address, placeId: place.place_id };

            // extract array elements and map them to object properties.
            place.address_components.forEach(x => {
                let googlePropertyName = x.types[0];
                googleObject[googlePropertyName] = x["short_name"];
            });
            googleObject.lat = place.geometry.location.lat();
            googleObject.lng = place.geometry.location.lng();

            // home made object, will be use for API calls.
            var appPlace = {};
            appPlace.formattedAddress = googleObject.formatted_address;

            
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
            appPlace.googleMapId = googleObject.placeId;

            this.userDetails.address = appPlace;
        });
    }
}