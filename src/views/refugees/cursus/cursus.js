
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, addDistance} from 'common'


@inject(HttpClient, UserDetails)
export class Cursus {

  filter = {}
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
  }

  find() {
    console.log("xx")
    this.fetchClient
      .fetch(getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => this.results = json.map(addDistance))
  }

  sort() {
    console.log(this.userDetails.address);
  }
}
