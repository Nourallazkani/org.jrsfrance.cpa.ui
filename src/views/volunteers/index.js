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
      { route: '', name: 'volunteers/welcome', moduleId: 'views/volunteers/welcome', nav: true, title: 'Accueil' },
      { route: 'events', name: 'volunteers/events', moduleId: 'views/volunteers/events/events', nav: true, title: 'Evenements' },
      { route: 'profile', name: 'volunteers/profile', moduleId: 'views/volunteers/profile/profile', nav: true, title: 'Profil' },
      { route: 'meetingRequests', name: 'volunteers/meeting-requests', moduleId: 'views/volunteers/meeting-requests/meeting-requests', nav: true, title: 'Demande de rendez vous' }
    ]);
  }
}
