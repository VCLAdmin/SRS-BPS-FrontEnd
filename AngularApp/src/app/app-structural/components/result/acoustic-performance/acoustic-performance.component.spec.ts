import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcousticPerformanceComponent } from './acoustic-performance.component';

describe('AcousticPerformanceComponent', () => {
  let component: AcousticPerformanceComponent;
  let fixture: ComponentFixture<AcousticPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcousticPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcousticPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
