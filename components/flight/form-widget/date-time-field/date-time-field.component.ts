import {Component, Input, OnInit} from '@angular/core';
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {AbstractControl} from "@angular/forms";
import {FlightField} from "@/_models/flight-field";

@Component({
  selector: 'app-date-time-field',
  templateUrl: './date-time-field.component.html',
  styleUrls: ['./date-time-field.component.scss']
})
export class DateTimeFieldComponent implements OnInit, FormWidgetInterface{
  @Input() control: AbstractControl;
  @Input() field: FlightField;

  constructor() { }

  ngOnInit() {


  }


  hasErrors(controlName: string) {
    const control = this.control.get(controlName);
    if (control) {
      return control.invalid &&
        (control.dirty || control.touched)
    }
    return false;
  }
}
