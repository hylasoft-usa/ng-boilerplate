/// <reference path='../../types/types.ts'/>

class HomeService implements core.IHomeService {
  private LogGreeting(greeting: string) {
    console.log('Received greeting: ' + greeting);
  }

  getGreeting(greeting: string) {
    this.LogGreeting(greeting);
    // do something else
    return {'greeting': greeting};
  }
}


angular
  .module('home.services', [])
  .service('HomeService', HomeService);
