
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Global, ViewModel} from 'common'

@inject(HttpClient, Global)
export class Cursus extends ViewModel {

  results = []
  filter = {}

  constructor(fetchClient, global) {
    super();
    this.fetchClient = fetchClient
    this.global = global;
  }

  find() {
    this.fetchClient
      .fetch(this.global.getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }
}
