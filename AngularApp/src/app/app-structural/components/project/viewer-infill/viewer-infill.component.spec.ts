import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerInfillComponent } from './viewer-infill.component';

describe('ViewerInfillComponent', () => {
  let component: ViewerInfillComponent;
  let fixture: ComponentFixture<ViewerInfillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerInfillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerInfillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
