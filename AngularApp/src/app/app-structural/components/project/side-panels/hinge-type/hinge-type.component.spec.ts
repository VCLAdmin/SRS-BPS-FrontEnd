import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HingeTypeComponent } from './hinge-type.component';

describe('HingeTypeComponent', () => {
  let component: HingeTypeComponent;
  let fixture: ComponentFixture<HingeTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HingeTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HingeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
