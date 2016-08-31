import {ViewModel} from 'common';

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'

@inject(UserDetails, Router)
export class Home extends ViewModel{
    
    constructor(userDetails, router) {
        super();
        this.userDetails = userDetails;
        this.router = router;
    }

    goForward(profile) {
        this.userDetails.profile = profile;
        console.log(profile);
        if(profile==="R"){
            this.router.navigateToRoute('refugees/index');
        }
        else if(profile==="V"){
            this.router.navigateToRoute('organisations/index');
        }
        else if(profile==="O"){
            this.router.navigateToRoute('volunteers/index');
        }
    }
}