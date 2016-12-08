import {UserDetails, viewLocation, viewItinerary} from 'common'
import {I18n} from 'i18n'

import {inject} from 'aurelia-framework';

@inject(UserDetails, I18n)
export class Welcome {
    
    constructor(userDetails, i18nMessages) {
        this.i18n = (key) => i18nMessages.getMessage("organisations/welcome", key, userDetails.language);
    }

}