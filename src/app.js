import {UserDetails, ApplicationConfig, ReferenceData} from 'common'

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';

import moment from 'moment';


@inject(HttpClient, Router, EventAggregator, UserDetails, ApplicationConfig, ReferenceData)
export class App {

  error;

  constructor(httpClient, router, ea, userDetails, appConfig, referenceData) {

    this.moment = moment;
    this.httpClient = httpClient;
    this.ea = ea;
    this.userDetails = userDetails;

    this.httpClient.configure(config => {
      config
        .withBaseUrl(appConfig.apiEndpoint)
        .withDefaults({
          headers: { }
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            if (userDetails.accessKey) {
              console.log("set access key")
              request.headers.set("AccessKey", userDetails.accessKey);
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
          this.userDetails.accessKey = account.accessKey;
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

  signOut() {
    this.userDetails.account = null;
    this.userDetails.accessKey = null;
    localStorage.removeItem("accessKey");
    this.authzAction = null;
    if (this.userDetails.profile != "R") {
      this.userDetails.profile = null;
      this.router.navigateToRoute("home");
    }
  }
}
