import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {debounceTime, map, shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {AssessmentService} from "@/_services";
import {filter} from "rxjs/internal/operators";
import {untilDestroyed} from "ngx-take-until-destroy";
import {AssessmentDto} from "@/_models";
import {from, merge, Observable, of} from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NewModalComponent} from "@/components/shared/new-modal/new-modal.component";
import {ToastrService} from "ngx-toastr";
import {AddonFeature} from "@/_models/addon-features";
import {AddonFeatureService} from "@/_services/addon-feature.service";

@Component({
  selector: 'app-manage-assessment',
  templateUrl: './manage-assessment.component.html',
  styleUrls: ['./manage-assessment.component.scss']
})
export class ManageAssessmentComponent implements OnInit, OnDestroy {

  addonFeature = AddonFeature.multipleAssessments;

  menuItems$: Observable<AssessmentMenuItem[]>;
  managementForm: FormGroup;
  editTitle = false;
  private onOverrideSettingChanged$ = new EventEmitter<{
    settingPath: string,
    enabled: boolean,
  }>();

  private assessment$: Observable<AssessmentDto>;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private assessmentService: AssessmentService,
              private modalService: NgbModal,
              private router: Router,
              private toastService: ToastrService,
              private addonFeatureService: AddonFeatureService) {
  }

  ngOnInit() {
    this.managementForm = this.buildManagementForm();

    const assessmentId$ = this.route.paramMap.pipe(
      map(params => params.get('assessmentId')),
    );

    this.assessment$ = assessmentId$.pipe(
      switchMap(id => this.assessmentService.getAssessment(id)),
      tap({
        next: (assessment: AssessmentDto) => {
          this.managementForm.patchValue({
            title: assessment.title,
            isDefault: assessment.isDefault,
          }, {emitEvent: false});
        },
        error: (error) => {
          this.toastService.error('Error loading assessment');
        }
      }),
      shareReplay()
    );

    const settingsUpdates$: Observable<Partial<AssessmentDto>> = this.onOverrideSettingChanged$.pipe(
      withLatestFrom(this.assessment$),
      map(([changes, assessment]) => {
        return {
          _id: assessment._id,
          settings: {
            [changes.settingPath]: changes.enabled
          }
        };
      }),
    );

    const assessmentUpdates$: Observable<Partial<AssessmentDto>> = this.managementForm.valueChanges.pipe(
      debounceTime(1000),
      filter(_ => this.managementForm.valid),
      withLatestFrom(this.assessment$),
      map(([changes, assessment]) => Object.assign({}, {_id: assessment._id}, changes))
    );

    const onUpdate$ = merge(settingsUpdates$, assessmentUpdates$).pipe(
      untilDestroyed(this),
      switchMap(assessment => this.assessmentService.updateAssessment(assessment._id, assessment)),
      shareReplay(),
    );

    const hasAddonEnabled$ = this.addonFeatureService.hasAddonFeature(this.addonFeature).pipe(
      untilDestroyed(this),
      shareReplay(),
    )

    this.menuItems$ = merge(this.assessment$, onUpdate$).pipe(
      withLatestFrom(hasAddonEnabled$),
      map(([assessment, addonEnabled]: [AssessmentDto, boolean]) => {
        return buildMenuItems(assessment, addonEnabled);
      }),
      shareReplay(),
    )

  }

  ngOnDestroy(): void {
  }

  get titleFormControl(): FormControl {
    return this.managementForm.get('title') as FormControl;
  }

  get defaultAssessmentFormControl(): FormControl {
    return this.managementForm.get('isDefault') as FormControl;
  }

  get disableDefaultSelectionControl(): boolean {
    return this.defaultAssessmentFormControl.value
  }

  get titleFormInvalid(): boolean {
    return this.titleFormControl.invalid;
  }

  private buildManagementForm() {
    return this.fb.group({
      title: ['', Validators.required],
      isDefault: [{value: false, disabled: false}],
    })
  }

  toggleEditTitle() {
    this.editTitle = !this.editTitle;
  }

  overrideGlobalSettingsChanged(newValue: boolean, item: AssessmentMenuItem) {
    this.onOverrideSettingChanged$.emit({
      settingPath: item.settingPath,
      enabled: newValue,
    })
  }

  deleteAssessment() {

    of('arbitrary value').pipe(
      withLatestFrom(this.assessment$),
      map(([_, assessment]) => assessment),
      switchMap((assessment: AssessmentDto) => {
        const modal = this.modalService.open(NewModalComponent);
        const component = (<NewModalComponent>modal.componentInstance);
        component.message = `
        Are you sure you want to delete ${assessment.title}? <br> <b>This action cannot be undone.</b>
        `;

        return from(modal.result).pipe(
          filter(confirmDelete => !!confirmDelete),
          map(() => assessment)
        );
      }),
      switchMap((assessment: AssessmentDto) => {
        return this.assessmentService.deleteAssessment(assessment._id).pipe(
          tap(_ => {
            this.toastService.success(`${assessment.title} deleted`);
          }),
          switchMap(() => this.assessmentService.listAssessments())
        )
      }),
      tap({
        next: (assessments: AssessmentDto[]) => {
          const redirectToAssessment = assessments[0];
          this.router.navigate(['../', redirectToAssessment._id], {relativeTo: this.route})
        },
        error: (error) => {
          this.toastService.error(error);
        }
      }),
      untilDestroyed(this),
    ).subscribe()
  }

  trackItem(index: number, menuItem: AssessmentMenuItem) : string{
    return menuItem.title;
  }

  get canDelete(): boolean {
    return !this.managementForm.get('isDefault').value;
  }

  showDeleteWarning() {
    const modal = this.modalService.open(NewModalComponent);
    const component = <NewModalComponent>modal.componentInstance;
    component.title = 'Action Not Permitted'
    component.message = '<b>The default form cannot be deleted.</b></br>If you want to delete this form, select another form to be the default, then come back to delete this form.'
    component.btnNegativeText = null;
    component.btnPositiveText = "Okay";
  }
}

function buildMenuItems(assessment: AssessmentDto, addonEnabled: boolean): AssessmentMenuItem[] {


  const isSettingClickable = (assessment: AssessmentDto, settingName): boolean => {
    if (!addonEnabled) {
      return true;
    }
    return assessment.settings &&
      assessment.settings[settingName] &&
      assessment.settings[settingName].belongsToType === 'Assessment';
  }

  const items: AssessmentMenuItem[] = [
    {
      title: 'Risk Tolerance',
      subtitle: 'Determine the risk thresholds that match your department’s tolerance.',
      icon: '/assets/img/illustration_risk-tolerance.svg',
      link: {
        routerLink: ['preferences', 'risk-tolerance', assessment.settings.riskTolerancePolicy._id],
        text: 'Manage Tolerance'
      },
      isClickable: isSettingClickable(assessment, 'riskTolerancePolicy'),
      settingPath: 'riskTolerancePolicy'
    },
    {
      title: 'Mitigation Policies',
      subtitle: 'Set up mitigation requirements and the display of custom procedures.',
      icon: '/assets/img/illustration_mitigation-policies.svg',
      link: {
        routerLink: ['preferences', 'mitigation-policy', assessment.settings.mitigationPolicy._id],
        text: 'Manage Policies'
      },
      isClickable: isSettingClickable(assessment, 'mitigationPolicy'),
      settingPath: 'mitigationPolicy'
    },
    {
      title: 'Report Recipients',
      subtitle: 'Specify who should receive different threshold risk report emails.',
      icon: '/assets/img/illustration_risk-notifications.svg',
      link: {
        routerLink: ['preferences', 'risk-report-alert-group', assessment.settings.riskReportAlertGroup._id],
        text: 'Manage Recipients'
      },
      isClickable: isSettingClickable(assessment, 'riskReportAlertGroup'),
      settingPath: 'riskReportAlertGroup',
    },
    {
      title: 'Report Rules',
      subtitle: 'Set rules that determine what reports are sent and when.',
      icon: '/assets/img/illustration_notification-policies.svg',
      link: {
        routerLink: ['preferences', 'risk-alerts', assessment.settings.riskAlertConfig._id],
        text: 'Manage Rules'
      },
      isClickable: isSettingClickable(assessment, 'riskAlertConfig'),
      settingPath: 'riskAlertConfig'
    },
    {
      title: 'Assignment Alerts',
      subtitle: 'Determine when pilots are notified of an assigned assessment.',
      icon: '/assets/img/illustration_assignment-alerts.svg',
      link: {
        routerLink: ['preferences', 'flight-alerts', assessment.settings.flightAlertConfig._id],
        text: 'Manage Alerts'
      },
      isClickable: isSettingClickable(assessment, 'flightAlertConfig'),
      settingPath: 'flightAlertConfig'
    },

    {
      title: 'Form Requirements',
      subtitle: 'Configure the input fields used to create assessments.',
      icon: '/assets/img/illustration_setup-data.svg',
      link: {
        routerLink: ['preferences', 'fields', assessment.settings.formFields._id],
        text: 'Manage Requirements'
      },
      isClickable: isSettingClickable(assessment, 'formFields'),
      settingPath: 'formFields'
    }
  ]

  if (addonEnabled) {
    items.unshift(    {
      title: 'Pilot Access',
      subtitle: 'Select which users should be able to view and take this risk assessment.',
      icon: '/assets/img/illustration_pilot-access.svg',
      infoLabel: assessment.accessControl.allowAll ? 'Access: Open' : 'Access: Restricted',
      checkboxText: 'Restrict Pilot Access',
      link: {
        routerLink: ['access'],
        text: 'Manage Access',
      },
      alwaysClickable: true,
      settingPath: 'pilotAccess',
    });

  }

  return items;
}


interface AssessmentMenuItem {

  title: string;
  subtitle: string;
  infoLabel?: string;
  icon: string;
  checkboxText?: string;
  link: {
    text: string;
    routerLink: any[];
  }
  isClickable?: boolean;
  alwaysClickable?: boolean;
  settingPath?: string;
}
