
import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {Global, UserDetails} from 'common'

@inject(HttpClient, Global, UserDetails)
export class App {

  constructor(httpClient, global, userDetails) {

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

    if (localStorage.getItem("accessKey")!=null) {
      this.authz.action = "auto-sign-in";
      this.authz.input = { accessKey: localStorage.getItem("accessKey") };
      this.processSignIn();
    }
  }

  configureRouter(config, router) {
    config.title = 'CPA';
    //config.options.pushState = true;
    //config.options.hashChange = false;

    config.map([
      { route: this.userDetails.profile==null ? ['', 'index'] : 'index', name: 'index', moduleId: './views/index', nav: true, title: 'Index' },
      { route: this.userDetails.profile=="R" ? ['', 'refugees'] : 'refugees', name: 'refugees/index', moduleId: './views/refugees/index', nav: true, title: 'Réfugiés' },
      { route: this.userDetails.profile=="O" ? ['', 'organisations'] : 'organisations', name: 'organisations/index', moduleId: './views/organisations/index', nav: true, title: 'Organisation' }
    ]);
    this.router = router;
  }

  authz = {};

  startSignIn() {
    this.authz.action = "sign-in";
    this.authz.input = { realm: this.userDetails.profile };
    this.authz.outcome = null;
  }

  // call this method when the user  submit the sign in form.
  processSignIn() {
    this.httpClient
      .fetch("authz/signIn", { method: "POST", body: json(this.authz.input) })
      .then(x => x.json()).then(account => {

        this.userDetails.account = account;
        this.userDetails.accessKey = account.accessKey;
        if (this.authz.rememberMe) {
          localStorage.setItem("accessKey", account.accessKey);
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
