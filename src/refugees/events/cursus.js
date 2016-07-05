
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Global} from 'global'

@inject(HttpClient, Global)
export class Events {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    this.fetchClient = fetchClient
    this.global = global;
  }

  find() {
    console.log(this.filter)
    this.fetchClient
      .fetch(this.global.getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
