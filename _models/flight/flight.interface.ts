import {Aircraft} from "../aircraft.interface";
import {MitigationState} from "../mitigation.state";
import {Account} from "../account.interface";
import {UserDm} from "../user-dm";
import {Airport} from "@/_models/airport";
import {FratAssessmentDto} from "@/_models/flightAssesment.model";
import * as _ from 'lodash';
import {AssessmentDto} from "@/_models/assessment/assessment.interface";
import {FlightField, ICustomFieldValue} from "@/_models/flight-field";
import {FlightModel} from "@/_models/flight/flight.model";

export interface Flight {
  _id?: string,
  /**
   * @deprecated use frat._id instead
   */
  fratId?: string,
  frat?: FratAssessmentDto
  customIdentifier?: string,
  score?: number,
  aircraft?: Aircraft,
  sic?: UserDm.User,
  pic?: UserDm.User,
  fakeSic?: FakeSic,
  flightDate?: Date,
  arrival_airport?: Airport,
  departure_airport?: Airport
  submissionDate?: number,
  created?: number,
  mitigationState: MitigationState,
  responsiblePilot?: UserDm.User,
  account: Account,
  assessment: string | AssessmentDto;

  fields: FlightField[];
  customFieldValues?: ICustomFieldValue[];
}

export interface FlightList {
  data: FlightModel[];
  meta: ListMeta;
}

export interface ListMeta {
  filter: FilterMeta[];
  sort: SortMeta;
  equals(other: ListMeta): boolean;
}

export class ListMetaModel implements ListMeta{
  filter: FilterMeta[];
  sort: SortMeta;

  constructor(data: ListMeta) {
    Object.assign(this, data);
  }

  equals(other: ListMeta): boolean {
    return _.isEqual(this, other);
  }

}

export interface FilterMeta {
  key: string;
  name: string;
}

export interface SortMeta {
  property: string;
  direction: string;
}



/**
 * Represents placeholder users used for SIC selection.
 */
export interface FakeSic {
  firstName: string,
  shortName: string,
}

export const FAKE_SICS: FakeSic[] = [
  {
    firstName: 'Select a pilot',
    shortName: 'No SIC'
  },
  {
    firstName: '** Unnamed Contract Pilot',
    shortName: 'Contract pilot'
  },
  {
    firstName: '** No Second-in-Command',
    shortName: 'No SIC'
  }
];
