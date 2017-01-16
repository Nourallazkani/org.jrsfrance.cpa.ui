import {inject, bindable, BindingEngine} from 'aurelia-framework'
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';

import {UserDetails} from 'common'
import {I18n} from 'i18n'

@inject(HttpClient, Router, BindingEngine, EventAggregator, UserDetails, I18n)
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

    constructor(httpClient, router, bindingEngine, eventAggregator, userDetails, i18nMessages) {
        this.httpClient = httpClient;
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.userDetails = userDetails;

        this.i18n = (key) => i18nMessages.getMessage("sign-in", key, userDetails.language);

        bindingEngine
            .propertyObserver(userDetails, 'account')
            .subscribe((newValue, oldValue) => {
                if (newValue == null) {
                    this.initialize();
                }
            });
    }

    attached(){
        this.initialize();
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
                this.eventAggregator.publish('global-events', 'signed-in');
                if (this.successRoute) {
                    this.router.navigate(this.successRoute);
                }

            })
            .catch(e => {
                if (e.status == 401) {
                    this.outcome = { status: "unauthorized" };
                }
                else {
                    e.json().then(x => this.outcome = { status: "failure", errors: x });
                }
            })
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
            .then(() => this.outcome = { status: "accepted" })
    }

    cancelSignIn() {
        this.authz.action = null;
    }
}