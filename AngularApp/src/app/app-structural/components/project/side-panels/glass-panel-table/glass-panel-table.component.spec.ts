import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassPanelTableComponent } from './glass-panel-table.component';

describe('GlassPanelTableComponent', () => {
  let component: GlassPanelTableComponent;
  let fixture: ComponentFixture<GlassPanelTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlassPanelTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlassPanelTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
