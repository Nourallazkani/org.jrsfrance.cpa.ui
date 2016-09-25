import {UserDetails, ReferenceData} from 'common'
import {I18n} from 'i18n'

import {inject} from 'aurelia-framework';


@inject(UserDetails, ReferenceData, I18n)
export class Profile {

    constructor(userDetails, referenceData, i18nMessages) {
        this.referenceData = referenceData;
        this.userDetails = userDetails;
        this.i18n = (key) => i18nMessages.getMessage("volunteers/profile", key, userDetails.language);
    }
}