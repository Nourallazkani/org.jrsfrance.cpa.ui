import {inject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'

@inject(Element)
export class PlaceAutocompleteCustomAttribute {

    @bindable target;
    @bindable userSelectionBinding;
    @bindable targetProperty;
    @bindable restriction;
    element;
    autocomplete;

    constructor(element) {
        this.element = element;
        // types : cities
        let options = {
            types: ['geocode'],
            componentRestrictions: { country: "fr" },
        };
        this.autocomplete = new google.maps.places.Autocomplete(this.element, options);



        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                let circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
                this.autocomplete.setBounds(circle.getBounds());
            });
        }
    }

    attached() {
        this.targetProperty = [this.targetProperty || "address"];
        if (this.target[this.targetProperty] && this.target[this.targetProperty].formattedAddress) {
            this.element.value = this.target[this.targetProperty].formattedAddress;
        }

        this.autocomplete.addListener('place_changed', () => {
            let place = this.autocomplete.getPlace();
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
            appPlace.locality = googleObject.locality.indexOf("Paris-") == 0 ? "Paris" : googleObject.locality;
            appPlace.country = googleObject.country == "FR" ? "France" : googleObject.country;

            appPlace.lat = googleObject.lat
            appPlace.lng = googleObject.lng;
            appPlace.googleMapId = googleObject.placeId;

            this.target[this.targetProperty] = appPlace;
            if (this.userSelectionBinding) {
                this.element.value = appPlace[this.userSelectionBinding];
            }
        });
    }
}