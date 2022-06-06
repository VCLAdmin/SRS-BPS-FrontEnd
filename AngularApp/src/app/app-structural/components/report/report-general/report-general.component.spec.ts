import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGeneralComponent } from './report-general.component';

describe('ReportGeneralComponent', () => {
  let component: ReportGeneralComponent;
  let fixture: ComponentFixture<ReportGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
