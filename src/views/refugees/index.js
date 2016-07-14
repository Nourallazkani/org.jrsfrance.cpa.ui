
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

@inject(Router)
export class Index {

  constructor(router) {
    router.configure(config => {
      config.map([
        { route: ['refugees/events'], name:'refugees/events', moduleId: 'views/refugees/events/events', nav: true, title: 'Réfugiés > Evenements' },
        { route: ['refugees/teachings'], name:'refugees/teachings', moduleId: 'views/refugees/teachings/teachings', nav: true, title: 'Réfugiés > Enseignements supérieurs' },
        { route: ['refugees/cursus'], name:'refugees/cursus', moduleId: 'views/refugees/cursus/cursus', nav: true, title: 'Réfugiés > Apprentissage du français' },
        { route: ['refugees/workshops'], name:'refugees/workshops', moduleId: 'views/refugees/workshops/workshops', nav: true, title: 'Réfugiés > Ateliers socio linguistiques' },
        { route: ['refugees/libraries'], name:'refugees/libraries', moduleId: 'views/refugees/libraries/libraries', nav: true, title: 'Réfugiés > Auto apprentissage' },
        { route: ['refugees/volunteers'], name:'refugees/volunteers', moduleId: 'views/refugees/volunteers/volunteers', nav: true, title: 'Réfugiés > Bénévoles' }
      ])
    })
  }
}
