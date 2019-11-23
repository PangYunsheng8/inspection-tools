import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttitudeItemInspectionComponent } from './attitude-item-inspection.component';

describe('AttitudeItemInspectionComponent', () => {
  let component: AttitudeItemInspectionComponent;
  let fixture: ComponentFixture<AttitudeItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttitudeItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttitudeItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
