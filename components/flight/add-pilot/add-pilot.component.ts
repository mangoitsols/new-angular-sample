import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserDm} from "@/_models";
import {RolePermissionsService, UserService} from "@/_services";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-add-pilot',
  templateUrl: './add-pilot.component.html',
  styleUrls: ['./add-pilot.component.scss']
})
export class AddPilotComponent implements OnInit {
  pilotForm: FormGroup;

  roleDefinitions: UserDm.UserRoleSpec[] = [];


  constructor(private fb: FormBuilder,
              private rolePermissionsService: RolePermissionsService,
              private userService: UserService,
              private bottomSheetRef: MatBottomSheetRef<AddPilotComponent>) {

    this.pilotForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.email],
      assignedRole: [UserDm.UserRoles.Pilot, Validators.required]
    });
  }

  ngOnInit() {
    this.userService.getCurrentUserAsync().subscribe((user) => {
      const userRole = this.rolePermissionsService.getRoleDefinition(user.role);
      this.roleDefinitions = this.rolePermissionsService.getRolesForUi(userRole);
    })
  }

  roleDescription(): string {
    const roleKey = this.pilotForm && this.pilotForm.get('assignedRole').value;
    if (!roleKey) {
      return '';
    }
    const role = this.rolePermissionsService.getRoleDefinition(roleKey);
    return role.description;
  }

  sendInvite() {
    this.userService.invite(this.pilotForm.value).subscribe((user) => {
      this.bottomSheetRef.dismiss(user)
    });
  }

  cancel() {
    this.bottomSheetRef.dismiss();
  }
}
