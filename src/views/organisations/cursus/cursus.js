
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {getUri} from 'common'

@inject(HttpClient, Global)
export class Cursus {

  results = []
  filter = {}
  action = {type:null, target:null};

  constructor(fetchClient) {
    this.fetchClient = fetchClient
    this.find();
  }

  find() {
    this.fetchClient
      .fetch(getUri("cursus", this.filter))
      .then(response => response.json())
      .then(json => this.results = json)
  }

  edit(cursus){
    this.action.type = "edit";
    this.action.target = cursus ;
  }


  delete(cursus){
    this.action.type = "delete";
    this.action.target = cursus ;
  }

  cancelAction(){
    this.action = {type:null, target:null};
  }
}
