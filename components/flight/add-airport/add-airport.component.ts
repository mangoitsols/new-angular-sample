import {Component, Injectable, OnInit} from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {Observable, of} from "rxjs";
import {AirportService} from "@/_services/airport.service";
import {catchError, map} from "rxjs/internal/operators";

@Component({
  selector: 'app-add-airport',
  templateUrl: './add-airport.component.html',
  styleUrls: ['./add-airport.component.scss']
})
export class AddAirportComponent implements OnInit {

  airportForm: FormGroup;

  constructor(fb: FormBuilder,
              private _bottomSheetRef: MatBottomSheetRef<AddAirportComponent>,
              private airportService: AirportService) {

    const airportValidator = this.validateAirport.bind(this);
    this.airportForm = fb.group({
      icao_code: fb.control('', {
        validators: [Validators.required, Validators.maxLength(4)],
        asyncValidators: [airportValidator],
        updateOn: 'blur'
      }),
      city: ['']
    })
  }

  ngOnInit() {

  }

  cancel() {
    this._bottomSheetRef.dismiss()
  }

  save() {
    this._bottomSheetRef.dismiss(this.airportForm.value)
  }

  get icaoControl(): FormControl {
    return this.airportForm.get('icao_code') as FormControl;
  }

  validateAirport(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.airportService.findAirportByIcaoCode(control.value).pipe(
      map(airport => ({unique_icao: 'Airport Identifier is already in use.'})),
      catchError(error => of(null)) // no validation error if airport not found
    );
  }
}

