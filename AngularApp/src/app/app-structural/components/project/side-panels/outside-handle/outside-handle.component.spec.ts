import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutsideHandleComponent } from './outside-handle.component';

describe('OutsideHandleComponent', () => {
  let component: OutsideHandleComponent;
  let fixture: ComponentFixture<OutsideHandleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutsideHandleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutsideHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
