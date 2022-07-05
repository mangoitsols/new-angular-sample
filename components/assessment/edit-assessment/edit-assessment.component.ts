import {Component, EventEmitter, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Location} from '@angular/common';
import {AssessmentService} from "@/_services";
import {AssessmentDto, FlightAssessmentQuestion, FlightAssessmentSection, iAssessmentSection} from "@/_models";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {FormArray, FormBuilder, Validators} from "@angular/forms";
import {untilDestroyed} from "ngx-take-until-destroy";
import {debounceTime, map, retry, switchMap, tap, throttleTime} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import * as _ from 'lodash';
import {merge, Observable} from "rxjs";
import {filter} from "rxjs/internal/operators";

@Component({
  selector: 'editAssessment',
  templateUrl: './edit-assessment.component.html',
  styleUrls: ['./edit-assessment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditAssessmentComponent implements OnInit, OnDestroy {

  private resetDefaultConfirmed$ = new EventEmitter<void>();
  private onRestoreDefaults$ = new Observable<AssessmentDto>();
  private deleteConfirmed$ = new EventEmitter<void>();
  private sectionPendingDelete: number = -1;
  private saveSuccess: boolean;

  editingQuestion = false;
  reorderingSections: boolean = false;
  assessmentForm: FormArray;
  showConfirmSectionDelete: boolean;
  pendingAction: 'delete' | 'restore' | null = null;

  private formStructureChangeInProgress = false;
  private formStructureChanges$ = new EventEmitter<void>();
  private resetPageState: () => void;
  private addFormSection$ = new EventEmitter<void>();

  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastrService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {

    this.router.events.pipe(
      untilDestroyed(this),
      filter(event => {
        return event instanceof NavigationEnd
      })
    ).subscribe((event: NavigationEnd) => {
      this.editingQuestion = !event.url.endsWith('edit')
    });
    this.editingQuestion = !this.router.url.endsWith('edit')
    const assessmentId = this.route.snapshot.paramMap.get('assessmentId');
    this.assessmentForm = this.formBuilder.array([this.createSectionForm()]);

    this.resetPageState = () => {
      this.router.navigate(['settings', 'assessments', assessmentId, 'edit'])
    }

    const formValueChanges$ = this.assessmentForm.valueChanges.pipe(
    );
    const formStructureChanges$ = this.formStructureChanges$.pipe(
      map(_ => this.assessmentForm.value),
    );

    const formUpdates$ = merge(formValueChanges$, formStructureChanges$).pipe(
      untilDestroyed(this),
      filter(_ => !this.formStructureChangeInProgress),
      debounceTime(500),
      switchMap(formValues => {
        const sections = {assessmentSections: formValues} as AssessmentDto;
        return this.assessmentService.updateAssessment(assessmentId, sections)
      }),
      retry()
    );

    const addFormSection$ = this.addFormSection$.pipe(
      throttleTime(500),
      switchMap(() => {
        const newSection: iAssessmentSection = {
          _id: undefined,
          ordinal: 0,
          questions: [],
          sectionHeading: ''
        };

        const sections =  this.assessmentForm.value as iAssessmentSection[];
        sections.push(newSection);

        return this.assessmentService.updateAssessment(assessmentId, {assessmentSections: sections})
      }),
      retry(),
    )

    const onRestoreDefaults$ = this.resetDefaultConfirmed$.pipe(
      untilDestroyed(this),
      switchMap(_ => this.assessmentService.resetAssessment(assessmentId)),
      tap((data) => {
        this.toastService.success("The form has been successfully reset to the FAA approved IS-BAO defaults.");
        this.resetPageState();
      }),
      map((data) => data),
      retry(),
    );

    const onClearAssessment$ = this.deleteConfirmed$.pipe(
      untilDestroyed(this),
      switchMap(_ => {
        return this.assessmentService.updateAssessment(assessmentId, {assessmentSections: []});
      }),
      tap(() => {
        this.resetPageState();
      }),
      retry(),
    )

    const questionUpdates$ = this.assessmentService.questionUpdates.pipe(
      untilDestroyed(this),
      filter(changes => changes.assessmentId === assessmentId),
      switchMap(changes =>
        this.assessmentService.getAssessment(assessmentId)
      )
    )

    merge(
      this.assessmentService.getAssessment(assessmentId),
      questionUpdates$,
      onRestoreDefaults$,
      onClearAssessment$,
      addFormSection$,
    ).pipe(
      untilDestroyed(this),
      tap(data => {
        this.formStructureChangeInProgress = true;
        this.removeAllControls();
        data.assessmentSections.map(section => this.createSectionForm(section)).forEach((sectionForm, index) => {
          this.assessmentForm.setControl(index, sectionForm)
        });
        this.formStructureChangeInProgress = false;
      }),
    ).subscribe();

    formUpdates$.subscribe();
  }

  ngOnDestroy(): void {
    if (this.saveSuccess) {
      this.toastService.success("Assessment changes saved successfully.");
    }
  }

  navigateBack() {
    this.location.back();
  }

  saveAndClose() {
    this.router.navigate(['/account'], {});
  }

  addSection() {
    this.addFormSection$.emit();
  }

  deleteSection(index: number) {
    this.showConfirmSectionDelete = true;
    this.sectionPendingDelete = index;
  }

  confirmDeleteSection(confirm: boolean) {
    if (confirm) {
      this.assessmentForm.removeAt(this.sectionPendingDelete);
    }
    this.sectionPendingDelete = -1;
    this.showConfirmSectionDelete = false;
  }

  reorderSections() {
    this.reorderingSections = true;
    this.router.navigate(['settings', 'assessments', this.route.snapshot.paramMap.get('assessmentId'), 'edit']);
  }

  closeReorder() {
    this.reorderingSections = false;
  }

  dropQuestion(sectionId: number, event: CdkDragDrop<FlightAssessmentQuestion[]>) {

    this.transactFormChange(() => {
      if (event.container === event.previousContainer) {
        const section = this.assessmentForm.at(sectionId).value;
        moveItemInArray(section.questions, event.previousIndex, event.currentIndex);
        this.assessmentForm.at(sectionId).patchValue(section);
      } else { // move question between sections
        const srcSectionIndex = parseInt(event.previousContainer.id, 10);
        const destSectionIndex = parseInt(event.container.id, 10);
        const srcSection = this.assessmentForm.at(srcSectionIndex).value as FlightAssessmentSection;
        const destSection = this.assessmentForm.at(destSectionIndex).value as FlightAssessmentSection;

        const question = srcSection.questions[event.previousIndex];
        srcSection.questions.splice(event.previousIndex, 1);
        this.assessmentForm.at(srcSectionIndex).patchValue(srcSection)

        destSection.questions.splice(event.currentIndex, 0, question);
        this.assessmentForm.at(destSectionIndex).patchValue(destSection);
      }
    });
  }

  dropSection(event: CdkDragDrop<FlightAssessmentSection>) {
    this.transactFormChange(() => {
      const droppedSection = this.assessmentForm.at(event.previousIndex);
      const replacedSection = this.assessmentForm.at(event.currentIndex);
      this.assessmentForm.setControl(event.currentIndex, droppedSection);
      this.assessmentForm.setControl(event.previousIndex, replacedSection);
    })
  }

  get sectionWarningMessage() {
    return '<p>Deleting a section will also delete all the questions within it.</p>' + '<p><b>This action cannot be undone</b>.</p>' + '<p>Are you sure you want to continue?<p>';
  }

  restoreDefault() {
    this.pendingAction = 'restore';
  }

  deleteAssessment() {
    this.pendingAction = 'delete';
  }

  confirmDeleteFrat(confirm: boolean) {
    if (confirm) {
      if (this.pendingAction === 'delete') {
        this.deleteConfirmed$.emit();
      } else if (this.pendingAction === 'restore') {
        this.resetDefaultConfirmed$.emit();
      }
    }
    this.pendingAction = null;
  }

  get deleteFratWarning(): string {
    if (this.pendingAction === 'delete') {
      return '<p>Are you sure you want to remove all sections and questions?</p>' +
        '<p>Your crew will not be able to use this assessment until you add questions.</p>'
    } else if (this.pendingAction === 'restore') {
      return '<p>Are you sure you want to restore the assessment to the FAA default?</p>' +
        '<p>This action will wipe out any custom questions.</p>';
    }
    return null;
  }

  private removeAllControls() {
    _.forEachRight(this.assessmentForm.controls, (control, index) => {
      this.assessmentForm.removeAt(index);
    });
  }


  private createSectionForm(section?: iAssessmentSection) {
    const controls = {
      sectionHeading: [_.get(section, 'sectionHeading', ''), Validators.required],
      questions: [_.get(section, 'questions', [])]
    };

    if (section && section._id) {
      Object.assign(controls, {_id: [_.get(section, '_id', null)]});
    }

    return this.formBuilder.group(controls);
  }

  private transactFormChange(change: () => void) {
    this.formStructureChangeInProgress = true;
    change();
    this.formStructureChangeInProgress = false;
    this.formStructureChanges$.emit();
  }

}
