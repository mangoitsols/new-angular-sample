import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {AbstractControl, FormControl} from "@angular/forms";
import {AssessmentFieldType, FlightField} from "@/_models/flight-field";
import {FlightSetupForm} from "@/components/flight/FlightSetupForm";
import {shareReplay, startWith, tap} from "rxjs/operators";
import {untilDestroyed} from "ngx-take-until-destroy";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/internal/operators";

@Component({
  selector: 'app-assigned-to-field',
  templateUrl: './assigned-to-field.component.html',
  styleUrls: ['./assigned-to-field.component.scss']
})
export class AssignedToFieldComponent implements OnInit, OnDestroy, FormWidgetInterface {

  @Input() control: AbstractControl;
  @Input() field: FlightField;
  @Input() context: FlightSetupForm;

  isDisabled$: Observable<boolean>
  constructor() { }

  ngOnInit() {

    const userFieldControls = this.userFields.map(field => this.context.getFormControl(field.fieldName));
    const changeObservables$: Observable<any>[] = userFieldControls.map(control =>
      control.valueChanges.pipe(
        untilDestroyed(this),
        startWith(control.value)
      )
    );
    this.isDisabled$ = combineLatest(changeObservables$).pipe(
      map((values) => values.filter(v => !!v).length < 2),
      tap(disabled => {
        if (disabled) {
          this.control.disable();
          const resetValue = this.context.getFormControl('pic').value;
          this.control.patchValue(resetValue);
        } else {
          this.control.enable()
        }
      }),
      shareReplay()
    );

  }

  ngOnDestroy(): void {
  }

  get userFields() {
    return this.field.dependsOn.filter(f => f.fieldType === AssessmentFieldType.USER);
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  controlValue(field: FlightField) {
    const control = this.context.getFormControl(field.fieldName);
    return control.value;
  }

  isSelected(field: FlightField) {
    const selectedUser = this.formControl.value;
    const fieldValue = this.context.getFormControl(field.fieldName);

    return selectedUser && fieldValue && (selectedUser._id === fieldValue.value._id);
  }

}
