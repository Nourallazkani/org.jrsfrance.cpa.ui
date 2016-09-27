import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject, bindable, CompositionTransaction} from 'aurelia-framework'
import {HttpClient, json} from 'aurelia-fetch-client';

@inject(HttpClient, CompositionTransaction, UserDetails, ReferenceData, I18n)
export class Availabilities {


    input = { languages: [] };

    outcome;

    constructor(fetchClient, compositionTransaction, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.userDetails = userDetails;
        this.referenceData = referenceData;
        this.i18n = (key) => i18nMessages.getMessage("volunteers/availabilities", key, userDetails.language);
        // here we use compositionTransaction because if user has account then input should be bound before the component is rendered.
        // otherwise <multilple-select></multiple-select> starts working with a null input, which causes issues with selection.bind.
        // So 'created'' callback must explictely call this.compositionTransactionNotifier.done() to trigger the attachement of the custom element.
        this.compositionTransactionNotifier = compositionTransaction.enlist();
    }

    created() {
        let uri = "volunteers/" + this.userDetails.account.id;
        this.fetchClient.fetch(uri)
            .then(x => x.json())
            .then(x => {
                this.input = x;
                this.compositionTransactionNotifier.done();
            });
    }

    update() {
        let uri = `volunteers/${this.userDetails.account.id}`
        this.fetchClient.fetch(uri, { body: json(this.input), method: "put" })
            .then(x => {
                this.userDetails.lastAction = null;
                this.outcome = { status: "ok" }
            })
            .catch(e => e.json().then(x => this.outcome = { status: "failure", errors: x }))
    }
}