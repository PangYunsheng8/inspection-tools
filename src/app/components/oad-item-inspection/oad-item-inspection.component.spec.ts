import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OadItemInspectionComponent } from './oad-item-inspection.component';

describe('OadItemInspectionComponent', () => {
  let component: OadItemInspectionComponent;
  let fixture: ComponentFixture<OadItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OadItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OadItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
