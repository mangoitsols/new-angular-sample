import {Aircraft, AssessmentDto, FakeSic, Flight, FratAssessmentDto, MitigationState, UserDm} from "@/_models";
import {Account} from "@/_models";
import {Airport} from "@/_models/airport";
import {FlightField, ICustomFieldValue} from "@/_models/flight-field";

export class FlightModel implements Flight {
  _id: string;
  account: Account;
  aircraft: Aircraft;
  arrival_airport: Airport;
  assessment: string | AssessmentDto;
  created: number;
  customFieldValues: ICustomFieldValue[];
  customIdentifier: string;
  departure_airport: Airport;
  fakeSic: FakeSic;
  fields: FlightField[];
  flightDate: Date;
  frat: FratAssessmentDto;
  fratId: string;
  mitigationState: MitigationState;
  pic: UserDm.User;
  responsiblePilot: UserDm.User;
  score: number;
  sic: UserDm.User;
  submissionDate: number;
  constructor(props: Partial<Flight>) {
    Object.assign(this, props);
  }

  getValueForField(field: FlightField) {
    if (field.fieldName.startsWith('custom_')) {
      const fieldValue = (this.customFieldValues || []).find(fv => fv.fieldName === field.fieldName);
      if (fieldValue) {
        return fieldValue.related || fieldValue.value;
      }
    }
    return this[field.fieldName];
  }

  getFormattableField(field:FlightField): {field: FlightField, fieldValue: any} {

    if (field.fieldName.startsWith('custom_')) {
      const fieldValue = (this.customFieldValues || []).find(fv => fv.fieldName === field.fieldName);
      if (fieldValue) {
        const value = fieldValue.related || fieldValue.value;
        return {field, fieldValue: value}
      }
    }
    return {field, fieldValue: this[field.fieldName]};

  }
}
