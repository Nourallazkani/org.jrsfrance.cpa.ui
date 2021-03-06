import {UserDetails, ReferenceData, getUri, getDistance, viewLocation, viewItinerary} from 'common'
import {I18n} from 'i18n'

import {inject, BindingEngine} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

import moment from 'moment';

@inject(HttpClient, BindingEngine, UserDetails, I18n, ReferenceData)
export class Workshops {

  filter = { openForRegistration: true, audience: "REFUGEE" }
  stereotype: "WORKSHOP";
  results = []
  view = "list";

  constructor(fetchClient, bindingEngine, userDetails, i18nMessages, referenceData) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.moment = moment;
    this.viewLocation = viewLocation;
    this.viewItinerary = viewItinerary;
    this.referenceData = referenceData;


    this.i18n = (key) => i18nMessages.getMessage("refugees/workshops", key, userDetails.language);

    this.find();

    bindingEngine
      .propertyObserver(userDetails, 'language')
      .subscribe((newValue, oldValue) => this.find());
  }

  find(view) {
    if (view) {
      this.view = view;
    }
    this.fetchClient
      .fetch(getUri("workshops", this.filter))
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
