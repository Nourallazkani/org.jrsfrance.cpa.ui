import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'

@inject(UserDetails, Router)
export class Index {

    constructor(userDetails, router) {
        this.router = router;
        this.userDetails = userDetails;
        this.setUserDetails(null);
    }

    setUserDetails(profile, languageKey) {
        this.userDetails.language = languageKey || "fr";
        this.userDetails.profile = profile;
        if (profile == "R") {
            this.router.navigateToRoute('refugees/index');
        }
    }
}