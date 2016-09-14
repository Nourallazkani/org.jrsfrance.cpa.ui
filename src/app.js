
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {UserDetails} from 'common'

@inject(HttpClient, UserDetails, Router)
export class App {

  referenceData;

  constructor(httpClient, userDetails, router) {
    this.moment = moment;
    this.httpClient = httpClient;
    this.userDetails = userDetails;

    this.httpClient.configure(config => {
      config
        .withBaseUrl('http://127.0.0.1:8080/api/')
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
              throw response;
            }
            else {
              return response;
            }
          }
        });
    })

    this.httpClient.fetch("referenceData").then(x => x.json()).then(x => this.referenceData = x)
    
    if (localStorage.getItem("accessKey") != null) {
      // auto sign in
      this.authz.silent = true;
      this.authz.action = "sign-in";
      this.authz.input = { accessKey: localStorage.getItem("accessKey") };
      this.processSignIn();
    }
    else if (false) /*look in the query string*/  {
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

  cancelSignUp(){
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
        console.log(this.authz.successUrl)
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
