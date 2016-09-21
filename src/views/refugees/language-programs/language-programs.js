
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, ReferenceData, getUri, getDistance, viewLocation, viewItinerary} from 'common'


@inject(HttpClient, UserDetails, ReferenceData)
export class LanguagePrograms {

  filter = { includeFutureEvents: true, includePastEvents: false, openForRegistration: true }
  results = []
  view = "list";

  constructor(fetchClient, userDetails, referenceData) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.moment = moment;
    this.viewLocation = viewLocation;
    this.viewItinerary = viewItinerary;
    this.referenceData = referenceData;
    this.find();
  }

  find(view) {
    if (view) {
      this.view = view;
    }

    this.fetchClient
      .fetch(getUri("learnings/language-programs", this.filter))
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
