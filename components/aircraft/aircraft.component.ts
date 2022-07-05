import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {AircraftService} from '@/_services';
import {Aircraft} from '@/_models';
import {listAnimations} from "@/_utility/animations";
import {Observable} from "rxjs";
import {shareReplay, switchMap} from "rxjs/operators";
import {FilterMenuProxy} from "@/components/shared/unified-filter-menu/filter-menu-proxy";
import {AircraftFilterSourceProvider} from "@/filters/filter-providers";
import {UnifiedFilterMenuComponent} from "@/components/shared/unified-filter-menu/unified-filter-menu.component";

@Component({
  selector: 'aircraft',
  templateUrl: './aircraft.component.html',
  styleUrls: ['./aircraft.component.scss'],
  animations: listAnimations
})
export class AircraftComponent implements OnInit {
  // Observables
  aircrafts$: Observable<Aircraft[]>;
  showFilterMenu = false;

  @ViewChild(UnifiedFilterMenuComponent, {static: false}) filterMenu: UnifiedFilterMenuComponent;
  filterMenuProxy: FilterMenuProxy;

  constructor(
    private aircraftService: AircraftService,
    private location: Location,
    private aircraftFilterProvider: AircraftFilterSourceProvider
  ) {

    this.filterMenuProxy = new FilterMenuProxy(aircraftFilterProvider)
  }

  ngOnInit() {

    this.aircrafts$ = this.filterMenuProxy.filterQuery$.pipe(
      switchMap((search) => this.aircraftService.listAircraft(search)),
      shareReplay()
    ) as Observable<any[]>;
  }

  navigateBack() {
    this.location.back();
  }

  trackAircraft(index: number, item: Aircraft) {
    return item ? item._id : undefined;
  }

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }


}
