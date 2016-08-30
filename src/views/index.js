import {ViewModel} from 'common';

import {inject} from 'aurelia-framework';
import {UserDetails} from 'common'

@inject(UserDetails)
export class Index extends ViewModel {
    global;

    constructor(userDetails) {
        super();
        this.userDetails = userDetails;
    }

    setLanguage(languageKey) {
        console.log("hello")
        //this.userDetails.language = languageKey;
    }
}