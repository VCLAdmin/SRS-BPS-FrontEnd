import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SillProfileFixedComponent } from './sill-profile-fixed.component';

describe('SillProfileFixedComponent', () => {
  let component: SillProfileFixedComponent;
  let fixture: ComponentFixture<SillProfileFixedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SillProfileFixedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SillProfileFixedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
