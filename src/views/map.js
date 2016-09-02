export class Map {

/*
    appPlace;

    attached() {
        let autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), { types: ['geocode'] });
        autocomplete.addListener('place_changed', () => {
            let place = autocomplete.getPlace();
            let googleObject = {};
            place.address_components.forEach(x => {
                let googlePropertyName = x.types[0];
                googleObject[x.types[0]] = x["short_name"];
            });
            googleObject.lat = place.geometry.location.lat();
            googleObject.lng = place.geometry.location.lng();

            var appPlace = {};

            if (googleObject.street_number || googleObject.route) {
                appPlace.street1 = googleObject.street_number ? googleObject.street_number + " " + googleObject.route : googleObject.route;
            }
            if (googleObject.postal_code) {
                appPlace.postalCode = googleObject.postal_code;
            }
            appPlace.locality = googleObject.locality;


            appPlace.lat = googleObject.lat
            appPlace.lng = googleObject.lng;

            this.appPlace = appPlace;
        });
    }*/
}