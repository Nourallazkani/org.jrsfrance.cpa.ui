import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'

@inject(UserDetails, Router)
export class Index {

    constructor(userDetails, router) {
        this.router = router;
        this.userDetails = userDetails;
        this.setProfile(null);
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