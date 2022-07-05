import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {FlightListComponent} from "@/components/flight/flight-list";
import {FlightDetailComponent} from "@/components/flight/flight-detail";
import {FlightSummaryComponent} from "@/components/flight/flight-summary"
import {EditFlightResolver} from "@/resolver/EditFlightResolver";

export const ROUTES: Routes = [
  {path: ``, component: FlightListComponent},
  {
    path: `:flightId`,
    component: FlightDetailComponent,
    resolve: {
      flight: EditFlightResolver
    }
  },
  {path: `:flightId/summary`, component: FlightSummaryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class FlightRoutingModule {
}
