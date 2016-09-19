
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance, viewLocation, viewItinerary} from 'common'


@inject(HttpClient, UserDetails)
export class Workshops {

  filter = { includeFutureEvents: true, includePastEvents: false, stereotype: "WORKSHOP" }
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("events", this.filter))
      .then(response => response.json())
      .then(results => this.results = results);
  }
}
