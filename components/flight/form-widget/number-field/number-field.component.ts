import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl} from "@angular/forms";
import {FlightField} from "@/_models/flight-field";
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.scss']
})
export class NumberFieldComponent implements OnInit, FormWidgetInterface{
  @Input() control: AbstractControl;
  @Input() field: FlightField;
  constructor() { }

  ngOnInit() {
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  hasErrors() {
    return this.control.errors && (this.control.touched || this.control.dirty);
  }

  get firstError() {
    return Object.values(this.control.errors).shift();
  }
}
