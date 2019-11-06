import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoltageItemInspectionComponent } from './voltage-item-inspection.component';

describe('VoltageItemInspectionComponent', () => {
  let component: VoltageItemInspectionComponent;
  let fixture: ComponentFixture<VoltageItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoltageItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoltageItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
