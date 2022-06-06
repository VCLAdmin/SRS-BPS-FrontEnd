import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReinforcementProfileComponent } from './reinforcement-profile.component';

describe('ReinforcementProfileComponent', () => {
  let component: ReinforcementProfileComponent;
  let fixture: ComponentFixture<ReinforcementProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReinforcementProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReinforcementProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
