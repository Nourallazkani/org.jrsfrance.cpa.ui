
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Index {

  results = []
  filter = {}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }

  find() {
    var self = this
  }
}
