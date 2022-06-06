import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleVentTableComponent } from './double-vent-table.component';

describe('DoubleVentTableComponent', () => {
  let component: DoubleVentTableComponent;
  let fixture: ComponentFixture<DoubleVentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoubleVentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoubleVentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
