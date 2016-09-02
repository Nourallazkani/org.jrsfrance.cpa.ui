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
      { route: 'cursus', name: 'organisations/cursus', moduleId: 'views/organisations/cursus/cursus', nav: true, title: 'Organisation > Apprentissage du français' }
    ]);

    this.router = router;
  }
}
