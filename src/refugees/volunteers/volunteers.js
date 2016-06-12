
import {Global} from 'global';
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
    var self = this
    this.fetchClient
      .fetch(self.global.getUri("volunteers", self.filter))
        .then(response => response.json())
        .then(json => self.results = json)
  }
}
