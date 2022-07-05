import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDetailAssessmentComponent } from './flight-detail-assessment.component';

describe('FlightDetailAssessmentComponent', () => {
  let component: FlightDetailAssessmentComponent;
  let fixture: ComponentFixture<FlightDetailAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightDetailAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
