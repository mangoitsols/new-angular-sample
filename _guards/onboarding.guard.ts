import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {UserService, AircraftService} from "@/_services";
import {Observable, forkJoin, of} from "rxjs";
import {map, first, take} from "rxjs/operators";
import * as moment from "moment";
import * as _ from "lodash";
import {Aircraft, UserDm} from "@/_models";
import UserRoles = UserDm.UserRoles;
import UserModel = UserDm.UserModel;

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {

    constructor(private userService: UserService,
        private aircraftService: AircraftService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return forkJoin([
                this.aircraftService.listAircraft(),
                this.userService.getCurrentUserAsync(true).pipe(take(1))
        ]).pipe(
            map(([aircraft, user]: [Aircraft[], UserModel]) => {
                const hasAircraft = aircraft.length > 0;
                const hasCompany = !!user.account.name;
                const systemAdmin = user.hasAtleastRole(UserRoles.Owner);
                const newCustomer = moment.utc(user.account.created)
                    .isAfter("2020-03-31T00:00:01.000Z");

                const vendor = user.account.vendor;
                if (vendor) {
                    return true;
                }

                if(newCustomer && systemAdmin && (!hasCompany || !hasAircraft)) {
                    this.router.navigateByUrl('welcome');
                    return false;
                }
                return true;
            }
        ));
    }

}
