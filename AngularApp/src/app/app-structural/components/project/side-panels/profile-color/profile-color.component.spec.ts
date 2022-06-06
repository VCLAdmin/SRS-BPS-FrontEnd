import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileColorComponent } from './profile-color.component';

describe('ProfileColorComponent', () => {
  let component: ProfileColorComponent;
  let fixture: ComponentFixture<ProfileColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
