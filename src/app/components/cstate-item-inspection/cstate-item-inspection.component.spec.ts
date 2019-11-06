import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CstateItemInspectionComponent } from './cstate-item-inspection.component';

describe('CstateItemInspectionComponent', () => {
  let component: CstateItemInspectionComponent;
  let fixture: ComponentFixture<CstateItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CstateItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CstateItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
