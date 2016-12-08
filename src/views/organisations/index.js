import {UserDetails, viewLocation, viewItinerary} from 'common'
import {inject} from 'aurelia-framework';
import {I18n} from 'i18n';

@inject(UserDetails, I18n)
export class Index {

  constructor(userDetails, i18nMessages) {
    if (userDetails.profile == null) {
      userDetails.profile = "O";
    }
    this.viewLocation = viewLocation;
    this.viewItinerary = viewItinerary;
    this.i18n = (key) => i18nMessages.getMessage("organisations/index", key, userDetails.language);
  }
  configureRouter(config, router) {
    config.map([
      { route: '', name: 'organisations/welcome', moduleId: 'views/organisations/welcome', nav: true, title: 'Organisation > Index' },
      { route: 'teachings', name: 'organisations/teachings', moduleId: 'views/organisations/teachings/teachings', nav: true, title: 'Enseignements supérieurs' },
      { route: 'language-programs', name: 'organisations/language-programs', moduleId: 'views/organisations/language-programs/language-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'professional-programs', name: 'organisations/professional-programs', moduleId: 'views/organisations/professional-programs/professional-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'workshops', name: 'organisations/workshops', moduleId: 'views/organisations/workshops/workshops', nav: true, title: 'Ateliers socio linguistiques' },
      { route: 'libraries', name: 'organisations/libraries', moduleId: 'views/organisations/libraries/libraries', nav: true, title: 'Auto apprentissage' },
      { route: 'events', name: 'organisations/events', moduleId: 'views/organisations/events/events', nav: true, title: 'Evenements' },
      { route: 'profile', name: 'organisations/profile', moduleId: 'views/organisations/profile/profile', nav: true, title: 'Profil' }

    ]);

    this.router = router;
  }
}
