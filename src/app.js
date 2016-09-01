
import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {Global, UserDetails} from 'common'

@inject(HttpClient, Global, UserDetails, Router)
export class App {

  constructor(httpClient, global, userDetails, router) {

    this.httpClient = httpClient;
    this.global = global;
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

    this.httpClient.fetch("referenceData").then(x => x.json()).then(x => global.referenceData = x)

    if (localStorage.getItem("accessKey") != null) {
      // auto sign in
      this.authz.silent = true;
      this.authz.action = "sign-in";
      this.authz.input = { accessKey: localStorage.getItem("accessKey") };
      this.processSignIn();
    }
    else if (false) {
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
      { route: ['', 'index'], name: 'index', moduleId: './views/index', nav: true, title: 'Index' },
      { route: 'refugees', name: 'refugees/index', moduleId: './views/refugees/index', nav: true, title: 'Réfugiés' },
      { route: 'organisations', name: 'organisations/index', moduleId: './views/organisations/index', nav: true, title: 'Organisation' }
    ]);
    this.router = router;


    /* immediate redirect if profile is known 
    if (this.userDetails.profile == "R") {
      this.router.navigate('/refugees');
    }
    else if (this.userDetails.profile == "O") {
      this.router.navigate('organisations/index');
    }*/
  }

  authz = { silent: false, input: null, outcome: null };

  // manual sign in
  startSignIn() {
    this.authz.action = "sign-in";
    this.authz.input = { realm: this.userDetails.profile };
    this.authz.outcome = null;
  }

  processSignIn(routeOnSuccess) {
    this.httpClient
      .fetch("authz/signIn", { method: "POST", body: json(this.authz.input) })
      .then(x => x.json()).then(account => {

        this.userDetails.account = account;
        this.userDetails.accessKey = account.accessKey;
        this.authz.action = null;
        if (this.authz.rememberMe) {
          localStorage.setItem("accessKey", account.accessKey);
        }
        if (routeOnSuccess != null) {
          this.router.navigateToRoute(routeOnSuccess);
        }
      })
      .catch(err => {
        this.authz.outcome = "failure";
      });
  }

  startPasswordRecoveryRequest() {
    this.authz.action = "recover-password";
    this.authz.input.password = null;
    this.authz.outcome = null;
  }

  processPasswordRecovery() {
    console.log(this.authz.input);
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
