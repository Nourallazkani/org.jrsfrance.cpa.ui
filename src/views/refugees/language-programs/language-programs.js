import { UserDetails, ReferenceData, getUri, getDistance, viewLocation, viewItinerary } from 'common'
import { I18n } from 'i18n'

import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpClient } from 'aurelia-fetch-client';

import moment from 'moment';

@inject(HttpClient, EventAggregator, UserDetails, I18n, ReferenceData)
export class LanguagePrograms {

  filter = { includeClosedEvents: false }
  results = []
  view = "list";

  constructor(fetchClient, eventAggregator, userDetails, i18nMessages, referenceData) {
    this.fetchClient = fetchClient;
    this.eventAggregator = eventAggregator;
    this.userDetails = userDetails;
    this.moment = moment;
    this.viewLocation = viewLocation;
    this.viewItinerary = viewItinerary;
    this.referenceData = referenceData;

    this.i18n = (key) => i18nMessages.getMessage("refugees/language-programs", key, userDetails.language);

    this.find();
    
    this.eventAggregator.subscribe('global-events', x=>{
      if(x== "signed-in" || x=="signed-out"){
        this.find();
      }
    })
  }
  
  startSignUp(){
    this.eventAggregator.publish('global-action', 'sign-up');
  }

  startSignIn(){
    this.eventAggregator.publish('global-action', 'sign-in');
  }

  register(entry) {
    this.fetchClient.fetch(`learnings/language-programs/${entry.item.id}/registrations`, { method: "POST" })
      .then(response => {
        entry.action.outcome = "success";
        entry.item.alreadyRegistered=true;
      })
      .catch(e => {
        if (e.status == 409) {
          entry.action.outcome = "conflict";
        }
      });
  }

  unregister(entry) {
    this.fetchClient.fetch(`learnings/language-programs/${entry.item.id}/registrations/${this.userDetails.account.id}`, { method: "DELETE" })
      .then(response => {
        entry.action.outcome = "success";
        entry.item.alreadyRegistered=true;
      })
      .catch(e => {
        if (e.status == 400) {
          entry.action.outcome = "error";
        }
      });
  }

  find(view) {
    if (view) {
      this.view = view;
    }

    this.fetchClient
      .fetch(getUri("learnings/language-programs", this.filter))
      .then(response => response.json())
      .then(json => json
        .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
        .sort((x, y) => moment(x.item.startDate) - moment(y.item.startDate))
      )
      .then(results => this.results = results);
  }

  sortByDistance() {
    if (this.userDetails.address) {
      this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
      this.results = this.results.sort((x, y) => x.distance - y.distance);
    }
  }
}
