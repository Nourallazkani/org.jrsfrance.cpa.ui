export class UserDetails {
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
        localStorage.setItem("profile", value);
    }

    accessKey;
    account;
}

export class Global {
    getUri(path, params) {
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
    }
}
// this class provides common methods for all controllers, it is meant to be the parent class of all view models
export class ViewModel {

}