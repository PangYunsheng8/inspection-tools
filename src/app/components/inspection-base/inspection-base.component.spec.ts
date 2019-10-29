import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionBaseComponent } from './inspection-base.component';

describe('InspectionBaseComponent', () => {
  let component: InspectionBaseComponent;
  let fixture: ComponentFixture<InspectionBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InspectionBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
