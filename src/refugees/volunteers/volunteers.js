
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Volunteers {

  results = []
  filter = {}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }

  find() {
    var self = this
    this.fetchClient.fetch("/myfile.json").then(response => response.json()).then(json => self.results = json)
  }
}
