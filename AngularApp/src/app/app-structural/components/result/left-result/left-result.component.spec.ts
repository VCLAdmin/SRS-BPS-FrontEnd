import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftResultComponent } from './left-result.component';

describe('LeftResultComponent', () => {
  let component: LeftResultComponent;
  let fixture: ComponentFixture<LeftResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
