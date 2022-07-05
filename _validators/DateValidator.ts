import { Directive } from '@angular/core';
import {AbstractControl, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';
import * as moment from 'moment';


export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date = moment(`${control.value}`);
    const now = moment();
    return date.isValid()  ?  null : {'invalidDate': `${control.value} is not a valid date`};
  };
}

export function timeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;
    const isValid = moment(rawValue, 'HHmm').isValid();
    return isValid ? null : {'invalidTime': `${rawValue} is not a valid time`};
  }
}
