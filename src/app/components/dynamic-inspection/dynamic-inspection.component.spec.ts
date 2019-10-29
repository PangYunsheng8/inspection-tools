import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicInspectionComponent } from './dynamic-inspection.component';

describe('DynamicInspectionComponent', () => {
  let component: DynamicInspectionComponent;
  let fixture: ComponentFixture<DynamicInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
