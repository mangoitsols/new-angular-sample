import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {shareReplay} from "rxjs/operators";
import {AssessmentService} from "@/_services";
import {Observable} from "rxjs";
import {AssessmentDto} from "@/_models";
import {FormBuilder, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-copy-assessment-modal',
  templateUrl: './copy-assessment-modal.component.html',
  styleUrls: ['./copy-assessment-modal.component.scss']
})
export class CopyAssessmentModalComponent implements OnInit {

  assessments$: Observable<AssessmentDto[]>;
  copyFromControl: FormControl;

  constructor(private activeModal: NgbActiveModal,
              private assessmentService: AssessmentService,
              private fb: FormBuilder) {

    this.copyFromControl = this.fb.control('', Validators.required)

  }

  ngOnInit() {


    this.assessments$ = this.assessmentService.listAssessments()
      .pipe(
        shareReplay()
      );
  }

  close(proceed: boolean) {
    if (proceed) {
      return this.activeModal.close(this.copyFromControl.value);
    }
    this.activeModal.close(null);
  }
}
