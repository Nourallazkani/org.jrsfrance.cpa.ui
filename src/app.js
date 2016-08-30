
import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {Global, UserDetails} from 'common'

@inject(HttpClient, Global, UserDetails)
export class App {

  configureRouter(config, router) {
    config.title = 'Aurelia';
    //config.options.pushState = true;
    //config.options.hashChange = false;
    config.map([
      { route: ['', 'index'], name: 'index', moduleId: './views/index', nav: true, title: 'Index' },
      { route: ['home'], name: 'home', moduleId: './views/home', nav: true, title: 'Accueil' },
      { route: ['refugees'], name: 'refugees/index', moduleId: './views/refugees/index', nav: true, title: 'Réfugiés' }
    ]);
    this.router = router;
  }

  constructor(httpClient, global, userDetails) {

    httpClient.configure(config => {
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

    httpClient.fetch("referenceData").then(x => x.json()).then(x => global.referenceData = x)
    this.httpClient = httpClient;
    this.global = global;
    this.userDetails = userDetails;

    let accessKey = global.cookies.get("accessKey")
    if (accessKey) {
      this.authz.action = { type: "auto-sign-in", input: { accessKey: accessKey } };
      this.processSignIn();
    }
  }

  authz = {};

  get user() {
    return this.userDetails;
  }

  startSignIn() {
    this.authz.action = { type: "sign-in", input: { realm: 'R' }, outcome: null };
  }

  processSignIn() {
    this.httpClient
      .fetch("authz/signIn", { method: "POST", body: json(this.authz.action.input) })
      .then(x => x.json()).then(account => {
        this.userDetails.account = account;

        if (this.authz.action.rememberMe) {
          this.global.cookies.put("accessKey", account.accessKey);
        }
        this.authz.action = null;
      })
      .catch(err => {
        this.authz.action.outcome = "failure";
      });

  }

  cancelSignIn() {
    this.authz.action = "";
  }

  // call this method when the user  submit the sign in form.

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
    console.log(translations)
    if (this.userDetails.language == "fr") {
      return key;
    }
    else {
      return translations[this.userDetails.language];
    }
  }
}
