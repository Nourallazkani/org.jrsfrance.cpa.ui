
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class Teachings {

  buildQuery(uri, values){
    if(values){
      var params=[]
      for(var p in values){
        params.push(encodeURIComponent(p)+"="+encodeURIComponent(values[p]))
      }
      return uri+"?"+params.join("&")
    }
    else{
      return uri;
    }
  }
  results = []
  filter = {}

  constructor(fetchClient) {
    this.fetchClient = fetchClient
  }

  find() {
    var self = this
    
    this.fetchClient.fetch(self.buildQuery("teachings", self.filter)).then(response => response.json()).then(teachings => self.results = teachings)
  }
}
