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

  setUserLanguage(newLanguage) {
    this.userDetails.language = newLanguage;
    this.bindingSignaler.signal('language-change');
    if (newLanguage == "ar" || newLanguage == "prs") {
      document.body.style.direction = "rtl";
    }
    else {
      document.body.style.direction = "ltr";
    }
  }

  constructor(httpClient, router, ea, bindingEngine, bindingSignaler, userDetails, appConfig, i18nMessages, referenceData) {

    this.moment = moment;
    this.httpClient = httpClient;
    this.ea = ea;
    this.userDetails = userDetails;
    this.bindingSignaler = bindingSignaler;

    if(userDetails.language=="ar" || userDetails.language=="prs"){
      document.body.style.direction = "rtl";
    }
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

    if (localStorage.getItem("accessKey") != null || window.location.href.split("ak=").length == 2) {
      
      let accessKey = localStorage.getItem("accessKey") || window.location.href.split("ak=")[1]
      this.httpClient
        .fetch("authentication", { method: "POST", body: json({ accessKey: accessKey }) })
        .then(x => x.json()).then(account => {
          this.userDetails.account = account;
        }).catch(() => localStorage.removeItem("accessKey"));
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
    if (this.userDetails.account.profile == "R") {
      this.router.navigate("refugees/profile");
    }
    else if (this.userDetails.account.profile == "V") {
      this.router.navigate("volunteers/profile");
    }
    else if (this.userDetails.account.profile == "O") {
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
