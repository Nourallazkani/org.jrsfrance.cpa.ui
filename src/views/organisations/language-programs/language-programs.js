import {UserDetails, ReferenceData, getUri, viewLocation} from 'common'

import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import {I18n} from 'i18n';
import moment from 'moment';

@inject(HttpClient, EventAggregator, UserDetails, ReferenceData, I18n)
export class LanguagePrograms {

  filter = { includeFutureEvents: true, includePastEvents: false }
  results = []

  constructor(fetchClient, ea, userDetails, referenceData, i18nMessages) {
    this.fetchClient = fetchClient;
    this.ea = ea;
    this.userDetails = userDetails;
    this.moment = moment;
    this.viewLocation = viewLocation;
    this.referenceData = referenceData;
    this.i18n = (key) => i18nMessages.getMessage("organisations/language-programs", key, userDetails.language);
  }

  created() {
    this.filter.organisationId = this.userDetails.account.id;
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("learnings/language-programs", this.filter))
      .then(response => response.json())
      .then(list => this.results = list.map(x => ({ item: x, action: null })));
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
      model.errors = null;
      if (responseBody) {
        model.item = responseBody;
      }
      this.ea.publish("referenceDataUpdate", { domain: "cities" })
    }

    if (model.action == 'new') {
      this.fetchClient
        .fetch("learnings/language-programs", { method: "POST", body: json(model.item) })
        .then(response => response.json())
        .then(x => afterSave(x))
        .catch(e => e.json().then(x => model.errors = x));
    }
    else {
      this.fetchClient
        .fetch("learnings/language-programs/" + model.item.id, { method: "PUT", body: json(model.item) })
        .then(response => afterSave())
        .catch(e => e.json().then(x => model.errors = x));
    }
  }

  delete(model) {
    let afterDelete = () => {
      this.results.splice(this.results.indexOf(model), 1);
      this.ea.publish("referenceDataUpdate", { domain: "cities" });
    }
    this.fetchClient
      .fetch("learnings/language-programs/" + model.item.id, { method: "DELETE" })
      .then(response => afterDelete());
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
