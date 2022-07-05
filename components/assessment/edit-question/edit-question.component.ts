import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {AssessmentService} from "@/_services";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {debounceTime, retry, shareReplay, take, tap, withLatestFrom} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import {combineLatest, from, Observable} from "rxjs";
import {filter, map, switchMap} from "rxjs/internal/operators";
import {untilDestroyed} from "ngx-take-until-destroy";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NewModalComponent} from "@/components/shared/new-modal/new-modal.component";


@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['../edit-assessment/edit-assessment.component.scss']
})
export class EditQuestionComponent implements OnInit, OnDestroy {

  confirmationMessage = '<p>Are you sure you want to delete this risk factor?</p><p><b>This action cannot be undone.</b></p>';
  showConfirmDelete: boolean;

  form$: Observable<FormGroup>

  private sectionId: string;
  private questionId: string;
  private assessmentId: string;

  private onDelete$ = new EventEmitter<void>();
  private onSave$ = new EventEmitter<void>();

  constructor(private location: Location,
              private assessmentService: AssessmentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private toastService: ToastrService,
              private modalService: NgbModal,
              private router: Router) {
  }

  ngOnInit() {


    const questionIds$: Observable<{ assessmentId: string, sectionId: string, questionId: string }> =
      combineLatest(this.route.parent.paramMap, this.route.paramMap).pipe(
        untilDestroyed(this),
        map(([parentParams, routeParams]) => {
          const assessmentId = parentParams.get('assessmentId');
          const sectionId = routeParams.get('sectionId');
          const questionId = routeParams.get('questionId');
          return {
            assessmentId, sectionId, questionId
          }
        }),
        shareReplay(),
      );

    const currentForm$ = this.form$ = questionIds$.pipe(
      switchMap(ids => {
        if (ids.questionId === 'new') {
          return this.assessmentService.newQuestion();
        }
        return this.assessmentService.getQuestion(ids.assessmentId, ids.questionId);
      }),
      map(q => {
        const form = this.buildForm();
        const answers = form.get('answers') as FormArray;
        q.answers.map(a => this.createAnswerForm()).forEach((control, index) => {
          answers.setControl(index, control)
        });
        form.patchValue(q);
        return form;
      }),
      shareReplay()
    );

    const formChanges$ = currentForm$.pipe(
      untilDestroyed(this),
      switchMap(form => form.valueChanges.pipe(debounceTime(500))),
      withLatestFrom(questionIds$),
      switchMap(([formValues, ids]) => {
        return this.assessmentService.saveQuestion(ids.assessmentId, ids.sectionId, formValues).pipe(
          tap(question => {
            if (!formValues._id) {
              this.router.navigate(['../', question._id], {relativeTo: this.route});
            }
          })
        )
      }),
      retry(),
      shareReplay(),
    );

    formChanges$.subscribe();

    formChanges$.pipe(
      switchMap(() => this.router.events.pipe(
          filter(event => event instanceof NavigationStart),
          take(1),
        )
      ),
      tap(() => {
        this.toastService.success('Risk factor saved!');
      })
    ).subscribe()

    this.onDelete$.pipe(
      switchMap(() => {
        const modal = this.modalService.open(NewModalComponent);
        const component = <NewModalComponent>modal.componentInstance
        component.message = this.confirmationMessage;
        return from(modal.result);
      }),
      filter(result => !!result),
      withLatestFrom(questionIds$),
      switchMap(([_, ids]) => {
        return this.assessmentService.deleteQuestion(ids.assessmentId, ids.sectionId, ids.questionId)
      }),
      tap(() => {
        this.toastService.success('Question deleted!');
        this.router.navigate(['./'], {relativeTo: this.route.parent})
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
  }

  navigateBack() {
    this.location.back();
  }

  getAnswerForm(form: FormGroup): FormArray {
    return form.get('answers') as FormArray
  }

  getAnswerGroups(form: FormGroup): FormGroup[] {
    return this.getAnswerForm(form).controls as FormGroup[]
  }

  addAnswer(form: FormGroup) {
    this.getAnswerForm(form).push(this.createAnswerForm())
  }

  saveQuestion() {
    this.onSave$.emit();
  }

  canDeleteAnswer(form: FormGroup): boolean {
    return this.getAnswerForm(form).controls.length > 2;
  }

  deleteAnswer(form: FormGroup, index: number) {
    this.getAnswerForm(form).removeAt(index);
  }

  deleteQuestion() {
    this.onDelete$.emit();
  }

  addTip(form: FormGroup) {
    this.getTipForm(form).patchValue('');
  }

  removeTip(form: FormGroup) {
    this.getTipForm(form).reset(null)
  }

  getTipForm(form: FormGroup): AbstractControl {
    return form.get('tip');
  }

  hasTip(form: FormGroup): boolean {
    return this.getTipForm(form).value !== null;
  }

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      _id: [''],
      question: ['', Validators.required],
      tip: [null],
      answers: this.formBuilder.array([
      ]),
      policy: this.formBuilder.control(''),
      policySource: this.formBuilder.control('')
    });
  };

  private createAnswerForm(): FormGroup {
    return this.formBuilder.group({
      _id: [''],
      answer: this.formBuilder.control('', Validators.required),
      pointValue: this.formBuilder.control(0, Validators.required),
      scoringBehavior: this.formBuilder.control(null)
    });
  }

  updateAnswer(answerFormGroup: AbstractControl, points: number) {
    const control = <FormControl>answerFormGroup.get('pointValue');
    control.setValue(points);
    control.markAsDirty();
  }

  isScoreBehaviorChecked(controlGroup: AbstractControl, behavior: string) {
    return controlGroup.get('scoringBehavior').value === behavior;
  }

  toggleTriggerLevels(a: AbstractControl, behavior: string, checked: boolean) {
    const value = checked ? behavior : null;
    a.patchValue({
      scoringBehavior: value
    });
    a.markAsDirty();
  }
}
