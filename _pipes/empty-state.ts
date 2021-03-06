import {Pipe, PipeTransform} from "@angular/core";
import * as _ from 'lodash'

@Pipe({
  name: 'emptyState'
})
export class EmptyStateTransform implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return _.isEmpty(value) ? '---' : value;
  }

}
