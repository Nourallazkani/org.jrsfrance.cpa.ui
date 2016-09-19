
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance, viewLocation, viewItinerary} from 'common'


@inject(HttpClient, UserDetails)
export class Workshops {

  filter = { includeFutureEvents: true, includePastEvents: false, stereotype: "WORKSHOP" }
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.find();
  }
  new() {
    this.results.unshift({ item: {}, action: 'new' })
  }

  save(model) {
    console.log("save");
  }

  cancelAction(obj) {
    if (obj.action == 'edit' || obj.action == 'delete') {
      obj.action = null;
    }
    else {
      this.results.splice(0, 1);
      console.log("remove new item")
    }
  }

  find() {
    this.fetchClient
      .fetch(getUri("events", this.filter))
      .then(response => response.json())
      .then(list => this.results = list.map(x => ({ item: x, action: null })));
  }
}
