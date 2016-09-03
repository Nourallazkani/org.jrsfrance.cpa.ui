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
            if (value) {
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


export function addDistance(element){
    return {
        item:element
    };
}