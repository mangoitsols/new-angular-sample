import {Component, Input, OnInit} from '@angular/core';
import {Aircraft} from "@/_models";
import {AbstractControl, FormControl} from "@angular/forms";
import {FlightField} from "@/_models/flight-field";
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {AircraftTypeaheadAdapter} from "@/typeahead/AircraftTypeaheadAdapter";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {AddAircraftComponent} from "@/components/flight/add-aircraft/add-aircraft.component";

@Component({
  selector: 'app-aircraft-field',
  templateUrl: './aircraft-field.component.html',
  styleUrls: ['./aircraft-field.component.scss'],
  providers: [AircraftTypeaheadAdapter]
})
export class AircraftFieldComponent implements OnInit, FormWidgetInterface {

  @Input() control: AbstractControl;
  @Input() field: FlightField;


  constructor(public adapter: AircraftTypeaheadAdapter,
              private bottomSheet: MatBottomSheet) {
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  ngOnInit() {

  }

  compareAircraft(a1: Aircraft, a2: Aircraft): boolean {
    return a1 && a2 ? a1._id === a2._id : a1 === a2;
  }

  hasErrors() {
    const control = this.control;
    if (control) {
      return control.invalid &&
        (control.dirty || control.touched)
    }
    return false;
  }

  addAircraft() {
    const sheet = this.bottomSheet.open(AddAircraftComponent, {
      panelClass: 'full-width'
    });

    sheet.afterDismissed().subscribe(
      result => {
        if (result) {
          this.control.patchValue(result)
        }
      }
    )
  }
}
