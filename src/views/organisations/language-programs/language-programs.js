
import {inject} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, getUri, getDistance} from 'common'


@inject(HttpClient, UserDetails)
export class LanguagePrograms {

  filter = { includeFutureEvents: true, includePastEvents: false, openForRegistration: true }
  results = []

  constructor(fetchClient, userDetails) {
    this.fetchClient = fetchClient
    this.userDetails = userDetails;
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("learnings/language-programs", this.filter))
      .then(response => response.json())
      .then(json => this.results = json);
  }
}
