import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAccessComponent } from './assessment-access.component';

describe('AssessmentAccessComponent', () => {
  let component: AssessmentAccessComponent;
  let fixture: ComponentFixture<AssessmentAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
