import environment from './environment';

//Configure Bluebird Promises.
Promise.config({
  longStackTraces: environment.debug,
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
        .globalResources('resources/elements/multiple-select')
        .globalResources('resources/elements/gmap')
        .globalResources('resources/elements/date-time-input')
        .globalResources('resources/attributes/place-autocomplete')
        .globalResources('resources/attributes/dynamic-text-align')
        .globalResources('resources/attributes/always-visible')
        .globalResources('resources/value-converters/object-keys-value-converter')
        .globalResources('resources/value-converters/date-format-value-converter')    
    .feature('resources');

/*
  -- env prod => {debug: false, testing: false}
  -- env stage => {debug: true, testing: false}
  -- env dev => {debug: true, testing: true}
  goal : run, build
 */
  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    environment.apiEndpoint = "http://localhost:8080/";
    aurelia.use.plugin('aurelia-testing');
  }
  else{
    environment.apiEndpoint = "http://api.cpafrance.fr/";
  }

  aurelia.start().then(() => aurelia.setRoot());
}
