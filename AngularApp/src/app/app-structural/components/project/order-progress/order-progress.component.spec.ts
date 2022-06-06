import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderProgressComponent } from './order-progress.component';

describe('OrderProgressComponent', () => {
  let component: OrderProgressComponent;
  let fixture: ComponentFixture<OrderProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
