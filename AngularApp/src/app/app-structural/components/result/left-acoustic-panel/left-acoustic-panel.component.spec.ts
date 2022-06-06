import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftAcousticPanelComponent } from './left-acoustic-panel.component';

describe('LeftAcousticPanelComponent', () => {
  let component: LeftAcousticPanelComponent;
  let fixture: ComponentFixture<LeftAcousticPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftAcousticPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftAcousticPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
