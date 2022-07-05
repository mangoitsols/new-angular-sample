import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl} from "@angular/forms";
import {AddAirportComponent} from "@/components/flight/add-airport/add-airport.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {FlightField} from "@/_models/flight-field";

@Component({
  selector: 'app-airport-field',
  templateUrl: './airport-field.component.html',
  styleUrls: ['./airport-field.component.scss']
})
export class AirportFieldComponent implements OnInit, FormWidgetInterface {

  @Input() control: AbstractControl
  @Input() field: FlightField;

  constructor(
    private bottomSheet: MatBottomSheet,
  ) {
  }

  ngOnInit() {
  }

  createAirport() {
    const sheet = this.bottomSheet.open(AddAirportComponent, {
      panelClass: 'full-width'
    });

    sheet.afterDismissed().subscribe({
      next: (value) => {
        if (value && value.icao_code) {
          value.icao_code = value.icao_code.toUpperCase();
          this.control.patchValue(value);
        }
      }
    });
  }


}
