import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftThermalPanelComponent } from './left-thermal-panel.component';

describe('LeftThermalPanelComponent', () => {
  let component: LeftThermalPanelComponent;
  let fixture: ComponentFixture<LeftThermalPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftThermalPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftThermalPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
