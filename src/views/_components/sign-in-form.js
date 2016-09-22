import {inject, bindable, BindingEngine} from 'aurelia-framework'
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'
import {HttpClient, json} from 'aurelia-fetch-client';

@inject(HttpClient, Router, BindingEngine, UserDetails)
export class SignInForm {

    action;
    realm;
    input;
    rememberMe;
    outcome;

    @bindable
    successRoute = null;

    initialized() {
        this.action = "sign-in";
        this.input = { realm: this.userDetails.profile };
        this.rememberMe = false;
        this.outcome = null;
    }
    constructor(httpClient, router, bindingEngine, userDetails) {
        console.log("inside ctor")
        this.httpClient = httpClient;
        this.router = router;
        this.userDetails = userDetails;
        this.initialized();


        bindingEngine
            .propertyObserver(userDetails, 'accessKey')
            .subscribe((newValue, oldValue) => {
                if (newValue == null) {
                   this.initialized();
                }
            });
    }

    processSignIn() {
        this.httpClient
            .fetch("authz/signIn", { method: "POST", body: json(this.input) })
            .then(x => x.json()).then(account => {

                this.userDetails.account = account;
                this.userDetails.accessKey = account.accessKey;
                this.action = null;
                if (this.rememberMe) {
                    localStorage.setItem("accessKey", account.accessKey);
                }

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