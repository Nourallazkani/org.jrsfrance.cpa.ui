import {inject, bindable, BindingEngine} from 'aurelia-framework'
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'
import {I18n} from 'i18n'

@inject(HttpClient, Router, BindingEngine, UserDetails, I18n)
export class SignInForm {

    action;
    realm;
    input;
    rememberMe;
    outcome;

    @bindable
    successRoute = null;

    initialize() {
        this.action = "sign-in";
        this.input = { realm: this.userDetails.profile };
        this.rememberMe = false;
        this.outcome = null;
    }

    constructor(httpClient, router, bindingEngine, userDetails, i18nMessages) {
        console.log("inside ctor")
        this.httpClient = httpClient;
        this.router = router;
        this.userDetails = userDetails;
        this.initialize();

        this.i18n = (key) => i18nMessages.getMessage("sign-in", key, userDetails.language);

        bindingEngine
            .propertyObserver(userDetails, 'account')
            .subscribe((newValue, oldValue) => {
                if (newValue == null) {
                    this.initialize();
                }
            });
    }

    processSignIn() {
        this.httpClient
            .fetch("authentication", { method: "POST", body: json(this.input) })
            .then(x => x.json()).then(account => {

                this.userDetails.account = account;
                if (this.userDetails.rememberMe) {
                    localStorage.setItem("accessKey", account.accessKey);
                }
                this.action = null;

                if (this.successRoute) {
                    this.router.navigate(this.successRoute);
                }
            })
            .catch(err => {
                this.outcome = "failure";
            });
    }

    retrySignIn() {
        this.outcome = null;
        this.action = "sign-in";
        this.input.password = null;
    }

    startPasswordRecoveryRequest() {
        this.action = "recover-password";
        this.input.password = null;
        this.outcome = null;
    }

    processPasswordRecoveryRequest() {
        this.httpClient
            .fetch("authz/passwordRecovery", { method: "POST", body: json(this.input) })
            .then(() => this.outcome = "accepted")
    }

    cancelSignIn() {
        this.authz.action = null;
    }
}