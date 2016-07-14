
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {Global} from 'global'

@inject(Router, HttpClient, Global)
export class App {

  constructor(router, httpClient, global) {
    httpClient.configure(config => {
      config
        .withBaseUrl('http://127.0.0.1:8080/api/')
        .withDefaults({
          headers: {}
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            return request;
          },
          response(response) {
            console.log(`Received ${response.status} ${response.url}`);
            return response;
          }
        });
    })

    httpClient.fetch("referenceData").then(x => x.json()).then(x => global.referenceData = x)

    this.router = router
    this.router.configure(config => {
      //config.options.pushState = true;
      config.title = "CPA";
      config.map([
        { route: ['', 'Index'], name: 'index', moduleId: 'views/index', nav: true, title: 'Index' },
        { route: ['Home'], name: 'home', moduleId: 'views/home', nav: true, title: 'Accueil' },
        { route: ['Refugees'], name: 'refugees/index', moduleId: 'views/refugees/index', nav: true, title: 'Réfugiés' }
        /*
        { route: ['events'], moduleId: 'views/refugees/events/events', nav: true, title: 'Réfugiés > Evenements' },
        { route: ['teachings'], moduleId: 'views/refugees/teachings/teachings', nav: true, title: 'Réfugiés > Enseignements supérieurs' },
        { route: ['cursus'], moduleId: 'views/refugees/cursus/cursus', nav: true, title: 'Réfugiés > Apprentissage du français' },
        { route: ['workshops'], moduleId: 'views/refugees/workshops/workshops', nav: true, title: 'Réfugiés > Ateliers socio linguistiques' },
        { route: ['libraries'], moduleId: 'views/refugees/libraries/libraries', nav: true, title: 'Réfugiés > Auto apprentissage' },
        { route: ['volunteers'], moduleId: 'views/refugees/volunteers/volunteers', nav: true, title: 'Réfugiés > Bénévoles' }*/
      ])

    })
  }
}
