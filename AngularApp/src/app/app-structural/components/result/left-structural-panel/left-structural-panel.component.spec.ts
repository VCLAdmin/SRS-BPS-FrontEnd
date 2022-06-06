import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftStructuralPanelComponent } from './left-structural-panel.component';

describe('LeftStructuralPanelComponent', () => {
  let component: LeftStructuralPanelComponent;
  let fixture: ComponentFixture<LeftStructuralPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftStructuralPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftStructuralPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
