import {Component, EventEmitter, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EMPTY, from, Observable} from "rxjs";
import {Aircraft, AssessmentDto} from "@/_models";
import {AircraftService, AssessmentService} from "@/_services";
import {filter, map, retry, shareReplay, switchMap, tap, throttleTime} from "rxjs/operators";
import {Location} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NewModalComponent} from "@/components/shared/new-modal/new-modal.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as _ from "lodash";

enum Titles {
  add = 'Add Aircraft',
  edit = 'Edit Aircraft'
}

enum Subtitles {
  add =  'Enter Aircraft Details',
  edit = 'Update Aircraft Details'
}
enum ButtonCta {
  add = 'Add Aircraft',
  edit = 'Save'
}

enum SuccessMessage {
  add = 'Aircraft added successfully',
  edit = 'Aircraft updated successfully'
}

@Component({
  selector: 'app-edit-aircraft',
  templateUrl: './edit-aircraft.component.html',
  styleUrls: ['../aircraft.component.scss']
})
export class EditAircraftComponent implements OnInit {

  aircraft$: Observable<Aircraft>;
  mode: 'add' | 'edit' = 'edit';
  aircraftForm: FormGroup;

  private onSaveClick = new EventEmitter<void>();
  assessments$: Observable<AssessmentDto[]>;

  constructor(private activeRoute: ActivatedRoute,
              private router: Router,
              private aircraftService: AircraftService,
              private toastService: ToastrService,
              private location: Location,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              private assessmentService: AssessmentService) {

    this.aircraftForm = this.formBuilder.group({
      _id: this.formBuilder.control(null),
      designation: this.formBuilder.control('', Validators.required),
      type: this.formBuilder.control('', Validators.required),
      defaultAssessment: this.formBuilder.control(null)
    });
  }

  ngOnInit() {
    const id = this.activeRoute.snapshot.params['id'];
    if (!id) {
      this.mode = 'add';
      this.aircraft$ = EMPTY;
    } else {
      this.aircraft$ = this.aircraftService.getAircraft(id).pipe(
        tap(aircraft => {
          const {defaultAssessment, ...rest} = aircraft;
          this.aircraftForm.patchValue({
            defaultAssessment: _.get(defaultAssessment, '_id', null),
            ...rest,
          })
        }),
        shareReplay()
      );
    }

    this.assessments$ = this.assessmentService.listAssessments().pipe(
      shareReplay()
    )

    this.onSaveClick.pipe(
      throttleTime(1000),
      filter(_ => this.aircraftForm.valid),
      map(_ => this.aircraftForm.value as Aircraft),
      switchMap((value: Aircraft) => {
        if (value._id) {
          return this.aircraftService.updateAircraft(value);
        }
        return this.aircraftService.addAircraft(value);
      }),
      retry(),
      shareReplay(),
      map(_ => {
        switch(this.mode) {
          case "add":
            return SuccessMessage.add
          default:
            return SuccessMessage.edit
        }
      }),
      tap(message => {
        this.toastService.success(message);
        this.navigateBack();
      }),
    ).subscribe();

    this.aircraft$.subscribe();
  }

  navigateBack() {
    this.location.back();
  }

  onDeleteClicked() {
    const modal = this.modalService.open(NewModalComponent);
    const component = modal.componentInstance as NewModalComponent;
    component.btnPositiveText = 'Delete';
    component.btnNegativeText = 'Cancel'
    component.message = 'Are you sure you want to delete this aircraft?';

    from(modal.result).pipe(
      filter(result => !!result),
      switchMap(_ => this.aircraft$),
      switchMap(aircraft => this.aircraftService.deleteAircraft(aircraft)),
      tap({
        next: (_) => {
          this.toastService.success('Aircraft deleted!');
          this.navigateBack();
        },
        error: err => this.toastService.error('An error occurred!')
      })
    ).subscribe()
  }

  get title(): string {
    return Titles[this.mode]
  }

  get buttonCta(): string {
    return ButtonCta[this.mode];
  }

  get subtitle(): string {
    return Subtitles[this.mode];
  }

  hasDesignationError() {
    const control = this.aircraftForm.get('designation');
    return !control.valid && (control.touched || control.dirty);
  }

  hasTypeError() {
    const control = this.aircraftForm.get('type');
    return !control.valid && (control.touched || control.dirty);
  }

  isFormValid() {
    return this.aircraftForm.valid;
  }

  save() {
    this.onSaveClick.emit();
  }

  handleExitClick() {
    this.navigateBack();
  }
}
