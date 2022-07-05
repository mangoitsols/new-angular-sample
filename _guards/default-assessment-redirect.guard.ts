import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AssessmentService} from "@/_services";
import {map} from "rxjs/internal/operators";
import {AssessmentDto} from "@/_models";

@Injectable({
  providedIn: 'root'
})
export class DefaultAssessmentRedirectGuard implements CanActivate {


  constructor(private assessmentService: AssessmentService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.assessmentService.listAssessments().pipe(
      map(assessments => {
        return assessments.find(asmt => asmt.isDefault)
        || assessments[0]
      }),
      map((redirectAssessment: AssessmentDto) => {
        if (!redirectAssessment) {
          return this.router.createUrlTree(['settings', 'users']);
        }
        return this.router.createUrlTree(['settings', 'assessments', redirectAssessment._id] );
      })
    );
  }

}
