import {Component, EventEmitter, HostListener, Inject, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  scan,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom
} from "rxjs/operators";
import {FlightService, USER_IS_AT_LEAST_ADMIN, UserService} from "@/_services";
import {Flight, FlightList, MitigationState, UserDm} from "@/_models";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import * as _ from 'lodash';
import {FilterSource} from "@/components/shared/unified-filter-menu/filter-source";
import {UnifiedFilterMenuComponent} from "@/components/shared/unified-filter-menu/unified-filter-menu.component";
import {FlightListFilterProvider} from "@/filters/filter-providers";
import {FilterMenuProxy} from "@/components/shared/unified-filter-menu/filter-menu-proxy";
import {FilterQuery} from "@/components/shared/unified-filter-menu/filter-option";
import {LastScrollDirection} from "@/_directives/scroll-state.directive";
import {expandingFabAnimations} from "@/_utility/animations";
import {FlightModel} from "@/_models/flight/flight.model";

@Component({
  selector: "flight-list",
  providers: [FlightService],
  styleUrls: ["flight-list.component.scss"],
  templateUrl: "flight-list.component.html",
  animations: [expandingFabAnimations]
})
export class FlightListComponent implements OnInit, OnDestroy {
  @Output() onFilterMenuToggle = new EventEmitter<void>();

  private pageScroll$ = new BehaviorSubject<void>(null);

  displayedFlights$: Observable<FlightModel[]>;

  @ViewChild(UnifiedFilterMenuComponent, {static: false}) filterMenu: UnifiedFilterMenuComponent;
  filterMenuProxy: FilterMenuProxy;
  showSettingsMenu = false;
  lastScrollDirection: LastScrollDirection;

  scrollDirections = LastScrollDirection;

  constructor(
    private flightService: FlightService,
    private router: Router,
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private userService: UserService,
    private flightListFilterProvider: FlightListFilterProvider,
    @Inject(USER_IS_AT_LEAST_ADMIN) public isAtLeastAdmin$
  ) {

    this.filterMenuProxy = new FilterMenuProxy(this.flightListFilterProvider);
  }

  ngOnInit() {
    const pageCounter$: Observable<number> = this.buildPageCounter(this.filterMenuProxy.filterQuery$);
    const flightListAccumulator$: Observable<FlightList> = this.buildFlightListAccumulator(pageCounter$, this.filterMenuProxy.filterQuery$);
    this.displayedFlights$ = this.extractFlightsFromResponse(flightListAccumulator$, this.filterMenuProxy.filterQuery$);
  }

  ngOnDestroy(): void {}


  onScrollDown() {
    this.pageScroll$.next()
  }

  trackFlightId(index: number, flight: Flight) {
    return flight._id;
  }



  public createFlight() {
    this.router.navigateByUrl(`/flights/createFlight`);
  }

  public getFlightClass(flight: Flight) {
    switch (flight.mitigationState) {
      case MitigationState.approved:
        return "approved";
      case MitigationState.needsMitigation:
        return "needs-mitigation";
      case MitigationState.submittedForApproval:
        return "waiting-approval";
      default:
        return "";
    }
  }

  private extractFlightsFromResponse(flightList$: Observable<FlightList>, filterSelection$: Observable<FilterQuery>): Observable<FlightModel[]> {
    return flightList$.pipe(
      withLatestFrom(filterSelection$),
      distinctUntilChanged(),
      map(([list, filter]) => {
        // if(_.size(list.data) === 0 && _.isNil(filter)) {
        //   this.userFilterSelection.emit(this.fallBackFilter());
        // }
        return list.data;
      })
    );
  }

  private buildFlightListAccumulator(pageCounter$: Observable<number>, filterSelection$: Observable<FilterQuery>): Observable<FlightList> {
    return pageCounter$.pipe(
      withLatestFrom(filterSelection$),
      concatMap(([page, filter]) => {
        return this.flightService.getFlights(filter,  page).pipe(
          catchError(err => of(new Error(err))),
        )
      }),
      filter(e => !(e instanceof Error)),
      scan((acc: FlightList, fl: FlightList) => {
        if (_.isEmpty(acc)) {
          return fl;
        }
        if (!acc.meta.equals(fl.meta)) {
          return fl;
        }
        acc.data.push(...fl.data);
        acc.meta = fl.meta;
        return acc;
      }, {} as FlightList),
      shareReplay(),
      tap({complete: () => console.log('complete')})
    );
  }

  private buildPageCounter(filterSelection$: Observable<FilterQuery>) {
    return combineLatest([filterSelection$]).pipe(
      distinctUntilChanged(),
      switchMap(filter => this.pageScroll$.pipe(
        // Note: pageScroll$ is always triggered on page load
        scan((acc, _) => acc + 1, -1),
      ))
    );
  }

  toggleSettingsMenu() {
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  scrollDirectionChange($event: LastScrollDirection) {
    this.lastScrollDirection = $event;
  }
}
