
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';

@inject(Router, HttpClient)
export class App {

  constructor(router, httpClient) {
    httpClient.configure(config => {
      config.withBaseUrl('http://127.0.0.1:8080/src')
        .withDefaults({
          headers: {}
        })
    })

    this.router = router
    this.router.configure(config => {
      config.title = "CPA";
      config.map([
        { route: ['', 'Welcome'], moduleId: 'refugees/index', nav: true, title: 'Welcome' },
        { route: ['teachings'], moduleId: 'refugees/teachings/teachings', nav: true, title: 'Teachings' },
        { route: ['cursus'], moduleId: 'refugees/cursus/cursus', nav: true, title: 'Cursus' },
        { route: ['volunteers'], moduleId: 'refugees/volunteers/volunteers', nav: true, title: 'Volunteers' },
        { route: ['libraries'], moduleId: 'refugees/libraries/libraries', nav: true, title: 'Librairies' }
      ])

    })
  }
}
