import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsideHandleComponent } from './inside-handle.component';

describe('InsideHandleComponent', () => {
  let component: InsideHandleComponent;
  let fixture: ComponentFixture<InsideHandleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsideHandleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsideHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
