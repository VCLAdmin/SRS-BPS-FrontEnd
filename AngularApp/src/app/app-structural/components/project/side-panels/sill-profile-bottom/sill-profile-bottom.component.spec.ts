import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SillProfileBottomComponent } from './sill-profile-bottom.component';

describe('SillProfileBottomComponent', () => {
  let component: SillProfileBottomComponent;
  let fixture: ComponentFixture<SillProfileBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SillProfileBottomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SillProfileBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
