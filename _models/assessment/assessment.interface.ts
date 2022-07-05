/**
 * Created by geakins on 1/30/17.
 */

import {UserDm} from "@/_models";

export enum ScoreRangeName {
  perfect = 'perfect',
  green = 'green',
  amber = 'amber',
  red = 'red'
}

export interface ScoreRangedDescription {
  status: string;
  directive: string;
}

export function scoreRangeDescription(range: ScoreRangeName): ScoreRangedDescription{
  switch (range) {
    case ScoreRangeName.perfect:
      return {
        status: 'Risk is Mild',
        directive: 'No Risk Items To Mitigate!',
      };
    case ScoreRangeName.green:
      return {
        status: 'Risk is Mild',
        directive: 'Mitigate Risk Items Below',
      };
    case ScoreRangeName.amber:
      return {
        status: 'Risk is Moderate',
        directive: 'Mitigate Risk Items Below',
      };
    case ScoreRangeName.red:
      return {
        status: 'Risk is Severe',
        directive: 'Mitigate Risk Items Below',
      };
  }
}

export interface AssessmentDto {
  _id: string;
  title: string;
  assessmentSections: Array<iAssessmentSection>;
  scoreRanges: Array<iScoreRange>;
  isDefault: boolean;
  settings?: any; // TODO: Add proper types
  users?: UserDm.User[]
  accessControl: {
    allowAll?: boolean;
    allowedUsers?: UserDm.User[] | string[];
  },
}

export interface iScoreRange {
  _id: string;
  min: number;
  max: number;
  canonicalName: ScoreRangeName;
}

export interface iAssessmentSection {
  _id: string;
  ordinal: number;
  sectionHeading: string;
  questions: Array<iAssessmentQuestion>;
}

export interface iAssessmentQuestion {
  _id: string;
  ordinal: number;
  question: string;
  tip?: string;
  answers: Array<iAssessmentAnswer>;
  policy: string;
  policySource: string;
}

export interface iAssessmentAnswer {
  _id: string;
  ordinal: number;
  answer: string;
  pointValue: number;
  note?: string;
  scoringBehavior?: null | 'warn' | 'fail';
}

export interface AssessmentInfo {
  lastUpdate?: string; // Date string
}
