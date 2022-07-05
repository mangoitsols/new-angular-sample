import {ValidatorFn} from "@angular/forms";

export const numberValidator: ValidatorFn = control => {

  const value = control.value;
  if (!value) {
    return null;
  }
  if (!isNaN(parseFloat(value)) && isFinite(value)) {
    return null;
  }
  return {
    'numberValue': 'Value must be a number'
  }
}
