import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightReportComponent } from './right-report.component';

describe('RightReportComponent', () => {
  let component: RightReportComponent;
  let fixture: ComponentFixture<RightReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
