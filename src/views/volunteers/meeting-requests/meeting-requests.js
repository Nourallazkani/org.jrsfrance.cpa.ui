import {UserDetails, ReferenceData, getUri} from 'common'

import {inject, BindingEngine} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

import moment from 'moment'

@inject(HttpClient, BindingEngine, UserDetails)
export class MeetingRequests {

    constructor(fetchClient, bindingEngine, userDetails) {
        this.fetchClient = fetchClient;
        this.userDetails = userDetails;
        this.bindingEngine = bindingEngine;
    }

    activate(params) {

        if (this.userDetails.account) {
            let uri = `volunteers/${this.userDetails.account.id}/meeting-requests/${params.id}`;
            this.fetchClient.fetch(uri, { method: "POST" }).then(() => console.log("ok"));
        }
        else {
            bindingEngine
                .propertyObserver(userDetails, 'account')
                .subscribe((account) => {
                    if (account) {
                        let uri = `volunteers/${this.userDetails.account.id}/meeting-requests/${params.id}`;
                        this.fetchClient.fetch(uri, { method: "POST" }).then(() => console.log("ok"));
                    }
                });
        }

        if (params.a == "a" && params.id > 0 && this.userDetails.account.id) {

        }
    }
}
