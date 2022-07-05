import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftFieldComponent } from './aircraft-field.component';

describe('AircraftFieldComponent', () => {
  let component: AircraftFieldComponent;
  let fixture: ComponentFixture<AircraftFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AircraftFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AircraftFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
