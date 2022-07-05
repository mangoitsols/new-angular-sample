import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedToFieldComponent } from './assigned-to-field.component';

describe('AssignedToFieldComponent', () => {
  let component: AssignedToFieldComponent;
  let fixture: ComponentFixture<AssignedToFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignedToFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignedToFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
