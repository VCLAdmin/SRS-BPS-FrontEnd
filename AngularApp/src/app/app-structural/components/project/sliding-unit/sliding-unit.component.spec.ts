import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingUnitComponent } from './sliding-unit.component';

describe('SlidingUnitComponent', () => {
  let component: SlidingUnitComponent;
  let fixture: ComponentFixture<SlidingUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidingUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidingUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
