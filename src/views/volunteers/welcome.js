export class Welcome {

    firstTime = false;
    
    activate(params) {
        if(params.firstTime){
            this.firstTime = params.firstTime;
        }
    }
}
