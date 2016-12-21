import {UserDetails} from 'common';

import {inject} from 'aurelia-framework'
import moment from 'moment';
import {FrLocale, ArLocale, PrsLocale} from 'moment-locales'

// sera utilisation sous le nom myDateFormat
@inject(UserDetails, FrLocale, ArLocale, PrsLocale)
export class MyDateFormatValueConverter {

  formaters = { event: "D/M/YYYY h:mm:ss a" }
  defaultFormat = "D/M/YYYY"

  constructor(userDetails, frLocale, arLocale, prsLocale) {
    this.userDetails = userDetails;
    moment.locale("fr", frLocale);
    moment.locale("ar", arLocale);
    moment.locale("prs", prsLocale);
  }

  toView(value, format) {
    let locale = moment.locales().includes(this.userDetails.language) ? this.userDetails.language : "en";
    if (format != null) {
      return moment(value).locale(locale).format(format);
    }
    else {
      let formater = this.formaters[format];
      return moment(value).locale(locale).format(formater || this.defaultFormat);
    }
  }
}