import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AssessmentDto, Flight, MitigationState, UserDm} from "@/_models";
import {UserService} from "@/_services";
import * as _ from "lodash";
import {Router} from '@angular/router';
import {ScoreColorMap} from "@/components/frat/color-map";
import {FlightModel} from "@/_models/flight/flight.model";
import User = UserDm.User;
import {ToastrService} from "ngx-toastr";

interface CtaState {
  buttonText: string;
  disabled: boolean;
  style: string;
  action: () => void;
}


@Component({
  selector: 'flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss']

})
export class FlightCardComponent {
  @Input() flight: FlightModel;
  @Input() expandCard: boolean = false;
  @Input() showCTA: boolean = true;
  @Input() showEdit: boolean = false;

  readonly currentUser: User;

  constructor(private userService: UserService, private router: Router, private toastService: ToastrService) {
    this.currentUser = userService.getCurrentUser();
  }

  get assessmentTitle(): string {
    return (<AssessmentDto>this.flight.assessment).title;
  }

  statusClass(): string {
    const scoreRangeName = _.get(this.flight, 'frat.scoreRange.canonicalName');
    if (!this.flight) {
      return "";
    }
    return (this.flight.submissionDate) && scoreRangeName !== undefined
      ? ScoreColorMap[scoreRangeName] : "";
  }

  ogStatusClass(): string {
    const scoreRangeName = _.get(this.flight, 'frat.originalScoreRange.canonicalName');

    if (!this.flight) {
      return "";
    }
    return (this.flight.submissionDate) && scoreRangeName !== undefined
      ? ScoreColorMap[scoreRangeName] : "";
  }

  abbreviatedName(user: User): string {
    return user ? `${user.firstName[0]}. ${user.lastName}` : '';
  }

  departure() {
    return (this.flight && this.flight.departure_airport) ?
      this.flight.departure_airport.icao_code : ''
  }

  canEdit(): boolean {

    const isAssessmentStarted = !!this.flight.frat;
    const isAssessmentSubmitted = isAssessmentStarted && this.flight.frat.mitigationState === MitigationState.approved;

    if (isAssessmentSubmitted || isAssessmentSubmitted) {
      return false;
    }
    return this.isCurrentUserInFlight() || this.isAdmin();

  }


  currentUserIsPIC() {
    return _.get(this.flight, "pic._id") === _.get(this.currentUser, "_id");
  }

  currentUserIsSIC() {
    return _.get(this.flight, "sic._id") === _.get(this.currentUser, "_id");
  }


  isAdmin() {
    return this.currentUser.hasAtleastRole(UserDm.UserRoles.Admin);
  }

  takeFrat() {
    return this.router.navigate(['/frats', this.flight._id]);
  }

  isFlightAssignedToUser(pilot: UserDm.User): boolean {
    if (!pilot || !this.flight) {
      return false;
    }
    return _.get(this.flight, "responsiblePilot._id") === _.get(pilot, "_id");
  }

  isMitigated() {
    return !!this.flight && !!this.flight.frat &&
      parseInt(this.flight.frat.score, 10) < this.flight.frat.originalScore;
  }

  isCurrentUserInFlight(): boolean {
    return this.currentUserIsSIC() || this.currentUserIsPIC();
  }

  get ctaState(): CtaState {

    const isAssessmentStarted = !!this.flight.frat;
    const isAssessmentSubmitted = isAssessmentStarted && this.flight.frat.mitigationState === MitigationState.approved;

    if (this.isFlightAssignedToUser(this.currentUser) || this.isAdmin()) {

      if (!isAssessmentStarted) {
        return {
          buttonText: 'Assess Risk',
          style: 'new',
          disabled: false,
          action: () => this.startAssessment()
        };
      }
      if (isAssessmentSubmitted) {
        return {
          buttonText: 'Review Risk',
          style: 'completed',
          disabled: false,
          action: () => this.reviewAssessment()
        };
      }
      return {
        buttonText: 'Pending Submission',
        style: 'needs-mitigation',
        disabled: false,
        action: () => this.reviewAssessment()
      };
    }
    if (this.isCurrentUserInFlight()) {

      if (isAssessmentStarted && isAssessmentSubmitted) {
        return {
          buttonText: 'Review Risk',
          style: 'completed',
          disabled: false,
          action: () => this.reviewAssessment(),
        }
      }
      return {
        buttonText: 'Pending Submission',
        style: 'assigned-other disabledcta',
        disabled: true,
        action: () => {}
      }


    }

    return null;
  }

  private startAssessment() {
    this.router.navigateByUrl(`frats/${this.flight._id}`);
  }

  private reviewAssessment() {
    const fratId = _.get(this.flight, 'frat._id') as string | null;
    try {
      this.router.navigate(['/frats', fratId, 'calculate']);
    } catch (e) {
      console.error(e);
      this.toastService.error(
        'This flight is marked as submitted, but there doesn\'t appear to be a frat associated with it.',
        'This is odd'
      )
    }
  }

  public editFlight() {
    this.router.navigate(['/flights', this.flight._id])
    // this.router.navigate(["/flights", this.flight._id, "summary"]);
  }

}
