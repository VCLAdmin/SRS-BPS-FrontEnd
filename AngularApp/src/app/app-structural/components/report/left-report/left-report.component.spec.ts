import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftReportComponent } from './left-report.component';

describe('LeftReportComponent', () => {
  let component: LeftReportComponent;
  let fixture: ComponentFixture<LeftReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
