import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeContainerComponent } from './cube-container.component';

describe('CubeContainerComponent', () => {
  let component: CubeContainerComponent;
  let fixture: ComponentFixture<CubeContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubeContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
