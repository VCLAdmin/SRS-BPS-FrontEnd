import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcousticChartComponent } from './acoustic-chart.component';

describe('AcousticChartComponent', () => {
  let component: AcousticChartComponent;
  let fixture: ComponentFixture<AcousticChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcousticChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcousticChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
