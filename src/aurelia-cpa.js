export function configure(aurelia) {
   aurelia.use
   .standardConfiguration()
   .globalResources('components/multiple-select')
   .globalResources('components/gmap')
   .globalResources('components/place-autocomplete')
   .globalResources('components/dynamic-text-align')
   .globalResources('components/always-visible');
   

   aurelia.start().then(() => aurelia.setRoot());
}