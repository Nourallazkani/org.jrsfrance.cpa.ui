import {UserDetails, getUri} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';

import moment from 'moment';

@inject(HttpClient, EventAggregator, UserDetails)
export class Teachings {

  filter = { includeFutureEvents: true, includePastEvents: false }
  results = []

  constructor(fetchClient, ea, userDetails) {
    this.fetchClient = fetchClient;
    this.ea = ea;
    this.userDetails = userDetails;
    this.moment = moment;

    this.filter.organisationId=userDetails.account.id;
    
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("teachings", this.filter))
      .then(response => response.json())
      .then(results => this.results = results.map(x => ({ item: x, action: null })));
  }

  new() {
    if (this.results.length == 0 || this.results[0].action != 'new') {
      this.results.unshift({ item: {}, action: 'new' })
    }
  }

  save(model) {
    model.state = "saving";
    let afterSave = (responseBody) => {
      model.action = null;
      model.state = null;
      if (responseBody) {
        model.item = responseBody;
      }
      this.ea.publish("referenceDataUpdate", { domain: "cities" });
    }

    if (model.action == 'new') {
      this.fetchClient
        .fetch("teachings", { method: "POST", body: json(model.item) })
        .then(response => response.json())
        .then(x => afterSave(x));
    }
    else {
      this.fetchClient
        .fetch("teachings/" + model.item.id, { method: "PUT", body: json(model.item) })
        .then(response => afterSave());
    }
  }

  delete(model) {
    this.fetchClient
      .fetch("teachings/" + model.item.id, { method: "DELETE" })
      .then(() => this.results.splice(this.results.indexOf(model), 1));
  }

  cancelAction(obj) {
    if (obj.action == 'edit' || obj.action == 'delete') {
      obj.action = null;
      obj.state = null;
    }
    else if (obj.action == 'new') {
      this.results.splice(0, 1);
    }
  }
}
