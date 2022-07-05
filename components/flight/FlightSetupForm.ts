import {FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";
import * as moment from "moment";
import {Flight, UserDm} from "@/_models";
import {AssessmentFieldType, FlightField} from "@/_models/flight-field";
import UserModel = UserDm.UserModel;

export class FlightSetupForm {
  constructor(public readonly fields: FlightField[], private form: FormGroup) {
  }

  get valid(): boolean {
    return this.form.valid;
  }

  populate(flight: Partial<Flight>) {

    const populateParams: any = Object.assign({}, flight);

    for (let field of this.fields) {

      const control = this.getFormControl(field.fieldName);

      const value = extractValue(populateParams, field);

      if (field.fieldType === AssessmentFieldType.DATE_AND_TIME) {
        const editDate = moment.utc(value);
        if (editDate.isValid()) {
          control.patchValue({
            date: JSON.parse(JSON.stringify(editDate)),
            time: editDate.format('HHmm')
          });
        }
        else {
          control.patchValue({
            date: new Date(),
            time: null
          });
        }
      }
      else if (field.fieldType === AssessmentFieldType.USER) {
        const user = !!value ? new UserModel(value) : null;
        control.patchValue(user);
      } else {
        control.patchValue(value);
      }
    }
  }


  getFormControl(fieldName: string) {
    return this.form.get(fieldName);
  }

  getPostData() : Flight {

    const data = Object.assign({}, this.form.value);
    const props = Object.keys(data);
    data['customFieldValues'] = [];

    for (const prop of props) {
      const isCustom = prop.startsWith('custom_');
      const field = this.fields.find(f => f.fieldName === prop);
      const value = transformValue(data[prop], field);

      if (isCustom) {
        data['customFieldValues'].push(buildCustomFieldValue(value, field))
        delete data[prop]
      } else {
        data[prop] = value;
      }
    }

    if (!data.responsiblePilot) {
      const userField = this.fields.find(f => f.fieldType === AssessmentFieldType.USER);
      if (userField) {
        data.responsiblePilot = data[userField.fieldName];
      }
    }

    return data;
  }
}

function extractValue(populateParams: any, field: FlightField) {
  if (field.fieldName.startsWith('custom_')) {
    const fieldValue = (populateParams.customFieldValues || []).find(fv => fv.fieldName === field.fieldName);
    if (!fieldValue) {
      return null;
    }
    return fieldValue.related || fieldValue.value;
  }
  return populateParams[field.fieldName];
}

function buildCustomFieldValue(value: any, field: FlightField) {
  if (field.fieldType === AssessmentFieldType.TEXT ||
      field.fieldType === AssessmentFieldType.DATE_AND_TIME ||
      field.fieldType === AssessmentFieldType.NUMBER) {
    return {
      fieldName: field.fieldName,
      value: value,
    }
  }
  const relatedType = ({
    [AssessmentFieldType.USER]: 'User',
    [AssessmentFieldType.AIRPORT]: 'Airport',
    [AssessmentFieldType.ASSIGNED_TO]: 'User',
    [AssessmentFieldType.AIRCRAFT]: 'Aircraft'
  })[field.fieldType];

  return {
    fieldName: field.fieldName,
    relatedType: relatedType,
    related: value,
  }
}

function transformValue(value: any, field: FlightField) {
  if (field.fieldType === AssessmentFieldType.DATE_AND_TIME) {
      const date = moment.utc(value.date)
      const time = moment(value.time, 'HHmm');
      return moment.utc({
        year: date.year(),
        month: date.month(),
        day: date.date(),
        hour: time.hours(),
        minute: time.minutes(),
        second: 0
      });
  }

  return value;
}


const pilotsValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  // const sic = control.get('sic').value;
  // const pic = control.get('pic').value;
  // const picIsResponsible = control.get('picResponsible').value;
  //
  // if (!picIsResponsible && !sic) {
  //   return {'mustSelectSic': 'In order to assign this FRAT to someone else, an SIC must be selected.'};
  // }
  // if (pic && sic && (pic._id === sic._id)) {
  //   return {'pilotsNotUnique': 'Cannot select the same pilot for both PIC and SIC role.'};
  // }
  return null;
};
