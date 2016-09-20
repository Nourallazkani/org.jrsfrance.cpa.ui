
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance, viewLocation, viewItinerary} from 'common'


@inject(HttpClient, UserDetails)
export class Workshops {

  filter = { openForRegistration: true, stereotype: "WORKSHOP", audience: "REFUGEE" }
  results = []
  view = "list";

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.moment = moment;
    this.find();
  }

  find(view) {
    if (view) {
      this.view = view;
    }
    this.fetchClient
      .fetch(getUri("events", this.filter))
      .then(response => response.json())
      .then(json => json
        .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
        .sort((x, y) => moment(x.item.startDate) - moment(y.item.startDate))
      )
      .then(results => this.results = results);
  }

  sortByDistance() {
    if (this.userDetails.address) {
      this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
      this.results = this.results.sort((x, y) => x.distance - y.distance);
    }
  }
}
