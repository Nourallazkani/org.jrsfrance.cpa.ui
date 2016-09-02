
import {getUri} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Workshops {

  results = []
  filter = {stereotype:"WORKSHOP"}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }

  find() {
    this.fetchClient
      .fetch(getUri("events", this.filter))
        .then(response => response.json())
        .then(json => this.results = json)
  }
}
