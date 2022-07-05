import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {untilDestroyed} from 'ngx-take-until-destroy';
import {tap} from "rxjs/internal/operators";
import {AddonFeatureModal} from "@/components/shared/addon-feature-modal/addon-feature-modal.component";
import {from, Observable, of} from "rxjs";
import {filter, map, retry, switchMap, take} from "rxjs/operators";
import {Location} from '@angular/common'
import {AssessmentService, UserService} from "@/_services";
import {AddonFeature} from "@/_models/addon-features";
import {Router} from "@angular/router";
import {AddonFeatureService} from "@/_services/addon-feature.service";
import {FormBuilder} from "@angular/forms";
import {CreateAssessmentDto, CreateMode} from "@/_models/assessment/CreateAssessmentDto";
import {CopyAssessmentModalComponent} from "@/components/assessment/copy-assessment-modal/copy-assessment-modal.component";


@Component({
  selector: 'app-create-assessment',
  styleUrls: ['./create-assessment.component.scss'],
  templateUrl: './create-assessment.component.html'
})
export class CreateAssessmentComponent implements OnInit, OnDestroy {

  readonly creationModes = CreateMode;
  private onAction$ = new EventEmitter<CreateMode>();

  constructor(
    private modalService: NgbModal,
    private location: Location,
    private userService: UserService,
    private router: Router,
    private addonFeatureService: AddonFeatureService,
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
  ) {
  }

  ngOnInit() {

    this.onAction$.pipe(
      switchMap(mode => {
        return this.checkFeatureEnabled().pipe(
          filter(hasMAFeature => !!hasMAFeature),
          map(() => mode)
        )
      }),
      switchMap((mode): Observable<CreateAssessmentDto> => {
        if (mode === CreateMode.Copy) {
          return this.showCopyDialog();
        }
        return of({method: mode})
      }),
      switchMap(createParams => this.assessmentService.create(createParams)),
      tap(assessment => {
        this.router.navigate(['/settings', 'assessments', assessment._id])
      }),
      retry(),
    ).subscribe()
  }

  ngOnDestroy(): void {
  }

  private showCopyDialog(): Observable<CreateAssessmentDto> {

      const modal = this.modalService.open(CopyAssessmentModalComponent);
      return from(modal.result).pipe(
        filter(result => !!result),
        map((result: string) => {
          return {
            method: CreateMode.Copy,
            copyFrom: result
          }
        })
      );
  }

  private checkFeatureEnabled(): Observable<boolean> {
    return this.addonFeatureService.hasAddonFeature(AddonFeature.multipleAssessments).pipe(
      untilDestroyed(this),
      take(1),
      tap(hasMAFeature => {
        if (!hasMAFeature) {
          const modal = this.modalService.open(AddonFeatureModal);
          const component: AddonFeatureModal = modal.componentInstance;
          component.image = '/assets/img/illustration-multiple-risk-forms.svg'
          component.title = 'Multiple Risk Forms';
          component.subtitle = 'This is an add-on feature';
          component.description =
            `Create different risk forms for various individuals, departments, or operations.<br><br>
            You can also control which users have access to view and take each assessment!`;
        }
      })
    );
  }

  create(mode: CreateMode) {
    this.onAction$.emit(mode);
  }
}
