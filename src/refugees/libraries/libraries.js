
import {Global} from 'global';

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, Global)
export class Libraries {
  
  results = []
  filter = {}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
    this.filter.stereotype="LIBRARY";
  }


  find() {
    this.fetchClient
      .fetch(this.global.getUri("organisations", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
