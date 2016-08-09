
import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {Global} from 'common'

@inject(HttpClient, Global)
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

  constructor(httpClient, global) {
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

    let accessKey = global.cookies.get("accessKey")
    if (accessKey) {
      this.authz.action = { type: "auto-sign-in", input: { accessKey: accessKey } };
      this.processSignIn();
    }
  }

  authz = {};

  startSignIn() {
    this.authz.action = { type: "sign-in", input: {realm:'R'}, outcome: null };
  }

  processSignIn() {
    this.httpClient
      .fetch("authz/signIn", { method: "POST", body: json(this.authz.action.input) })
      .then(x => x.json()).then(user => {
        this.global.user = user;
        this.authz.user = user;

        if (this.authz.action.rememberMe) {
          this.global.cookies.put("accessKey", user.accessKey);
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

}
