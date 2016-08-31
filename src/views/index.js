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
    }

    setPreferedLanguage(languageKey) {
        this.userDetails.language = languageKey;
    }
    setProfile(profile) {
        this.userDetails.profile = profile;
        localStorage.setItem("profile", profile);

        if (profile === "R") {
            this.router.navigateToRoute('refugees/index');
        }
        else if (profile === "V") {
            this.router.navigateToRoute('organisations/index');
        }
        else if (profile === "O") {
            this.router.navigateToRoute('volunteers/index');
        }
    }
}