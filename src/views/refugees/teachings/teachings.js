import {getUri} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Teachings {

  results = []
  filter = {}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }


  find() {
    this.fetchClient
      .fetch(getUri("teachings", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
