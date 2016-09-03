
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance} from 'common'


@inject(HttpClient, UserDetails)
export class Cursus {

  filter = { includeFutureEvents: true, includePastEvents: false, openForRegistration: true }
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    console.log(moment);
  }

  find() {
    this.fetchClient
      .fetch(getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => json
        .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
        .sort((x, y) => moment(x.item.startDate) - moment(y.item.startDate))
      )

      .then(results => this.results = results);
  }

  sort() {
    if (this.userDetails.address) {
      this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
      this.results = this.results.sort((x, y) => x.distance - y.distance);
    }
  }

  viewLocation(address) {
    let url = `https://www.google.com/maps/place/${address.lat},${address.lng}`;
    window.open(url, 'map', "width=1200,height=600");
  }

  viewItinerary(address) {
    let url = `https://www.google.com/maps/dir/${this.userDetails.address.lat},${this.userDetails.address.lng}/${address.lat},${address.lng}`;
    window.open(url, 'map', "width=1200,height=600");
  }
}
