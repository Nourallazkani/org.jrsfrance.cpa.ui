import {UserDetails, ReferenceData, getUri} from 'common'
import {I18n} from 'i18n'

import {inject, BindingEngine} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

import moment from 'moment';

@inject(HttpClient, BindingEngine, UserDetails, I18n, ReferenceData)
export class MeetingRequests {

  results = []
  refugee;

  constructor(fetchClient, bindingEngine, userDetails, i18nMessages, referenceData) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.moment = moment;
    this.referenceData = referenceData;

    //this.i18n = (key) => i18nMessages.getMessage("refugees/meeting-requests", key, userDetails.language);
    if (this.userDetails.account && this.userDetails.account.profile=="R") {
      this.initialize();
    }
    else {
      bindingEngine
        .propertyObserver(userDetails, 'account')
        .subscribe((account) => {
          if (account && account.profile == "R") {
            this.initialize();
          }
        });
    }
  }


  initialize() {
    this.fetchClient
      .fetch(`refugees/${this.userDetails.account.id}`)
      .then(response => response.json())
      .then(r => this.refugee = r)
      .then(() => this.find());
  }

  find() {
    this.fetchClient
      .fetch(getUri(`refugees/${this.userDetails.account.id}/meeting-requests`))
      .then(response => response.json())
      .then(list => this.results = list.map(x => ({ item: x, action: null })));
  }


  new() {
    if (this.results.length == 0 || this.results[0].action != 'new') {
      let newItem = {
        refugeeLocation: this.userDetails.address,
        refugee: {
          mailAddress: this.refugee.mailAddress,
          phoneNumber: this.refugee.phoneNumber
        }
      };

     this.results.unshift({ item: newItem, action: 'new' })
    }
  }

  cancel() {
    this.results.splice(0, 1);
  }

  save(model) {
    model.state = "saving";
    this.fetchClient
      .fetch(`refugees/${this.userDetails.account.id}/meeting-requests`, { method: "POST", body: json(model.item) })
      .then(response => response.json())
      .then(x => {
        model.action = null;
        model.state = null;
        model.item = x;
      });
  }
}
