import {ViewModel} from 'common';

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'

@inject(UserDetails, Router)
export class Index extends ViewModel {

    constructor(userDetails, router) {
        super();
        this.router = router;
        this.userDetails = userDetails;
        if (this.userDetails.profile === "R") {
            //this.router.navigateToRoute('refugees/index');
        }
        else if (this.userDetails.profile === "V") {

        }
        else if (this.userDetails.profile === "O") {

        }
        //console.log(this.router);
    }

    activate(params, navigationInstruction) {
        if (navigationInstruction.route == "" && this.userDetails.profile === "R") {
            this.router.navigateToRoute('refugees/index');
        }
    }
    setPreferedLanguage(languageKey) {
        this.userDetails.language = languageKey;
    }
    setProfile(profile) {
        this.userDetails.profile = profile;

        if (profile === "R") {
            this.router.navigateToRoute('refugees/index');
        }
    }
}