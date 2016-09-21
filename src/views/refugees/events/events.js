
import {inject, BindingEngine} from 'aurelia-framework';
import moment from 'moment';
import {HttpClient} from 'aurelia-fetch-client';
import {UserDetails, ReferenceData, getUri, getDistance, viewLocation, viewItinerary} from 'common'


@inject(HttpClient, BindingEngine, UserDetails, ReferenceData)
export class Events {

    results = []
    filter = { includePastEvents: false, includeFutureEvents: true, audience: "REFUGEE" }
    view = "list";

    constructor(fetchClient, bindingEngine, userDetails, referenceData) {
        this.fetchClient = fetchClient
        this.userDetails = userDetails;
        this.moment = moment;
        this.viewLocation = viewLocation;
        this.viewItinerary = viewItinerary;
        this.referenceData = referenceData;
        this.find();

        bindingEngine
            .propertyObserver(userDetails, 'language')
            .subscribe((newValue, oldValue) => this.find(this.view, newValue));
    }

    find(view, language) {
        if (view) {
            this.view = view;
        }
        let userLanguage = language || this.userDetails.language;

        this.fetchClient
            .fetch(getUri("events", this.filter), { headers: { "Accept-Language": userLanguage } })
            .then(response => response.json())
            .then(json => json
                .map(x => ({ item: x, distance: getDistance(x.address, this.userDetails.address) }))
                .sort((x, y) => moment(x.item.startDate) - moment(y.item.startDate))
            )
            .then(results => this.results = results);
    }

    sortByDistance() {
        if (this.userDetails.address) {
            this.results.forEach(x => x.distance = getDistance(x.item.address, this.userDetails.address));
            this.results = this.results.sort((x, y) => x.distance - y.distance);
        }
    }
}
