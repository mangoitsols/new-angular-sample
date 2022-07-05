import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditAircraftComponent} from './edit-aircraft.component';

describe('EditAircraftComponent', () => {
  let component: EditAircraftComponent;
  let fixture: ComponentFixture<EditAircraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAircraftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAircraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
