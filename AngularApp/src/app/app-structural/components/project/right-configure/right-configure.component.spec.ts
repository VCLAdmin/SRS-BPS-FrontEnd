import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightConfigureComponent } from './right-configure.component';

describe('RightConfigureComponent', () => {
  let component: RightConfigureComponent;
  let fixture: ComponentFixture<RightConfigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightConfigureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
