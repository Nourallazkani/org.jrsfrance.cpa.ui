import { UserDetails, ReferenceData } from 'common'
import { I18n } from 'i18n'

import { inject, bindable } from 'aurelia-framework'
import { Router } from 'aurelia-router';
import { HttpClient, json } from 'aurelia-fetch-client';

@inject(HttpClient, Router, UserDetails, ReferenceData, I18n)
export class UserForm {

    @bindable showCredentials;
    @bindable showDetails;
    @bindable showIdentity;
    @bindable successRoute;
    @bindable action; // sign-up or update-profile
    @bindable input;

    input = { languages: [] };
    outcome;

    constructor(fetchClient, router, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.router = router;
        this.userDetails = userDetails;
        this.referenceData = referenceData;
        this.i18n = (key) => i18nMessages.getMessage("user-form", key, userDetails.language);
    }

    signUp() {
        this.state = "saving";
        let uri = this.userDetails.profile == "R" ? "refugees" : "volunteers";
        this.fetchClient.fetch(uri, { body: json(this.input), method: "post" })
            .then(x => x.json())
            .then(account => {
                this.state = null;
                this.userDetails.account = account;
                localStorage.setItem("accessKey", account.accessKey);
                this.userDetails.lastAction = "sign-up";
                if (this.successRoute) {
                    this.router.navigate(this.successRoute);
                }
                else {
                    this.outcome = { status: "ok" };
                }
            })
            .catch(e => {
                this.state = null;
                if (e.status == 409) {
                    this.outcome = { status: "conflict" };
                }
                else {
                    e.json().then(x => this.outcome = { status: "failure", errors: x });
                }
            })
    }


    updateProfile() {
        this.state = "saving";
        let uri = `${this.userDetails.account.profile == "R" ? "refugees" : "volunteers"}/${this.userDetails.account.id}`
        this.fetchClient.fetch(uri, { body: json(this.input), method: "put" })
            .then(x => {
                this.state = null;
                this.outcome = { status: "ok" };
                if (this.userDetails.lastAction == "sign-up") {
                    this.userDetails.lastAction = "update-profile";
                }
            })
            .catch(e => {
                this.state = null;
                if (e.status == 409) {
                    this.outcome = { status: "conflict" };
                }
                else {
                    return e.json().then(x => this.outcome = { status: "failure", errors: x });
                }
            })
    }
}