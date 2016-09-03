
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance} from 'common'


@inject(HttpClient, UserDetails)
export class Cursus {

  filter = {}
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
  }

  find() {
    this.fetchClient
      .fetch(getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => json.map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) })))
      .then(results => this.results = results);
  }

  sort() {
    if (this.userDetails.address) {
      this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
      this.results = this.results.sort((x, y) => x.distance - y.distance);
    }
  }
}
