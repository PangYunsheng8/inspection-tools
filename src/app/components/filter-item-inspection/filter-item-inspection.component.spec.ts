import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterItemInspectionComponent } from './filter-item-inspection.component';

describe('FilterItemInspectionComponent', () => {
  let component: FilterItemInspectionComponent;
  let fixture: ComponentFixture<FilterItemInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterItemInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterItemInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
