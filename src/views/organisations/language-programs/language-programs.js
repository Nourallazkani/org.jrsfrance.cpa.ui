import {UserDetails, getUri, getDistance} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';

import moment from 'moment';

@inject(HttpClient, EventAggregator, UserDetails)
export class LanguagePrograms {

  filter = { includeFutureEvents: true, includePastEvents: false, openForRegistration: true }
  results = []

  constructor(fetchClient, ea, userDetails) {
    this.fetchClient = fetchClient;
    this.ea = ea;
    this.userDetails = userDetails;
    this.find();
  }

  new() {
    if (this.results[0].action != 'new') {
      this.results.unshift({ item: {}, action: 'new' })
    }
  }

  save(model) {
    let afterUpdate = () => {
      model.action = null;
      this.ea.publish("referenceDataUpdate", { domain: "cities" });
    }

    if (model.action == 'new') {
      this.results.splice(0, 1);
      console.log("do POST")
      afterUpdate();
    }
    else {
      console.log("do PUT");
      afterUpdate();
    }
  }
  
  delete(model) {
    let afterDelete = () => {
      this.results.splice(this.results.indexOf(model), 1);
      this.ea.publish("referenceDataUpdate", { domain: "cities" });
    }
    console.log("do DELETE");
    afterDelete();
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
      .fetch(getUri("learnings/language-programs", this.filter))
      .then(response => response.json())
      .then(list => this.results = list.map(x => ({ item: x, action: null })));
  }
}
