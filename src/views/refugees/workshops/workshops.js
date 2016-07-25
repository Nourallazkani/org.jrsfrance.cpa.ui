
import {Global, ViewModel} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Workshops extends ViewModel {

  results = []
  filter = {stereotype:"WORKSHOP"}

  constructor(fetchClient, global) {
    super();
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
