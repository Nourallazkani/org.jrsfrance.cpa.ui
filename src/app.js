import {UserDetails, ApplicationConfig} from 'common'

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';

import moment from 'moment';


@inject(HttpClient, Router, EventAggregator, UserDetails, ApplicationConfig)
export class App {

  referenceData;
  error;

  constructor(httpClient, router, ea, userDetails, appConfig) {
    this.moment = moment;
    this.httpClient = httpClient;
    this.userDetails = userDetails;
    this.ea = ea;

    this.httpClient.configure(config => {
      config
        .withBaseUrl(appConfig.apiEndpoint)
        .withDefaults({
          headers: {

          }
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            return request;
          },
          response(response) {
            console.log(`Received ${response.status} ${response.url}`);
            if (response.status >= 400 && response.status <= 599) {
              if(response.status!=401 && response.status!=403){
                ea.publish("error", response);
              }
              
              throw response;
            }
            else {
              return response;
            }
          }
        });
    })

    this.ea.subscribe("error", () => {
      this.error = "xxxx";
    })
    this.httpClient.fetch("referenceData")
      .then(x => x.json())
      .then(x => this.referenceData = x)

    this.ea.subscribe("referenceDataUpdate", (x) => {
      if (x && x.domain) {
        this.httpClient.fetch(`referenceData/${x.domain}?noCache=true`)
          .then(resp => resp.json())
          .then(results => this.referenceData[x.domain] = results)
      }
      else {
        this.httpClient.fetch(`referenceData?noCache=true`)
          .then(resp => resp.json())
          .then(results => this.referenceData = results)
      }
    });

    if (localStorage.getItem("accessKey") != null) {
      // auto sign in
      this.authz.silent = true;
      this.authz.action = "sign-in";
      this.authz.input = { accessKey: localStorage.getItem("accessKey") };
      this.processSignIn();
    }
    else if (false) /*look in the query string*/ {
      this.authz.silent = true;
      this.authz.action = "sign-in";
      this.authz.input = { accessKey: "" };
      this.processSignIn();
    }
  }

  configureRouter(config, router) {
    config.title = 'CPA';
    config.options.pushState = true;
    config.options.hashChange = false;

    config.map([
      { route: ['', 'home'], name: 'home', moduleId: './views/home', nav: true, title: 'Home' },
      { route: ['about'], name: 'about', moduleId: './views/about', nav: true, title: 'About' },
      { route: 'refugees', name: 'refugees', moduleId: './views/refugees/index', nav: true, title: 'Réfugiés' },
      { route: 'volunteers', name: 'volunteers', moduleId: './views/volunteers/index', nav: true, title: 'Bénévoles' },
      { route: 'organisations', name: 'organisations', moduleId: './views/organisations/index', nav: true, title: 'Organisation' }
    ]);
    this.router = router;
  }

  authz = { silent: false, input: null, outcome: null };

  startSignUp() {
    this.authz.action = "sign-up";
    this.authz.input = {};
  }

  cancelSignUp() {
    this.authz.action = null;
    this.authz.input = {};
  }
  processSignUp() {
    this.authz.outcome = "ok";
  }

  retrySignUp() {
    this.authz.outcome = null;
    this.authz.input.mailAddress = null;
  }

  startSignIn(successUrl) {
    this.authz.action = "sign-in";
    this.authz.input = { realm: this.userDetails.profile };
    this.authz.outcome = null;
    this.authz.successUrl = successUrl;
  }

  processSignIn() {
    this.httpClient
      .fetch("authz/signIn", { method: "POST", body: json(this.authz.input) })
      .then(x => x.json()).then(account => {

        this.userDetails.account = account;
        this.userDetails.accessKey = account.accessKey;
        this.authz.action = null;
        if (this.authz.rememberMe) {
          localStorage.setItem("accessKey", account.accessKey);
        }
        if (this.authz.successUrl != null) {

          this.router.navigateToRoute(this.authz.successUrl);
        }
      })
      .catch(err => {
        this.authz.outcome = "failure";
      });
  }

  retrySignIn() {
    this.authz.outcome = null;
    this.authz.action = "sign-in";
    this.authz.input.password = null;
  }

  startPasswordRecoveryRequest() {
    this.authz.action = "recover-password";
    this.authz.input.password = null;
    this.authz.outcome = null;
  }

  processPasswordRecoveryRequest() {
    this.httpClient
      .fetch("authz/passwordRecovery", { method: "POST", body: json(this.authz.input) })
      .then(() => this.authz.outcome = "accepted")
  }

  cancelSignIn() {
    this.authz.action = null;
  }

  signOut() {
    this.userDetails.account = null;
    this.userDetails.accessKey = null;
    localStorage.removeItem("accessKey");
    if (this.userDetails.profile != "R") {
      this.router.navigateToRoute("home");
    }
  }

  messages = {
    "common": {
      "Rechercher": { "en": "Search" }
    },
    "cursus": {
      "Niveau": { "en": "Level" }
    }
  }

  i18n(key, domain) {
    var translations = this.messages[domain == null ? "common" : domain][key];
    if (this.userDetails.language == "fr") {
      return key;
    }
    else {
      return translations[this.userDetails.language];
    }
  }
}
