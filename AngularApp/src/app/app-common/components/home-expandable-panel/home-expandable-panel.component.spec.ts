import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeExpandablePanelComponent } from './home-expandable-panel.component';

describe('HomeExpandablePanelComponent', () => {
  let component: HomeExpandablePanelComponent;
  let fixture: ComponentFixture<HomeExpandablePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeExpandablePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeExpandablePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
