
import {getUri} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Libraries {
  
  results = []
  filter = {}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
    this.filter.stereotype="LIBRARY";
  }

  find() {
    this.fetchClient
      .fetch(getUri("organisations", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
