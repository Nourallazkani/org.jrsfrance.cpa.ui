
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {getUri} from 'common'

import moment from 'moment'

@inject(HttpClient)
export class Events {

    results = []
    filter = { includePastEvents: false, includeFutureEvents: true }

    constructor(fetchClient) {
        this.fetchClient = fetchClient
    }

    find() {
        this.fetchClient
            .fetch(getUri("events", this.filter))
            .then(response => response.json())
            .then(json => this.results = json.sort((x, y) => moment(x.startDate) < moment(y.startDate)))
    }
}
