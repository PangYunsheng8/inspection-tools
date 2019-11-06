import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorsItemInspectionComponent } from './sensors-item-inspection.component';

describe('SensorsItemInspectionComponent', () => {
  let component: SensorsItemInspectionComponent;
  let fixture: ComponentFixture<SensorsItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorsItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorsItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
