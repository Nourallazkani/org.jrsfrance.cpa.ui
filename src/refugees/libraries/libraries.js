
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
    var self = this
    this.fetchClient
      .fetch(self.global.getUri("organisations", self.filter))
      .then(response => response.json())
      .then(teachings => self.results = teachings)
  }
}
