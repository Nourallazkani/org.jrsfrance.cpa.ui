import moment from 'moment';

// sera utilisation sous le nom myDateFormat
export class MyDateFormatValueConverter {

  formaters = {event:"D/M/YYYY h:mm:ss a"}
  defaultFormat = "D/M/YYYY"

  toView(value,format) {
    if(format==null){
      console.log("use default formater")
      return moment(value).format(this.defaultFormat);
    }
    var formater= this.formaters[format];
    if(formater!=null){
      console.log(`there is predefined formater for ${format} : ${formater}`)
      return moment(value).format(formater);
    }
    else{
      return moment(value).format(format);
    }
  }
}