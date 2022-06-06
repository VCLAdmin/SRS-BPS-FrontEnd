import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipCustomComponent } from './tooltip-custom.component';

describe('TooltipCustomComponent', () => {
  let component: TooltipCustomComponent;
  let fixture: ComponentFixture<TooltipCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TooltipCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
