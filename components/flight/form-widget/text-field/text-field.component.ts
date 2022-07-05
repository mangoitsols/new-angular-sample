import {Component, Input, OnInit} from '@angular/core';
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {AbstractControl} from "@angular/forms";
import {FlightField} from "@/_models/flight-field";

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss']
})
export class TextFieldComponent implements OnInit, FormWidgetInterface {
  @Input() control: AbstractControl;
  @Input() field: FlightField;

  constructor() { }

  ngOnInit() {

  }

}
