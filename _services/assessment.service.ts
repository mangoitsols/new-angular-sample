import {AssessmentDto, FlightAssessmentQuestion, iAssessmentQuestion} from '@/_models';
import {Observable, of} from 'rxjs';
import {map} from "rxjs/operators";
import * as _ from 'lodash';
import {HttpClient} from "@angular/common/http";
import {EventEmitter, Injectable} from "@angular/core";
import {CreateAssessmentDto} from "@/_models/assessment/CreateAssessmentDto";
import {shareReplay, tap} from "rxjs/internal/operators";
import {SubscriptionService} from "@/_services/subscription.service";
import {Cacheable, CacheBuster} from "ts-cacheable";
import {assessmentCacheNotifier$, combinedUserAssessmentCacheNotifier$} from "@/_services/cache-notifiers";


const V1_ASSESSMENTS_URL = 'api/assessments';
const ASSESSMENT_BY_ID_URL = (id: string) => `api/assessments/${id}`;
const UPDATE_QUESTION_URL = (assessmentId: string, sectionId: string, questionId: string) =>
  `/api/assessments/${assessmentId}/${sectionId}/questions/${questionId}`;

const CREATE_QUESTION_URL = (assessmentId: string, sectionId: string) =>
  `/api/assessments/${assessmentId}/${sectionId}/questions`;

const FIELDS_URL = (assessmentId: string) => `${ASSESSMENT_BY_ID_URL(assessmentId)}/fields`

export interface AssessmentChangedEvent {
  assessmentId: string;
}

@Injectable()
export class AssessmentService {

  private assessmentQuestionChanges$ = new EventEmitter<AssessmentChangedEvent>();

  constructor(private httpClient: HttpClient,
              private subscriptionService: SubscriptionService) {
  }

  get questionUpdates(): Observable<AssessmentChangedEvent> {
    return this.assessmentQuestionChanges$;
  }

  get assessmentChanges(): Observable<void> {
    return assessmentCacheNotifier$;
  }

  @Cacheable({
    cacheBusterObserver: combinedUserAssessmentCacheNotifier$
  })
  public listAssessments(): Observable<AssessmentDto[]> {
      return this.httpClient.get<AssessmentDto[]>(V1_ASSESSMENTS_URL).pipe(
        shareReplay(),
      );
  }

  @CacheBuster({
    cacheBusterNotifier: assessmentCacheNotifier$
  })
  create(params: CreateAssessmentDto): Observable<AssessmentDto> {

    return this.httpClient.post<AssessmentDto>(V1_ASSESSMENTS_URL, {}, {
      params: params,
    });
  }

  public getAssessment(assessmentId: string): Observable<AssessmentDto> {
    return this.httpClient.get<AssessmentDto>(ASSESSMENT_BY_ID_URL(assessmentId));
  }

  public getQuestion(assessmentId: string, questionId: string): Observable<iAssessmentQuestion> {
    return this.getAssessment(assessmentId).pipe(
      map(assessment => {
        for (let section of assessment.assessmentSections) {
          for (let question of section.questions) {
            if (question._id === questionId) {
              return question;
            }
          }
        }
        throw Error(`No question with ID matching ${questionId}`);
      })
    );
  }

  public saveQuestion(assessmentId: string, sectionId: string, question: FlightAssessmentQuestion): Observable<iAssessmentQuestion> {
    const questionId = _.get(question, '_id', null);

    let result: Observable<iAssessmentQuestion>;
    if (!questionId) {
      const url = CREATE_QUESTION_URL(assessmentId, sectionId);
      result = this.httpClient.post<iAssessmentQuestion>(url, question);
    } else {
      const url = UPDATE_QUESTION_URL(assessmentId, sectionId, questionId);
      result = this.httpClient.put<iAssessmentQuestion>(url, question);
    }
    return result.pipe(
      tap(questionResponse => {
        this.assessmentQuestionChanges$.emit({
          assessmentId: assessmentId
        })
      })
    )
  }

  public newQuestion(): Observable<FlightAssessmentQuestion> {
    const data = {
      ordinal: null,
      question: '',
      tip: null,
      answers: [
        {
          ordinal: 0,
          answer: 'No',
          pointValue: 0,
          note: null
        },
        {
          ordinal: 0,
          answer: 'Yes',
          pointValue: 5,
          note: null
        }
      ],
      policy: '',
    } as iAssessmentQuestion;
    return of(new FlightAssessmentQuestion(data));
  }

  @CacheBuster({
    cacheBusterNotifier: assessmentCacheNotifier$
  })
  updateAssessment(assessmentId: string, value: Partial<AssessmentDto>): Observable<AssessmentDto> {
    return this.httpClient.put<AssessmentDto>(ASSESSMENT_BY_ID_URL(assessmentId), value);
  }

  resetAssessment(assessmentId: string): Observable<AssessmentDto> {
    const query = {restore: 'true'};
    return this.httpClient.put<AssessmentDto>(ASSESSMENT_BY_ID_URL(assessmentId), {},{params: query});
  }

  @CacheBuster({
    cacheBusterNotifier: assessmentCacheNotifier$
  })
  deleteAssessment(assessmentId: string): Observable<AssessmentDto> {
    return this.httpClient.delete<AssessmentDto>(ASSESSMENT_BY_ID_URL(assessmentId));
  }

  deleteQuestion(assessmentId: string, sectionId: string, questionId: string): Observable<void>{
    return this.httpClient.delete<void>(UPDATE_QUESTION_URL(assessmentId, sectionId, questionId)).pipe(
      tap(() => {
        this.assessmentQuestionChanges$.emit({
          assessmentId: assessmentId,
        })
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: assessmentCacheNotifier$
  })
  updateMany(params: Partial<AssessmentDto>[]) {
    return this.httpClient.put<AssessmentDto[]>(V1_ASSESSMENTS_URL, params);
  }

  resetFields(assessmentId: string) {
    return this.httpClient.put(ASSESSMENT_BY_ID_URL(assessmentId), null, {params: {reset: 'true'}})
  }
}
