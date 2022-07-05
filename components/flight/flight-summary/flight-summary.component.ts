import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Flight, UserDm} from "@/_models";
import {FlightService, UserService} from "@/_services";
import {Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {RoutingService} from "@/_services/routing.service";
import * as _ from 'lodash';
import {ToastrService} from "ngx-toastr";
import UserModel = UserDm.UserModel;

@Component({
  selector: 'flight-summary',
  templateUrl: './flight-summary.component.html',
  styleUrls: ['./flight-summary.component.scss']
})
export class FlightSummaryComponent {
  private flightId: string;
  private user: UserDm.User;
  flight: Flight;
  flight$: Observable<Flight>;
  showConfirmDelete: boolean;
  responsiblePilot$: Observable<UserDm.UserModel>;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private flightService: FlightService,
              private userService: UserService,
              private appRoutes: RoutingService,
              private toastService: ToastrService) {}


  ngOnInit() {
    this.flightId = this.route.snapshot.params['flightId'];
    this.user = this.userService.getCurrentUser();
    this.flight$ = this.flightService.getFlight(this.flightId, {assessment:true}).pipe(shareReplay());
    this.responsiblePilot$ = this.flight$.pipe(
      map(flight => {
        return new UserModel(flight.responsiblePilot);
      })
    )
    this.flight$.subscribe(flight => {
      this.flight = flight
    });
  }

  currentUserIsResponsiblePilot() {
    return (this.user && this.flight) &&
        this.user._id === _.get(this.flight, 'responsiblePilot._id');
  }

  currentUserIsPIC() {
    return _.get(this.flight, "pic._id") === _.get(this.user, "_id");
  }

  currentUserIsSIC() {
    return _.get(this.flight, "sic._id") === _.get(this.user, "_id");
  }

  isAdmin() {
    return this.user.hasAtleastRole(UserDm.UserRoles.Admin);
  }

  createNextLeg() {
    this.flight$.pipe(
      switchMap(flight => this.appRoutes.routeToNextLeg(flight))
    ).subscribe()
  }

  editFlight(flight: Flight) {
    if (flight) {
      this.router.navigate(['/flights', flight._id])
    }
  }

  deleteFlight(flight: Flight) {
    this.showConfirmDelete = true;
  }

  confirmDelete(confirm: boolean) {
    this.showConfirmDelete = false;
    if (confirm) {
      this.flightService.deleteFlight(this.flightId)
        .subscribe(() => {
          this.toastService.success('Assessment deleted successfully.');
          this.router.navigate(['/flights'])
        })
    }
  }
}
