import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'
import {I18n} from 'i18n'

@inject(UserDetails, I18n, Router)
export class Home {

    action;

    constructor(userDetails, i18nMessage, router) {
        this.router = router;
        this.userDetails = userDetails;
        
        this.i18n = (key, language) => i18nMessage.getMessage("home", key, language || userDetails.language);
        this.setUserDetails(null);
    }

    setUserDetails(profile, languageKey) {
        this.userDetails.language = languageKey || "fr";
        this.userDetails.profile = profile;
        if (profile == "R") {
            this.router.navigateToRoute('refugees');
        }
        else if ((profile == "O" || profile == "V") && this.userDetails.account) {
            if (this.userDetails.account.accessKey.substring(0, 1) == "O" && profile == "O") {
                this.router.navigateToRoute('organisations');
            }
            else if (this.userDetails.account.accessKey.substring(0, 1) == "V" && profile == "V") {
                this.router.navigateToRoute('volunteers');
            }

        }
    }
}