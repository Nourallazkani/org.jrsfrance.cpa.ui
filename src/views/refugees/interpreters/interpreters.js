
import {getUri, getDistance, UserDetails} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient, UserDetails)
export class Interpreters {

  results = []
  filter = {}

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient;
    this.userDetails = userDetails;
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("volunteers", this.filter))
      .then(response => response.json())
      .then(json => json
        .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
      )
      .then(results => { this.results = results; console.log(JSON.stringify(results, null, 2)) });
  }


  sortByDistance() {
    if (this.userDetails.address) {
      this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
      this.results = this.results.sort((x, y) => x.distance - y.distance);
    }
  }
}
