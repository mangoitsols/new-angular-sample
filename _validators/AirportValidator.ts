import { Directive } from '@angular/core';
import {AbstractControl, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';

export function airportValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (!_.get(value, '_id')) {
        const customCode = _.get(value, 'icao_code', '');
        if (customCode.length !== 4) {
            return {airportType: 'Please enter a 4 letter ICAO code or select an airport from the list.'}
        }
        return null;
        }
        if (_.get(value, 'icao_code')) {
        return null;
        }
        return {
        'airportType': 'Please select an airport from the available list'
        }
    };
}
