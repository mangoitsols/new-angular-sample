import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {AircraftService} from "@/_services";

@Component({
  selector: 'app-add-aircraft',
  templateUrl: './add-aircraft.component.html',
  styleUrls: ['./add-aircraft.component.scss']
})
export class AddAircraftComponent implements OnInit {

  readonly form: FormGroup;

  constructor(private fb: FormBuilder,
              private aircraftService: AircraftService,
              private bottomSheetRef: MatBottomSheetRef<AddAircraftComponent>) {

    this.form = fb.group({
      designation: ['', Validators.required],
      type: ['']
    })
  }

  ngOnInit() {
  }

  cancel() {
    this.bottomSheetRef.dismiss(null);
  }

  submit() {
    this.aircraftService.addAircraft(this.form.value).subscribe(
      result => {
        this.bottomSheetRef.dismiss(result);
      }
    )
  }

}
