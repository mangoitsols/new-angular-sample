import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {AssessmentDto, UserDm} from "@/_models";
import {RadioOption} from "@/components/shared/radio-list/radio-list.component";
import {FormControl} from "@angular/forms";
import {UserRoleFilter} from "@/filters/category/user-role-category";
import {filter, map} from "rxjs/operators";
import {UserService} from "@/_services";
import UserModel = UserDm.UserModel;
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/internal/operators";
import {untilDestroyed} from "ngx-take-until-destroy";

@Component({
  selector: 'flight-detail-assessment',
  templateUrl: './flight-detail-assessment.component.html',
  styleUrls: ['./flight-detail-assessment.component.scss']
})
export class FlightDetailAssessmentComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assessments: AssessmentDto[];
  @Input() assessmentSelection: FormControl;

  private radioOptions: RadioOption[] = [];
  accountOwner$: Observable<UserModel>;
  constructor(private userService: UserService) { }

  ngOnInit() {

    this.accountOwner$ = this.userService.getUsers({filter: UserRoleFilter.OWNER})
      .pipe(
        untilDestroyed(this),
        map(users => users[0]),
        filter(user => !!user),
        map(user => user as UserModel),
        shareReplay(),
      )
  }

  ngOnDestroy(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assessments.previousValue !== this.assessments) {
      this.radioOptions = (this.assessments || []).map(asmt => {
        return {
          value: asmt._id,
          label: asmt.title,
        }
      })
    }
  }


  get assessmentRadioOptions(): RadioOption[] {
    return this.radioOptions;
  }

  updateSelection(id: string) {
    this.assessmentSelection.patchValue(id);
  }
}
