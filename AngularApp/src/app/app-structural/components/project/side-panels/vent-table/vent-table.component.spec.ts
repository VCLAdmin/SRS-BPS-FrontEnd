import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentTableComponent } from './vent-table.component';

describe('VentTableComponent', () => {
  let component: VentTableComponent;
  let fixture: ComponentFixture<VentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
