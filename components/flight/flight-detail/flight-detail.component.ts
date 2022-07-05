import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AssessmentService, FlightService, UserService} from '@/_services';
import {AirportService} from "@/_services/airport.service";
import {AssessmentDto, Flight} from '@/_models';
import {FormControl, Validators} from '@angular/forms';
import {Location} from "@angular/common";
import {untilDestroyed} from "ngx-take-until-destroy";
import {filter, switchMap, take} from "rxjs/operators";
import {combineLatest, from, Observable} from "rxjs";
import {shareReplay, tap} from "rxjs/internal/operators";
import {FlightSetupForm} from "@/components/flight/FlightSetupForm";
import {FlightField} from "@/_models/flight-field";
import {SetupFormFactory} from "@/components/flight/SetupFormFactory";
import {ToastrService} from "ngx-toastr";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NewModalComponent} from "@/components/shared/new-modal/new-modal.component";
import {MatProgressButtonOptions} from "mat-progress-buttons/module/mat-progress-buttons.interface";


enum FlightSetupStep {
  ASSESSMENT = 'assessment',
  DETAILS = 'details'
}

const CREATE_FLIGHT_ID = 'createFlight';

@Component({
  selector: 'flight-detail',
  styleUrls: ['flight-detail.component.scss'],
  templateUrl: 'flight-detail.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FlightDetailComponent implements OnInit, OnDestroy {

  assessments$: Observable<AssessmentDto[]>;
  onboardingTitle: string = "Assessment Details";
  cancelMsg: string = "Cancel";
  cancelAction: Function;
  currentStep: FlightSetupStep;
  steps: FlightSetupStep[] = [];
  stepDefs = FlightSetupStep;
  noAssessments: boolean = false;
  setupForm: FlightSetupForm;
  showConfirmDelete: boolean;
  flight: Flight;

  private loading: boolean = false;
  private flightId: string;
  private assessmentControl: FormControl;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private flightService: FlightService,
              private userService: UserService,
              private airportService: AirportService,
              private assessmentService: AssessmentService,
              private formFactory: SetupFormFactory,
              private toastService: ToastrService,
              private modalService: NgbModal,
  ) {

    this.assessmentControl = new FormControl(null, Validators.required);
  }

  ngOnInit(): void {
    this.flightId = this.route.snapshot.params['flightId'];
    this.flight = this.route.snapshot.data.flight;

    this.setupNavigation(this.flightId);

    this.assessments$ = this.assessmentService.listAssessments().pipe(
      untilDestroyed(this),
      take(1),
      shareReplay()
    );

    combineLatest(this.assessments$, this.assessmentForm.valueChanges).pipe(
      tap(([assessments, selectedId]: [AssessmentDto[], string]) => {
        const selected = assessments.find(asmt => asmt._id === selectedId);
        this.populateDetailsForm(this.flight, selected)
      })
    ).subscribe({complete:() => console.log('zip completed')});

    this.assessments$.pipe(
      tap(assessment => this.populateAssessmentForm(assessment, this.flight))
    ).subscribe();

  }

  private setupNavigation(flightId: string) {
    if (!!flightId && flightId !== CREATE_FLIGHT_ID) {
      this.onboardingTitle = "Edit Assessment Details";
      this.cancelAction = () => this.location.back();
    } else {
      this.cancelMsg = `${this.cancelMsg} Setup`;
      this.cancelAction = () => this.router.navigateByUrl('/flights');
    }
  }

  ngOnDestroy(): void {
  }

  private populateAssessmentForm(assessments: AssessmentDto[], flight: Flight) {

    if (assessments.length === 0) {
      this.noAssessments = true;
      this.cancelMsg = "Back to Flights";
    }

    // If there's only one, select it regardless of it's default setting.
    const initialAssessmentSelection = assessments.find(asmt => asmt.isDefault) ||
      (assessments.length > 0 ? assessments[0] : null);

    if (initialAssessmentSelection && !flight.assessment) {
      this.assessmentForm.patchValue(initialAssessmentSelection._id)
    } else if (typeof flight.assessment === "string") {
      this.assessmentForm.patchValue(flight.assessment)
    } else if (flight.assessment && flight.assessment._id) {
      this.assessmentForm.patchValue(flight.assessment._id)
    }


    /*
      NOTE: We only want to skip the "assessment" step if there's exactly one assessment.
      If there's none, we need this step to show an empty state, if there's more than one,
      we need to show the selector.

      If flight already has assessment, then it can't be changed.
     */
    if (assessments.length === 1 || flight.assessment) {
      this.steps = [
        FlightSetupStep.DETAILS
      ];
    } else {
      this.steps = [
        FlightSetupStep.ASSESSMENT,
        FlightSetupStep.DETAILS
      ];

    }
    this.currentStep = this.steps[0];
  }

  private populateDetailsForm(flight: Flight, assessment: AssessmentDto) {

    const populateParams = {};

    if (flight) {
      Object.assign(populateParams, flight);
    }

    const setupFields = (() => {
      if (flight.fields && flight.fields.length > 0) {
        return flight.fields;
      } else {
        return assessment.settings.formFields.fields;
      }
    })();
    this.setupForm = this.formFactory.buildSetupForm(setupFields);
    this.setupForm.populate(populateParams);
  }

  onFinish() {
    this.loading = true;
    const flight = this.setupForm.getPostData();
    flight.assessment = this.assessmentForm.value;
    flight._id = this.flightId !== CREATE_FLIGHT_ID ? this.flightId : null;

    this.flightService.saveFlight(flight)
      .subscribe({
        next: flight => this.router.navigateByUrl(`flights/${flight._id}/summary`),
        complete:() => this.loading = false,
        error: error => {
          this.toastService.error(error, 'Error saving flight');
          this.loading = false;
        }
      });
  }


  get currentStepIndex(): number {
    return this.steps.indexOf(this.currentStep);
  }

  onStepNext() {
    const stepIndex = this.currentStepIndex;
    this.currentStep = this.steps[stepIndex + 1];
  }

  onStepBack() {
    const stepIndex = this.currentStepIndex;
    this.currentStep = this.steps[stepIndex - 1];
  }

  get canStepBack(): boolean {
    return this.currentStepIndex > 0;
  }

  get assessmentForm(): FormControl {
    return this.assessmentControl
  }

  get isAssessmentSelected(): boolean {
    return this.assessmentForm.valid;
  }

  get canStepNext(): boolean {
    return this.isAssessmentSelected
  }

  get canFinish(): boolean {
    return this.setupForm.valid;
  }

  get canDelete(): boolean {
    return !!(this.flight && this.flight._id);
  }

  getFormControl(field: FlightField) {
    const control = this.setupForm.getFormControl(field.fieldName);
    if (!control) {
      console.error(`Couldn't find control with name ${field.fieldName}`);
    }
    return control;
  }

  deleteFlight() {
    this.showConfirmDelete = true;

    const modal = this.modalService.open(NewModalComponent);
    const instance = modal.componentInstance as NewModalComponent;

    instance.title = 'Delete Assessment';
    instance.message = 'Are you sure you want to delete this assessment';

    instance.btnNegativeText = 'Cancel';
    instance.btnPositiveText = 'Delete';

    from(modal.result).pipe(
      take(1),
      filter(confirm => !!confirm),
      switchMap(_ => this.flightService.deleteFlight(this.flightId)),
      tap(_ =>  {
        this.toastService.success('Assessment deleted successfully.');
        this.router.navigate(['/flights'])
      })
    ).subscribe()
  }

  get saveButtonOptions(): MatProgressButtonOptions {

    return {
      text: 'Save Details',
      customClass: 'btn btn-primary',
      active: this.loading,
      mode: "indeterminate",
      spinnerColor: 'accent',
      spinnerSize: 25,
    }

  }
}

