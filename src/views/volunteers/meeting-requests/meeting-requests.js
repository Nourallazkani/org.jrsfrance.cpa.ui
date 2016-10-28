import {UserDetails, ReferenceData, getUri} from 'common'

import {inject, BindingEngine} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

import moment from 'moment'

@inject(HttpClient, BindingEngine, UserDetails)
export class MeetingRequests {

    constructor(fetchClient, bindingEngine, userDetails) {
        this.fetchClient = fetchClient;
        this.userDetails = userDetails;
        this.bindingEngine = bindingEngine;

        this.i18n = (key) => i18nMessages.getMessage("volunteers/meeting-requests", key, userDetails.language);
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

    cancel(model) {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests/${model.item.id}`), { method: 'delete' })
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

    viewMessages(result) {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests/${result.item.id}/messages`))
            .then(response => response.json())
            .then(messages => result.messages = messages);
    }

    newMessage(result) {
        if (result.messages.length == 0 || result.messages[0].postDate != null) {
            result.messages.push({})
        }
    }

    cancelNewMessage(listElement) {
        if (listElement.messages.length == 0){
            return;
        }
        let newMessage = listElement.messages.find(x => !x.postedDate)
        if (newMessage) {
            listElement.messages.splice(listElement.messages.indexOf(newMessage), 1);
        }
    }    

    saveNewMessage(listElement, input) {
        let vId = this.userDetails.account.id;
        let mId = listElement.item.id;
        this.fetchClient
            .fetch(getUri(`volunteers/${vId}/meeting-requests/${mId}/messages`), { method: 'post', body: json(input) })
            .then(response => response.json())
            .then(message => {
                input.from = message.from;
                input.to = message.to;
                input.postedDate = message.postedDate;
            });
    }
}
