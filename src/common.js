export class ApplicationConfig {
    apiEndpoint= "http://cpa-env-green.eu-west-1.elasticbeanstalk.com/";
    //apiEndpoint = "http://localhost:8080/api/";
}

export class ReferenceData {

    load(source) {
        for(let p in source){
            this[p] = source[p];
        }
    }

    refreshAll(source){
        this.load(source)
    }
    refresh(domain, source){
        this[domain] = source;
    }
}

export class UserDetails {

    accessKey;
    account;

    get language() {
        return localStorage.getItem("language");
    }

    set language(value) {
        localStorage.setItem("language", value);
    }

    get profile() {
        return localStorage.getItem("profile");
    }

    set profile(value) {
        if (value == null) {
            localStorage.removeItem("profile");
        }
        else {
            localStorage.setItem("profile", value);
        }
    }


    get address() {
        let _address = localStorage.getItem("address");
        return _address ? JSON.parse(_address) : null;
    }

    set address(value) {
        if (value) {
            localStorage.setItem("address", JSON.stringify(value));
        }
        else {
            localStorage.removeItem("address");
        }
    }
}
export function getUri(path, params) {
    if (!params) {
        return path
    }
    else {
        var paramsAsArray = []
        for (let p in params) {
            let value = params[p]
            if (value != null) {
                paramsAsArray.push(p + "=" + value)
            }
        }
        if (paramsAsArray.length > 0) {
            return path + "?" + paramsAsArray.join("&")
        }
        else {
            return path;
        }
    }
};

if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}
export function viewLocation(address) {

    let placeName = `${address.street1},+${address.postalCode}+${address.locality}`;
    let url = `https://www.google.com/maps/place/${placeName}/${address.lat},${address.lng}`;
    window.open(url, 'map', "width=1200,height=600");
};

export function viewItinerary(address1, address2) {
    console.log("inside viewItinerary")
    let url = `https://www.google.com/maps/dir/${address1.lat},${address1.lng}/${address2.lat},${address2.lng}`;
    window.open(url, 'map', "width=1200,height=600");
}

export function getDistance(from, to) {
    if (!(from && to && from.lat && from.lat && to.lng && to.lng)) {
        return null;
    }

    var lat1 = from.lat;
    var lng1 = from.lng;
    var lat2 = to.lat;
    var lng2 = to.lng;

    var R = 6371e3; // metres
    var φ1 = lat1.toRad();
    var φ2 = lat2.toRad();
    var Δφ = (lat2 - lat1).toRad();
    var Δλ = (lng2 - lng1).toRad();

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var dM = R * c;
    var dKm = (R * c) / 1000;

    return Math.round(dKm * 100) / 100;
}