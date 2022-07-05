import {ComponentFactoryResolver, Directive, Input, OnInit, Type, ViewContainerRef} from '@angular/core';
import {TextFieldComponent} from "@/components/flight/form-widget/text-field/text-field.component";
import {DateTimeFieldComponent} from "@/components/flight/form-widget/date-time-field/date-time-field.component";
import {UserFieldComponent} from "@/components/flight/form-widget/user-field/user-field.component";
import {AircraftFieldComponent} from "@/components/flight/form-widget/aircraft-field/aircraft-field.component";
import {AirportFieldComponent} from "@/components/flight/form-widget/airport-field/airport-field.component";
import {AssignedToFieldComponent} from "@/components/flight/form-widget/assigned-to-field/assigned-to-field.component";
import {AssessmentFieldType, FlightField} from "@/_models/flight-field";
import {AbstractControl} from "@angular/forms";
import {FormWidgetInterface} from "@/components/flight/form-widget/FormWidgetInterface";
import {FlightSetupForm} from "@/components/flight/FlightSetupForm";
import {NumberFieldComponent} from "@/components/flight/form-widget/number-field/number-field.component";

@Directive({
  selector: '[form-widget]'
})
export class FormWidgetDirective implements OnInit, FormWidgetInterface{

  @Input() field: FlightField;
  @Input() control: AbstractControl;
  @Input() context: FlightSetupForm;

  constructor(
    public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit(): void {

    //@ts-ignore
    const widgetType = getWidgetType(this.field.fieldType);
    if (!widgetType) {
      console.error(`Unknown field widget type: ${this.field.fieldType}`)
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widgetType);
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<FormWidgetInterface>componentRef.instance).control = this.control;
    (<FormWidgetInterface>componentRef.instance).field = this.field;
    (<FormWidgetInterface>componentRef.instance).context = this.context;
  }


}

function getWidgetType(type: keyof typeof AssessmentFieldType): Type<FormWidgetInterface> {

  const descriptions = {
    [AssessmentFieldType.TEXT]: TextFieldComponent,
    [AssessmentFieldType.DATE_AND_TIME]: DateTimeFieldComponent,
    [AssessmentFieldType.USER]: UserFieldComponent,
    [AssessmentFieldType.AIRCRAFT]: AircraftFieldComponent,
    [AssessmentFieldType.AIRPORT]: AirportFieldComponent,
    [AssessmentFieldType.ASSIGNED_TO]: AssignedToFieldComponent,
    [AssessmentFieldType.NUMBER]: NumberFieldComponent,
  };

  return descriptions[type];
}
