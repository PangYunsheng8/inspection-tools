import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AxisItemInspectionComponent } from './axis-item-inspection.component';

describe('AxisItemInspectionComponent', () => {
  let component: AxisItemInspectionComponent;
  let fixture: ComponentFixture<AxisItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AxisItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AxisItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
