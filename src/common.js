export class UserDetails {
    language = "fr";
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

    cookies = {
        get: function (name) {
            if (document.cookie) {
                console.log(document.cookie);
                let value = document.cookie.split(";").find(x => x.indexOf(name + "=") >= 0).split("=")[1];
                return value!=null && value.substring(0,1)=="{" ? JSON.parse(value) : value;
            }
            return null;
        },
        put: function (name, value) {
            let elements = document.cookie ? document.cookie.split(";") : [];
            elements.push(name + "=" + (value!=null && typeof value==='object' ? JSON.stringify(value) : value));
            document.cookie = elements.join(";");
            console.log(document.cookie);
        },
        exists: function (name) {
            return document.cookie && document.cookie.split(";").some(x => x.indexOf(name + "=") >= 0);
        }
    }
}
// this class provides common methods for all controllers, it is meant to be the parent class of all view models
export class ViewModel {

}