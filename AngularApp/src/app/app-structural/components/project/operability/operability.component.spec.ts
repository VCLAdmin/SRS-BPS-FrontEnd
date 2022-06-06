import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperabilityComponent } from './operability.component';

describe('OperabilityComponent', () => {
  let component: OperabilityComponent;
  let fixture: ComponentFixture<OperabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
