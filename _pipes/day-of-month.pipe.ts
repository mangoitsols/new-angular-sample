import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'dayOfMonth'
})
export class DayOfMonthPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return moment.utc(value).local().format("Do");
  }

}
