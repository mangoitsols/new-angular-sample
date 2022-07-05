import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyAssessmentModalComponent } from './copy-assessment-modal.component';

describe('CopyAssessmentModalComponent', () => {
  let component: CopyAssessmentModalComponent;
  let fixture: ComponentFixture<CopyAssessmentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyAssessmentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
