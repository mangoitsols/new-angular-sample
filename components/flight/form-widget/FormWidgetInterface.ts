import {FlightField} from "@/_models/flight-field";
import {AbstractControl} from "@angular/forms";
import {FlightSetupForm} from "@/components/flight/FlightSetupForm";


export interface FormWidgetInterface {
  field: FlightField;
  control: AbstractControl;
  context?: FlightSetupForm;
}
