import {inject, BindingEngine} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';
import {UserDetails, viewLocation, viewItinerary} from 'common'

@inject(BindingSignaler, BindingEngine, UserDetails)
export class Index {

  constructor(bindingSignaler, bindingEngine, userDetails) {
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
      { route: 'interpreters', name: 'refugees/volunteers', moduleId: 'views/refugees/interpreters/interpreters', nav: true, title: 'Interprètes' },
      { route: 'profile', name: 'refugees/profile', moduleId: 'views/refugees/profile/profile', nav: true, title: 'Profile' },
    ]);

    this.router = router;
  }
}
