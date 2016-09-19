
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

    new() {
        this.results.unshift({ item: {}, action: 'new' })
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
