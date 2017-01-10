import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import { HttpClient } from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';


@inject(HttpClient, UserDetails, I18n)
export class Profile {

    constructor(fetchClient, userDetails, referenceData, i18nMessages) {
        this.fetchClient = fetchClient;
        this.userDetails = userDetails;
        this.i18n = (key) => i18nMessages.getMessage("refugees/profile", key, userDetails.language);
    }

    activate() {
        return new Promise((resolve, reject) => {
            this.fetchClient.fetch(`volunteers/${this.userDetails.account.id}`)
                .then(x => x.json())
                .then(x => {
                    this.volunteer = x;
                    resolve();
                });
        });
    }
}