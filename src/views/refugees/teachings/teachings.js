import {Global, ViewModel} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Teachings extends ViewModel {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    super();
    this.fetchClient = fetchClient
    this.global = global;
    console.log(this.authz)
  }


  find() {
    this.fetchClient
      .fetch(this.global.getUri("teachings", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
