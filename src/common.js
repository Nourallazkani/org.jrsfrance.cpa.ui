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
                    paramsAsArray.push(p+"="+value)
                }
            }
            if(paramsAsArray.length>0){
                return path+"?"+paramsAsArray.join("&")
            }
            else{
                return path;
            }
        }
    }

    
}
// this class provides common properties and methods for all controllers, it is meant to be the parent class of all controllers.
export class ViewModel{
    
}