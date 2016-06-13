
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Global} from 'global'

@inject(HttpClient, Global)
export class Cursus {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
  }

  find() {
    this.fetchClient
      .fetch(this.global.getUri("cursus", self.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
