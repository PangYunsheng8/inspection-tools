import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideAxisInspectionComponent } from './side-axis-inspection.component';

describe('SideAxisInspectionComponent', () => {
  let component: SideAxisInspectionComponent;
  let fixture: ComponentFixture<SideAxisInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideAxisInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideAxisInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
