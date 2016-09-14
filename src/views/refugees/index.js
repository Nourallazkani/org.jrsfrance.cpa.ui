import {inject} from 'aurelia-framework';
import {UserDetails, viewLocation, viewItinerary} from 'common'

@inject(UserDetails)
export class Index {

  constructor(userDetails) {
    if (userDetails.profile == null) {
      userDetails.profile = "R";
    }
    this.viewLocation = viewLocation;
    this.viewItinerary = viewItinerary;
  }

  configureRouter(config, router) {
    config.map([
      { route: '', name: 'refugees/welcome', moduleId: 'views/refugees/welcome', nav: true, title: 'Index' },
      { route: 'teachings', name: 'refugees/teachings', moduleId: 'views/refugees/teachings/teachings', nav: true, title: 'Enseignements supérieurs' },
      { route: 'language-programs', name: 'refugees/language-programs', moduleId: 'views/refugees/language-programs/language-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'professional-programs', name: 'refugees/professional-programs', moduleId: 'views/refugees/professional-programs/professional-programs', nav: true, title: 'Apprentissage du français' },
      { route: 'workshops', name: 'refugees/workshops', moduleId: 'views/refugees/workshops/workshops', nav: true, title: 'Ateliers socio linguistiques' },
      { route: 'libraries', name: 'refugees/libraries', moduleId: 'views/refugees/libraries/libraries', nav: true, title: 'Auto apprentissage' },
      { route: 'events', name: 'refugees/events', moduleId: 'views/refugees/events/events', nav: true, title: 'Evenements' },
      { route: 'interpreters', name: 'refugees/volunteers', moduleId: 'views/refugees/interpreters/interpreters', nav: true, title: 'Interprètes' }
    ]);
    
    this.router = router;
  }
}
