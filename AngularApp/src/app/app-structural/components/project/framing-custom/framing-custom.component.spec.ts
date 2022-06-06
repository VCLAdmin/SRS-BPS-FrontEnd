import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FramingCustomComponent } from './framing-custom.component';

describe('FramingCustomComponent', () => {
  let component: FramingCustomComponent;
  let fixture: ComponentFixture<FramingCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FramingCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FramingCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
