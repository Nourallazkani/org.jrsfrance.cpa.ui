export class ObjectKeysValueConverter {
  toView(value){
    return value==null ? null :  Object.keys(value);
  }
};