import {inject} from 'aurelia-framework';
import {UserDetails, ReferenceData} from 'common'

@inject(UserDetails, ReferenceData)
export class Profile {

    constructor(userDetails, referenceData) {
        this.referenceData = referenceData;
        this.userDetails = userDetails;
    }
}