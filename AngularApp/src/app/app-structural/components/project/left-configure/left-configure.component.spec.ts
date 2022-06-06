import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftConfigureComponent } from './left-configure.component';

describe('LeftConfigureComponent', () => {
  let component: LeftConfigureComponent;
  let fixture: ComponentFixture<LeftConfigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftConfigureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
