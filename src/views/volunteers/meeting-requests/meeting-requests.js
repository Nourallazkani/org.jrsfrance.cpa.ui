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
    /*
        activate(params) {
            if (!(params.id > 0 && params.a == "a" && params.ak)) {
                return;
            }
            if (this.userDetails.account) {
                let uri = `volunteers/${this.userDetails.account.id}/meeting-requests/${params.id}`;
                this.fetchClient.fetch(uri, { method: "POST" }).then(() => console.log("ok"));
            }
            else {
                bindingEngine
                    .propertyObserver(userDetails, 'account')
                    .subscribe((account) => {
                        if (account && account.profile == "V") {
                            let uri = `volunteers/${this.userDetails.account.id}/meeting-requests/${params.id}`;
                            this.fetchClient.fetch(uri, { method: "POST" }).then(() => console.log("ok"));
                        }
                    });
            }
        }*/
    filter = { accepted: false };

    created() {
        this.find();
    }

    accept(model) {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests/${model.item.id}`), { method: 'post' })
            .then(() => {
                this.results.splice(this.results.indexOf(model), 1);
            });
    }

    find() {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests`, this.filter))
            .then(response => response.json())
            .then(list => this.results = list.map(x => ({ item: x, action: null })));
    }
}
