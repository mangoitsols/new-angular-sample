import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AircraftComponent} from "@/components/aircraft/aircraft.component";
import {EditAircraftComponent} from "@/components/aircraft/edit-aircraft/edit-aircraft.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavbarModule} from "@/components/navbar/navbar.module";
import {RouterModule, Routes} from "@angular/router";
import {SharedComponentsModule} from "@/components/shared/shared-components.module";
import {AircraftUploadFormComponent} from "@/components/aircraft/aircraft-upload-form/aircraft-upload-form.component";

const ROUTES: Routes = [
  {
    path: '',
    component: AircraftComponent,
  },
  {
    path: 'add',
    component: EditAircraftComponent,
  },
  {
    path: 'add/upload',
    component: AircraftUploadFormComponent,
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: EditAircraftComponent
  }
]
@NgModule({
  declarations: [
    AircraftComponent,
    EditAircraftComponent,
    AircraftUploadFormComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NavbarModule,
    RouterModule,
    CommonModule,
    SharedComponentsModule,
    RouterModule.forChild(ROUTES),
  ]
})
export class AircraftModule { }
