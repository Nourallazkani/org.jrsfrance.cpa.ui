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
      { route: '', name: 'refugees', moduleId: 'views/organisations/welcome', nav: true, title: 'Organisation > Index' },
      { route: 'cursus', name: 'organisations/cursus', moduleId: 'views/organisations/cursus/cursus', nav: true, title: 'Organisation > Apprentissage du français' }
    ]);

    this.router = router;
  }
}
