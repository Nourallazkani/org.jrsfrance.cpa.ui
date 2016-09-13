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
      { route: '', name: 'volunteers', moduleId: 'views/volunteers/welcome', nav: true, title: 'Accueil' },
      { route: 'events', name: 'volunteers/events', moduleId: 'views/volunteers/events/events', nav: true, title: 'Evenements' },
      { route: 'availabilities', name: 'volunteers/availabilities', moduleId: 'views/volunteers/availabilities/availabilities', nav: true, title: 'Disponibilité' },
      { route: 'meetingRequests', name: 'volunteers/meetingRequests', moduleId: 'views/volunteers/meetingRequests/meetingRequests', nav: true, title: 'Demande de rendez vous' }
    ]);
    
    this.router = router;
  }
}
