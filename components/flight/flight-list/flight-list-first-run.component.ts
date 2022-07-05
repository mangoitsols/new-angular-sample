import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'flight-list'
  selector: 'flight-list-first-run',  // <flight-list-first-run></flight-list-first-run>
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['flight-list-first-run.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'flight-list-first-run.component.html'
})
export class FlightListFirstRunComponent {
  constructor(
    private router: Router
  ) {
  }

  public createFlight() {
    this.router.navigateByUrl(`/flights/createFlight`);
  }
}
