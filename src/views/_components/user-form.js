import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject, bindable} from 'aurelia-framework'
import {Router} from 'aurelia-router';
import {HttpClient, json} from 'aurelia-fetch-client';

@inject(HttpClient, Router, UserDetails, ReferenceData, I18n)
export class UserForm {

    @bindable showCredentials;
    @bindable showDetails;
    @bindable showIdentity;
    @bindable successRoute;
    @bindable action; // sign-up or update-profile

    input = {};
    outcome;

    constructor(fetchClient, router, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.router = router;
        this.userDetails = userDetails;
        this.referenceData = referenceData;

        this.i18n = (key) => i18nMessages.getMessage("user-form", key, userDetails.language);

        if (this.userDetails.account && this.userDetails.account.accessKey) {
            let uri = (this.userDetails.profile == "R" ? "/refugees/" : "/volunteers/") + this.userDetails.account.id;
            this.fetchClient.fetch(uri)
                .then(x => x.json())
                .then(x => this.input = x);
        }
    }

    signUp() {
        /*
        this.fetchClient.fetch("/authz/signUp", { body: json(input), method: "post" })
            .then(x => console.log(x))
        console.log("process sign up for")
        */
        this.userDetails.lastAction = "sign-up";
        if (this.successRoute) {
            this.router.navigate(this.successRoute);
        }
        else {
            this.outcome = "success";
        }
    }

    retry() {
        this.outcome = null;
        if (this.action == "sign-up") {
            this.input.mailAddress = null;
        }
    }

    updateProfile() {
        if (this.userDetails.profile == "V") {
            this.outcome = "success";
            if(this.userDetails.lastAction=="sign-up"){
                this.userDetails.lastAction = "update-profile";
            }
            return;
        }
        let uri = (this.userDetails.profile == "R" ? "refugees/" : "volunteers/") + this.userDetails.account.id;
        this.fetchClient.fetch(uri, { body: json(this.input), method: "put" })
            .then(x => {
                this.outcome = "success";
                this.userDetails.lastAction = "update-profile";
            });
    }

    attached() {
        this.showCredentials = (this.showCredentials === true || "true" == this.showCredentials);
        this.showDetails = (this.showDetails === true || "true" == this.showDetails);
        this.showIdentity = (this.showIdentity === true || "true" == this.showIdentity);
    }
}