
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance} from 'common'


@inject(HttpClient, UserDetails)
export class Teachings {

  filter = { includeFutureEvents: true, includePastEvents: false }
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.find();
  }

  new() {
    this.results.unshift({ item: {} })
  }

  find() {
    this.fetchClient
      .fetch(getUri("teachings", this.filter))
      .then(response => response.json())
      .then(results => this.results = results);
  }
}
