import {ViewModel} from 'common';

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'

@inject(UserDetails, Router)
export class Index extends ViewModel {
    

    constructor(userDetails, router) {
        super();
        this.userDetails = userDetails;
        this.router = router;
    }

    goForward(languageKey) {
        this.userDetails.language = languageKey;
        this.router.navigateToRoute('home');
    }
}