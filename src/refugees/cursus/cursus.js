
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Cursus {

  filter = {}
  results = []

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }

  find() {
    var self = this
  }
}
