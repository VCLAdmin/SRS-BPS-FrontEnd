import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultGeneralComponent } from './result-general.component';

describe('ResultGeneralComponent', () => {
  let component: ResultGeneralComponent;
  let fixture: ComponentFixture<ResultGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
