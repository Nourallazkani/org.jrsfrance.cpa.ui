
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Global, ViewModel} from 'common'

import moment from 'moment'

@inject(HttpClient, Global)
export class Events extends ViewModel {

    results = []
    filter = { includePastEvents: false, includeFutureEvents: true }

    constructor(fetchClient, global) {
        super();
        this.fetchClient = fetchClient
        this.global = global;
    }

    find() {
        this.fetchClient
            .fetch(this.global.getUri("events", this.filter))
            .then(response => response.json())
            .then(json => this.results = json.sort((x, y) => moment(x.startDate) < moment(y.startDate)))
    }
}
