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

    input = { languages: [] };
    outcome;

    constructor(fetchClient, router, compositionTransaction, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.router = router;
        this.userDetails = userDetails;
        this.referenceData = referenceData;
        this.i18n = (key) => i18nMessages.getMessage("user-form", key, userDetails.language);
        // here we use compositionTransaction because if user has account then input should be bound before the component is rendered.
        // otherwise <multilple-select></multiple-select> start working with a null input, which causes issues with selection.bind.
        // So created must explictely call this.compositionTransactionNotifier.done() to trigger the attachement of the custom element.
        this.compositionTransactionNotifier = compositionTransaction.enlist();
    }

    created() {
        if (this.userDetails.account && this.userDetails.account.accessKey) {
            let uri = (this.userDetails.account.profile == "R" ? "refugees/" : "volunteers/") + this.userDetails.account.id;
            this.fetchClient.fetch(uri)
                .then(x => x.json())
                .then(x => {
                    this.input = x;
                    this.compositionTransactionNotifier.done();
                });
        }
        else {
            this.compositionTransactionNotifier.done();
        }
    }


    attached() {
        if (!this.userDetails.account) {
            // to avoid prefilled form if :
            // user signed up, then sign out, then try to sign up again
            // user start to fill the form then close it then start to sign up again
            this.input = { languages: [] };
        }
        this.outcome = null;
        this.showCredentials = (this.showCredentials === true || "true" == this.showCredentials);
        this.showDetails = (this.showDetails === true || "true" == this.showDetails);
        this.showIdentity = (this.showIdentity === true || "true" == this.showIdentity);
    }

    signUp() {
        let uri = this.userDetails.profile == "R" ? "refugees" : "volunteers";
        this.fetchClient.fetch(uri, { body: json(this.input), method: "post" })
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
            }).catch(e => {
                this.outcome = 'failure';
                if (e.status == 409) {
                    // duplicate email
                }
            });
    }



    retry() {
        this.outcome = null;
        if (this.action == "sign-up") {
            this.input.mailAddress = null;
        }
    }

    updateProfile() {
        let uri = `${this.userDetails.account.profile == "R" ? "refugees" : "volunteers"}/${this.userDetails.account.id}`
        this.fetchClient.fetch(uri, { body: json(this.input), method: "put" })
            .then(x => {
                this.outcome = "success";
                if (this.userDetails.lastAction == "sign-up") {
                    this.userDetails.lastAction = "update-profile";
                }
            });
    }
}