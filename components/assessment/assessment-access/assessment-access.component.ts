import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {AssessmentService, UserService} from "@/_services";
import {ActivatedRoute} from "@angular/router";
import {shareReplay} from "rxjs/internal/operators";
import {combineLatest, Observable} from "rxjs";
import {AssessmentDto, UserDm} from "@/_models";
import {map, retry, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {ManageAssessmentModel} from "@/_models/assessment/ManageAssessmentModel";
import {FilterMenuProxy} from "@/components/shared/unified-filter-menu/filter-menu-proxy";
import {PilotListFilterSourceProvider} from "@/filters/filter-providers";
import UserModel = UserDm.UserModel;
import {untilDestroyed} from "ngx-take-until-destroy";
import UserRoles = UserDm.UserRoles;

@Component({
  selector: 'app-assessment-access',
  templateUrl: './assessment-access.component.html',
  styleUrls: ['./assessment-access.component.scss']
})
export class AssessmentAccessComponent implements OnInit, OnDestroy {
  assessmentManager$: Observable<ManageAssessmentModel>;
  users$: Observable<UserDm.UserModel[]>;
  userStates$: Observable<UserAccessDto[]>
  filterMenuProxy: FilterMenuProxy;
  selectAll = false;

  private onSelectAllChanged = new EventEmitter<boolean>();
  assessment: AssessmentDto;

  constructor(private assessmentService: AssessmentService,
              private userService: UserService,
              private route: ActivatedRoute,
              private pilotFilterSource: PilotListFilterSourceProvider) {

    this.filterMenuProxy = new FilterMenuProxy(pilotFilterSource);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('assessmentId');

    this.assessmentManager$ = this.assessmentService.getAssessment(id).pipe(
      untilDestroyed(this),
      tap(assessment => {
        this.assessment = assessment;
      }),
      map(assessment => new ManageAssessmentModel(assessment)),
      shareReplay()
    );

    this.users$ = this.filterMenuProxy.filterQuery$.pipe(
      untilDestroyed(this),
      switchMap((query) => {
        return this.userService.getUsers(query);
      }),
      shareReplay(),
    );

    this.userStates$ = combineLatest(
      this.assessmentManager$,
      this.users$,
    ).pipe(
      map(([manager, users]) => {
        return users.map(user => ({
          _id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          isEnabled: () => manager.isAccessAllowedForUser(user),
          changeAccess: (allowed: boolean) => manager.changeAccessForUser(allowed, user)
        }))
      }),
    );

    this.onSelectAllChanged.pipe(
      withLatestFrom(this.assessmentManager$, this.users$),
      tap(([selectAll, mgr, users]: [boolean, ManageAssessmentModel, UserModel[]]) => {
        mgr.changeAccessForAll(selectAll, users);
      })
    ).subscribe();

    this.assessmentManager$.pipe(
      switchMap(manager => manager.userAccessChanges),
      switchMap(allowedUsers => this.assessmentService.updateAssessment(id, {
        accessControl: {
          allowedUsers: allowedUsers
        }
      })),
      retry()
    ).subscribe();
  }

  ngOnDestroy(): void {
  }

  trackUser(index: number, user: UserAccessDto) {
    return user._id;
  }

  toggleFilterMenu() {
    this.filterMenuProxy.toggleFilterMenu();
  }

  toggleSelectAll(selectAll: boolean) {
    this.onSelectAllChanged.emit(selectAll);
  }

  isAo(user: UserAccessDto) {
    return user.role === UserRoles.Owner;
  }
}

interface UserAccessDto {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEnabled(): boolean;
  changeAccess(boolean);
}
