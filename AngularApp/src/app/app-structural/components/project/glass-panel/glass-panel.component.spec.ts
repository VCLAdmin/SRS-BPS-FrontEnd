import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassPanelComponent } from './glass-panel.component';

describe('GlassPanelComponent', () => {
  let component: GlassPanelComponent;
  let fixture: ComponentFixture<GlassPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlassPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlassPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
