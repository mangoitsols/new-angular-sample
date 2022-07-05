import {Component, Input, OnInit} from '@angular/core';
import {map, shareReplay} from "rxjs/internal/operators";
import {UserService} from "@/_services";
import {Observable} from "rxjs";
import {UserDm} from "@/_models";
import {AbstractControl, FormControl} from "@angular/forms";
import {AddPilotComponent} from "@/components/flight/add-pilot/add-pilot.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import * as _ from "lodash";
import {FlightField} from "@/_models/flight-field";
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {UserTypeaheadAdapter} from "@/typeahead/UserTypeaheadAdapter";
import UserRoles = UserDm.UserRoles;

@Component({
  selector: 'app-user-field',
  templateUrl: './user-field.component.html',
  styleUrls: ['./user-field.component.scss'],
  providers: [
    UserTypeaheadAdapter
  ]
})
export class UserFieldComponent implements OnInit, FormWidgetInterface {

  @Input() field: FlightField;
  @Input() control: AbstractControl;

  canAddPilot$: Observable<boolean>;
  private currentUser$: Observable<UserDm.UserModel>;

  constructor(private userService: UserService,
              private bottomSheet: MatBottomSheet,
              public adapter: UserTypeaheadAdapter
  ) {
  }

  get formControl() {
    return this.control as FormControl;
  }

  ngOnInit() {

    this.currentUser$ = this.userService.getCurrentUserAsync();

    this.canAddPilot$ = this.currentUser$.pipe(
      map(user => user.hasAtleastRole(UserRoles.Admin)),
      shareReplay()
    );

  }

  addPilot() {
    const sheet = this.bottomSheet.open(AddPilotComponent, {
      panelClass: 'full-width',
    });
    sheet.afterDismissed().subscribe({
      next: (newUser) => {

        if (newUser) {
          this.control.patchValue(newUser);
        }
      }
    })

  }

  comparePilots(p1: UserDm.User, p2: UserDm.User,): boolean {
    if (_.get(p1, '_id') && _.get(p2, '_id')) {
      return p1._id === p2._id;
    }
    if (_.get(p1, 'firstName') && _.get(p2, 'firstName')) {
      return p1.firstName === p2.firstName;
    }
    return p1 === p2;
  }

  hasErrors() {
    const control = this.control;
    if (control) {
      return control.invalid &&
        (control.dirty || control.touched)
    }
    return false;
  }

}
