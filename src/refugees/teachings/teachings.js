import {Global} from 'global'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Teachings {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
  }


  find() {
    this.fetchClient
      .fetch(this.global.getUri("teachings", self.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
