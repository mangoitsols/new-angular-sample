import {Injectable} from "@angular/core";
import {AssessmentFieldType, FlightField} from "@/_models/flight-field";
import {AbstractControl, FormBuilder, Validators} from "@angular/forms";
import {dateValidator, timeValidator} from "@/_validators/DateValidator";
import * as moment from "moment";
import {FlightSetupForm} from "@/components/flight/FlightSetupForm";
import {numberValidator} from "@/_validators/NumberValidator";


@Injectable({providedIn: 'root'})
export class SetupFormFactory {

  constructor(private formBuilder: FormBuilder) {
  }


  buildSetupForm(fields: FlightField[]): FlightSetupForm {
    const processedFields = this.insertSpecialFields(fields);

    const controls = processedFields.map(field => this.makeFormControl(field));
    const form = this.formBuilder.group(Object.assign({}, ...controls));
    return new FlightSetupForm(processedFields, form);

  }

  private makeFormControl(field: FlightField): { [key: string]: AbstractControl } {

    const validators = (field.systemRequired || field.required) ? [Validators.required]: []

    if (field.fieldType === AssessmentFieldType.DATE_AND_TIME) {
      const now = moment.utc().toDate();
      return {
        [field.fieldName]: this.formBuilder.group({
          date: this.formBuilder.control(now, [
            ...validators,
            dateValidator()
          ]),
          time: this.formBuilder.control('', [
            ...validators,
            timeValidator()
          ]),
        })
      }
    }

    if (field.fieldType === AssessmentFieldType.NUMBER) {
      validators.push(numberValidator)
    }

    return {[field.fieldName]: this.formBuilder.control(null, validators)};
  }

  private insertSpecialFields(fields: FlightField[]) {

    const userFields = fields.filter(f => f.fieldType === AssessmentFieldType.USER);
    const hasMultipleUserFields = userFields.length > 1;
    if (hasMultipleUserFields) {
      const insertIndex = fields.indexOf(userFields[userFields.length - 1]) + 1;
      const newFields = Array.from(fields)
      newFields.splice(insertIndex, 0, {
        label: 'Which pilot is responsible for this assessment?',
        fieldName: 'responsiblePilot',
        fieldType: AssessmentFieldType.ASSIGNED_TO,
        required: true,
        systemRequired: true,
        dependsOn: userFields
      })
      return newFields;
    }
    return fields;
  }
}
