import {UserDetails} from 'common';

import {inject} from 'aurelia-framework'
import moment from 'moment';
import {FrLocale, ArLocale, PrsLocale} from 'moment-locales'

// sera utilisation sous le nom myDateFormat
@inject(UserDetails, FrLocale)
export class MyDateFormatValueConverter {

  formaters = { event: "D/M/YYYY h:mm:ss a" }
  defaultFormat = "D/M/YYYY"

  constructor(userDetails, frLocale) {
    this.userDetails = userDetails;
    moment.locale("fr", frLocale);
  }

  toView(value, format) {
    let locale = moment.locales().includes(this.userDetails.language) ? this.userDetails.language : "en";
    
    if (format == null) {
      return moment(value).locale(locale).format(this.defaultFormat);
    }
    
    let formater = this.formaters[format];
    return moment(value).locale(locale).format(formater || this.defaultFormat);
  }
}