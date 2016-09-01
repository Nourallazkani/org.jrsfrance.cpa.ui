
import {Global} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Volunteers {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
  }

  find() {
    this.fetchClient
      .fetch(this.global.getUri("volunteers", this.filter))
        .then(response => response.json())
        .then(json => this.results = json)
  }
}
