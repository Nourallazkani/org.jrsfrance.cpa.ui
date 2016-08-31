import {ViewModel, UserDetails} from 'common';
import {inject} from 'aurelia-framework';

@inject(UserDetails)
export class Index extends ViewModel {


  constructor(userDetails) {
    super();
    if (userDetails.profile == null) {
      userDetails.profile = "R";
    }
  }
  configureRouter(config, router) {
    config.map([
      { route: '', name: 'refugees', moduleId: 'views/refugees/welcome', nav: true, title: 'Réfugiés > Index' },
      { route: 'events', name: 'refugees/events', moduleId: 'views/refugees/events/events', nav: true, title: 'Réfugiés > Evenements' },
      { route: 'teachings', name: 'refugees/teachings', moduleId: 'views/refugees/teachings/teachings', nav: true, title: 'Réfugiés > Enseignements supérieurs' },
      { route: 'cursus', name: 'refugees/cursus', moduleId: 'views/refugees/cursus/cursus', nav: true, title: 'Réfugiés > Apprentissage du français' },
      { route: 'workshops', name: 'refugees/workshops', moduleId: 'views/refugees/workshops/workshops', nav: true, title: 'Réfugiés > Ateliers socio linguistiques' },
      { route: 'libraries', name: 'refugees/libraries', moduleId: 'views/refugees/libraries/libraries', nav: true, title: 'Réfugiés > Auto apprentissage' },
      { route: 'volunteers', name: 'refugees/volunteers', moduleId: 'views/refugees/volunteers/volunteers', nav: true, title: 'Réfugiés > Bénévoles' }
    ]);

    this.router = router;
  }
}
