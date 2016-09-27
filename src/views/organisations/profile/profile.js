import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

@inject(HttpClient, UserDetails, ReferenceData, I18n)
export class Profile {

    constructor(fetchClient, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.referenceData = referenceData;
        this.userDetails = userDetails;

        this.i18n = (key) => i18nMessages.getMessage("organisations/profile", key, userDetails.language);

        let map = new Map();
        map.set("Alaric", "Paris");
        map.set("Carla", "Paris");
        console.log(JSON.stringify(map))
        let uri = "organisations/" + this.userDetails.account.id;
        this.fetchClient.fetch(uri)
            .then(x => x.json())
            .then(x => this.input = x);
    }

    update() {
        this.fetchClient.fetch("organisations/" + this.userDetails.account.id, { method: "put", body: json(this.input) })
            .then(x => this.outcome = "success");
    }
}