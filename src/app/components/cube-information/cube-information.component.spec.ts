import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeInformationComponent } from './cube-information.component';

describe('CubeInformationComponent', () => {
  let component: CubeInformationComponent;
  let fixture: ComponentFixture<CubeInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubeInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
