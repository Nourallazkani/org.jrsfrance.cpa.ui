import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject, bindable, CompositionTransaction} from 'aurelia-framework'
import {Router} from 'aurelia-router';
import {HttpClient, json} from 'aurelia-fetch-client';

@inject(HttpClient, Router, CompositionTransaction, UserDetails, ReferenceData, I18n)
export class UserForm {

    @bindable showCredentials;
    @bindable showDetails;
    @bindable showIdentity;
    @bindable successRoute;
    @bindable action; // sign-up or update-profile

    input = {};
    outcome;

    constructor(fetchClient, router, compositionTransaction, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.router = router;
        this.userDetails = userDetails;
        this.referenceData = referenceData;
        this.compositionTransactionNotifier = compositionTransaction.enlist();
        this.i18n = (key) => i18nMessages.getMessage("user-form", key, userDetails.language);

    }

    created() {
        if (this.userDetails.account && this.userDetails.account.accessKey) {
            let uri = (this.userDetails.profile == "R" ? "refugees/" : "volunteers/") + this.userDetails.account.id;
            this.fetchClient.fetch(uri)
                .then(x => x.json())
                .then(x => {
                    this.input = x;
                    this.compositionTransactionNotifier.done();
                });
        }
        else{
            this.compositionTransactionNotifier.done();
        }
    }


    attached() {
        this.showCredentials = (this.showCredentials === true || "true" == this.showCredentials);
        this.showDetails = (this.showDetails === true || "true" == this.showDetails);
        this.showIdentity = (this.showIdentity === true || "true" == this.showIdentity);
    }

    signUp() {
        this.input.profile = this.userDetails.profile;
        
        this.fetchClient.fetch("authz/signUp", { body: json(this.input), method: "post" })
            .then(x => x.json())
            .then(account => {
                this.userDetails.account = account;
                localStorage.setItem("accessKey", account.accessKey);
                this.userDetails.lastAction = "sign-up";
                if (this.successRoute) {
                    this.router.navigate(this.successRoute);
                }
                else {
                    this.outcome = "success";
                }
            })
    }

    retry() {
        this.outcome = null;
        if (this.action == "sign-up") {
            this.input.mailAddress = null;
        }
    }

    updateProfile() {
        let uri = `${this.userDetails.profile == "R" ? "refugees" : "volunteers"}/${this.userDetails.account.id}`
        this.fetchClient.fetch(uri, { body: json(this.input), method: "put" })
            .then(x => {
                this.outcome = "success";
                if (this.userDetails.lastAction == "sign-up") {
                    this.userDetails.lastAction = "update-profile";
                }
            });
    }
}