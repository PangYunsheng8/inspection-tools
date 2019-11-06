import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityItemInspectionComponent } from './identity-item-inspection.component';

describe('IdentityItemInspectionComponent', () => {
  let component: IdentityItemInspectionComponent;
  let fixture: ComponentFixture<IdentityItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
