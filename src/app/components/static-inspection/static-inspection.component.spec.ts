import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticInspectionComponent } from './static-inspection.component';

describe('StaticInspectionComponent', () => {
  let component: StaticInspectionComponent;
  let fixture: ComponentFixture<StaticInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
