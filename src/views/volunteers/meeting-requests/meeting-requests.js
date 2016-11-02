import { UserDetails, ReferenceData, getUri } from 'common'
import {I18n} from 'i18n'

import { inject, BindingEngine } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';

import moment from 'moment'

@inject(HttpClient, BindingEngine, UserDetails, I18n)
export class MeetingRequests {

    constructor(fetchClient, bindingEngine, userDetails, i18nMessages) {
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
    filter = { accepted: "false" };

    created() {
        this.find();
    }

    find() {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests`, this.filter))
            .then(response => response.json())
            .then(list => this.results = list.map(x => ({ item: x, action: null, showMessages: false, messages: null })));
    }

    accept(listElement, firstContact) {
        let uri = `volunteers/${this.userDetails.account.id}/meeting-requests/${listElement.item.id}?firstContact=${firstContact}`;
        this.fetchClient
            .fetch(uri, { method: "POST" })
            .then(() => {
                this.results.splice(this.results.indexOf(listElement), 1);
            });        
    }

    delete(model) {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests/${model.item.id}`), { method: 'delete' })
            .then(() => {
                this.results.splice(this.results.indexOf(model), 1);
            });
    }

    /*
    viewMessages(result) {
        this.fetchClient
            .fetch(getUri(`volunteers/${this.userDetails.account.id}/meeting-requests/${result.item.id}/messages`))
            .then(response => response.json())
            .then(messages => result.messages = messages);
    }

    startAccept(result) {
        this.viewMessages(result);
        result.action = "accept";
    }

    hideMessages(result) {
        result.messages = null;
    }

    saveNewMessage(listElement, newMessage) {
        console.log(newMessage)
        let vId = this.userDetails.account.id;
        let mId = listElement.item.id;

        this.fetchClient
            .fetch(getUri(`volunteers/${vId}/meeting-requests/${mId}/messages`), { method: 'post', body: json(newMessage) })
            .then(response => response.json())
            .then(message => {
                newMessage.text = null;
                listElement.messages.push(message);
            });
    }*/
}
