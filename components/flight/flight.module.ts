import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlightListComponent} from '@/components/flight/flight-list';
import {FlightRoutingModule} from './flight.routes';
import {FlightDetailComponent} from '@/components/flight/flight-detail';
import {DateFormatPipe} from '@/_pipes/date-format.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WizardStepComponent} from '../wizard/wizard-step.component';
import {WizardComponent} from '../wizard/wizard.component';
import {FratModule} from '../frat/frat.module';
import {FlightSummaryComponent} from '@/components/flight/flight-summary';
import {FlightCardComponent} from './shared/flight-card.component';
import {FlightListFirstRunComponent} from './flight-list/flight-list-first-run.component';
import {NavbarModule} from '../navbar/navbar.module';
import {MatInputModule, MatNativeDateModule} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {EmptyStateTransform} from "@/_pipes/empty-state";
import {NgbModule, NgbTimepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedComponentsModule} from "@/components/shared/shared-components.module";
import {AngularStickyThingsModule} from "@w11k/angular-sticky-things";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {SettingsModule} from "@/components/settings/settings.module";
import {FlightDetailAssessmentComponent} from './flight-detail/flight-detail-assessment/flight-detail-assessment.component';
import {AddAirportComponent} from "@/components/flight/add-airport/add-airport.component";
import { AddPilotComponent } from './add-pilot/add-pilot.component';
import { AirportFieldComponent } from './form-widget/airport-field/airport-field.component';
import { UserFieldComponent } from './form-widget/user-field/user-field.component';
import { DateTimeFieldComponent } from './form-widget/date-time-field/date-time-field.component';
import { AircraftFieldComponent } from './form-widget/aircraft-field/aircraft-field.component';
import { TextFieldComponent } from './form-widget/text-field/text-field.component';
import { AssignedToFieldComponent } from './form-widget/assigned-to-field/assigned-to-field.component';
import { FormWidgetDirective } from './form-widget/form-widget.directive';
import {FieldValuePipe} from "@/_pipes/field-value.pipe";
import { AddAircraftComponent } from './add-aircraft/add-aircraft.component';
import { NumberFieldComponent } from './form-widget/number-field/number-field.component';
import {MatProgressButtonsModule} from "mat-progress-buttons";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NavbarModule,
        FlightRoutingModule,
        FratModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        NgbModule,
        NgbTimepickerModule,
        SharedComponentsModule,
        AngularStickyThingsModule,
        ScrollingModule,
        InfiniteScrollModule,
        SettingsModule,
        MatProgressButtonsModule,
    ],
  declarations: [
    DateFormatPipe,
    FlightListComponent,
    FlightListFirstRunComponent,
    FlightDetailComponent,
    FlightSummaryComponent,
    WizardStepComponent,
    WizardComponent,
    FlightCardComponent,
    EmptyStateTransform,
    FlightDetailAssessmentComponent,
    AddAirportComponent,
    AddPilotComponent,
    AirportFieldComponent,
    UserFieldComponent,
    DateTimeFieldComponent,
    AircraftFieldComponent,
    TextFieldComponent,
    AssignedToFieldComponent,
    FormWidgetDirective,
    FieldValuePipe,
    AddAircraftComponent,
    NumberFieldComponent
  ],
  exports: [],
  entryComponents: [
    AddAirportComponent,
    AddPilotComponent,
    AircraftFieldComponent,
    AirportFieldComponent,
    AssignedToFieldComponent,
    DateTimeFieldComponent,
    TextFieldComponent,
    UserFieldComponent,
    AddAircraftComponent,
    NumberFieldComponent,
  ]
})
export class FlightModule {
}
