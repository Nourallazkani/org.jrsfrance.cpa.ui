import {UserDetails, ApplicationConfig, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject, BindingEngine} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import {BindingSignaler} from 'aurelia-templating-resources';


import moment from 'moment';


@inject(HttpClient, Router, EventAggregator, BindingEngine, BindingSignaler, UserDetails, ApplicationConfig, I18n, ReferenceData)
export class App {

  error;

  constructor(httpClient, router, ea, bindingEngine, bindingSignaler, userDetails, appConfig, i18nMessages, referenceData) {

    this.moment = moment;
    this.httpClient = httpClient;
    this.ea = ea;
    this.userDetails = userDetails;
    /*
    bindingEngine
      .propertyObserver(userDetails, 'language')
      .subscribe((newValue, oldValue) => window.document.body.style.direction = (newValue == "prs" || newValue == "ar" ? "rtl" : "ltr"));
    */

    bindingEngine
      .propertyObserver(userDetails, 'language')
      .subscribe((newLanguage) => {
        bindingSignaler.signal('language-change');
        let ltr = newLanguage=="fr" || newLanguage=="en";
        document.body.style.direction= ltr ? "ltr" : "rtl";
        
        let elements = document.querySelectorAll("[left-or-right]");
        for (let i = 0; i < elements.length; i++) {
          let element = elements[i];
          element.style.textAlign= ltr ? "left" : "right";
        }
        elements = document.querySelectorAll("[right-or-left]");
        for (let i = 0; i < elements.length; i++) {
          let element = elements[i];
          element.style.textAlign= ltr ? "right" : "left";
        }
      });

    this.i18n = (key) => i18nMessages.getMessage("app", key, userDetails.language);


    this.httpClient.configure(config => {
      config
        .withBaseUrl(appConfig.apiEndpoint)
        .withDefaults({
          headers: {}
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            if (userDetails.account && userDetails.account.accessKey) {
              request.headers.set("AccessKey", userDetails.account.accessKey);
            }
            if (userDetails.language) {
              request.headers.set("Accept-Language", userDetails.language);
              /*
              if (userDetails.language == "en") {
                request.headers.set("Accept-Language", userDetails.language + ",fr");
              }
              else if (userDetails.language == "fr") {
                request.headers.set("Accept-Language", "fr");
              }
              else {
                request.headers.set("Accept-Language", userDetails.language + ",en,fr");
              }*/
            }
            console.log(request);
            return request;
          },
          response(response) {

            console.log(`Received ${response.status} ${response.url}`);

            if (response.status >= 400 && response.status <= 599) {
              if (response.url.indexOf("authz/signIn") == -1 && response.url.indexOf("authz/signUp") == -1) {
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

    this.ea.subscribe("referenceDataUpdate", (x) => {
      if (x && x.domain) {
        this.httpClient.fetch(`referenceData?noCache=true`)
          .then(resp => resp.json())
          .then(results => referenceData.refresh(x.domain, results))
      }
      else {
        this.httpClient.fetch(`referenceData?noCache=true`)
          .then(resp => resp.json())
          .then(results => referenceData.refreshAll(x))
      }
    });

    this.httpClient.fetch("referenceData")
      .then(x => x.json())
      .then(x => referenceData.load(x));

    if (localStorage.getItem("accessKey") != null /* or accessKey is in the query string*/) {
      // auto sign in
      this.input = { accessKey: localStorage.getItem("accessKey") };
      this.httpClient
        .fetch("authz/signIn", { method: "POST", body: json(this.input) })
        .then(x => x.json()).then(account => {

          this.userDetails.account = account;
        });
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
  viewProfile() {
    let realProfile = this.userDetails.account.accessKey.substring(0, 1);
    console.log(realProfile)
    if (realProfile == "R") {
      this.router.navigate("refugees/profile");
    }
    else if (realProfile == "V") {
      this.router.navigate("volunteers/profile");
    }
    else if (realProfile == "O") {
      this.router.navigate("organisations/profile");
    }
  }

  signOut() {
    this.userDetails.account = null;
    localStorage.removeItem("accessKey");
    this.authzAction = null;
    if (this.userDetails.profile != "R") {
      this.userDetails.profile = null;
      this.router.navigateToRoute("home");
    }
    else {
      if (this.router.currentInstruction.fragment == "/refugees/profile") {
        this.router.navigateToRoute("refugees");
      }
    }
  }
}
