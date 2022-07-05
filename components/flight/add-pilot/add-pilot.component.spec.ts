import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPilotComponent } from './add-pilot.component';

describe('AddPilotComponent', () => {
  let component: AddPilotComponent;
  let fixture: ComponentFixture<AddPilotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPilotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPilotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
