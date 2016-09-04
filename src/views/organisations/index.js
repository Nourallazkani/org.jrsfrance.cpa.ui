import {UserDetails} from 'common';
import {inject} from 'aurelia-framework';

@inject(UserDetails)
export class Index {

  constructor(userDetails) {
    if (userDetails.profile == null) {
      userDetails.profile = "O";
    }
  }
  configureRouter(config, router) {
    config.map([
      { route: '', name: 'refugees', moduleId: 'views/organisations/welcome', nav: true, title: 'Organisation > Index' },

      { route: 'teachings', name: 'organisations/teachings', moduleId: 'views/organisations/teachings/teachings', nav: true, title: 'Enseignements supérieurs' },
      { route: 'language-programs', name: 'organisations/language-programs', moduleId: 'views/organisations/language-programs/language-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'professional-programs', name: 'organisations/professional-programs', moduleId: 'views/organisations/professional-programs/professional-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'workshops', name: 'organisations/workshops', moduleId: 'views/organisations/workshops/workshops', nav: true, title: 'Ateliers socio linguistiques' },
      { route: 'libraries', name: 'organisations/libraries', moduleId: 'views/organisations/libraries/libraries', nav: true, title: 'Auto apprentissage' },
      { route: 'events', name: 'organisations/events', moduleId: 'views/organisations/events/events', nav: true, title: 'Evenements' },

    ]);

    this.router = router;
  }
}
