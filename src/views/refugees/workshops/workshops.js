
import {Global} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Workshops {

  results = []
  filter = {stereotype:"WORKSHOP"}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
  }

  find() {
    this.fetchClient
      .fetch(this.global.getUri("events", this.filter))
        .then(response => response.json())
        .then(json => this.results = json)
  }
}
