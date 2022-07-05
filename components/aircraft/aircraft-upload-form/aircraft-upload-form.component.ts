import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Aircraft, AircraftUploadError, AircraftUploadResult} from "@/_models";
import {BehaviorSubject} from "rxjs";
import {filter, map, retry, shareReplay, switchMap, tap} from "rxjs/operators";
import {AircraftService} from "@/_services";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-aircraft-upload-form',
  templateUrl: './aircraft-upload-form.component.html',
  styleUrls: ['./aircraft-upload-form.component.scss']
})
export class AircraftUploadFormComponent implements OnInit {

  fileUploadResult$ = new BehaviorSubject<AircraftUploadResult>(null);
  fileChanges$ = new EventEmitter<any>();


  constructor(private aircraftService: AircraftService,
              private toastService: ToastrService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {

    const fileUploadResult$ = this.fileChanges$.pipe(
      map(event => event.target.files as File[]),
      filter(files => files.length > 0),
      switchMap(files => this.aircraftService.bulkAddAircraft(files[0])),
      tap(this.bulkAddObserver),
      retry(),
      shareReplay(),
    );
    fileUploadResult$.subscribe(this.fileUploadResult$);

  }

  clearErrors() {
    this.fileUploadResult$.next(null);
  }

  formatError(error: AircraftUploadError): string {
    return `Error on line ${error.line}: ${error.message}`
  }

  private bulkAddObserver = {
    next: result => {
      const addedCount = result.succeeded.length;
      const failedCount = result.failed.length;
      if (failedCount === 0 && addedCount > 0) {
        this.toastService.success(`${addedCount} aircraft were added.`)
        this.router.navigate(['/settings/aircraft']);
      } else if (failedCount > 0 && addedCount > 0) {
        this.toastService.warning(`${addedCount} aircraft were added.
        ${failedCount} aircraft could not be added due to errors. Please check the log and try again.`);
      }
    },
    error: err => {
      this.toastService.error(`No aircraft were added. Check the formatting of your CSV file`,
        'Error adding aircraft');
    }
  };
}
