
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {getUri} from 'common'

import moment from 'moment'

@inject(HttpClient)
export class Events {

    results = []
    filter = { includePastEvents: false, includeFutureEvents: true }

    constructor(fetchClient, userDetails) {
        this.fetchClient = fetchClient
        this.userDetails = userDetails;
        this.find();
    }

    find() {
        this.fetchClient
            .fetch(getUri("events", this.filter))
            .then(response => response.json())
            .then(json => json
                .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
                .sort((x, y) => moment(x.item.startDate) - moment(y.item.startDate))
            )
            .then(results => { this.results = results; console.log(JSON.stringify(results, null, 2)) });
    }
}
