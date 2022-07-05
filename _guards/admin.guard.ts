import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {AuthenticationService} from '@/_services';
import {UserDm} from '@/_models';
import * as _ from 'lodash';
import UserRoles = UserDm.UserRoles;

const DEFAULT_ROLES = [UserRoles.Admin, UserRoles.Owner];


@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    const allowedRoles = _.get(route, 'data.roles', DEFAULT_ROLES);
    if (currentUser && _.includes(allowedRoles, currentUser.role)) {
      return true;
    } else if (currentUser) { // insufficient role
      return this.router.parseUrl('/no-permission');
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
