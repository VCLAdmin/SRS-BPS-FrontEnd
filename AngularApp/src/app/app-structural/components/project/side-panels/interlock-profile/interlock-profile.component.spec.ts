import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterlockProfileComponent } from './interlock-profile.component';

describe('InterlockProfileComponent', () => {
  let component: InterlockProfileComponent;
  let fixture: ComponentFixture<InterlockProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterlockProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterlockProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
