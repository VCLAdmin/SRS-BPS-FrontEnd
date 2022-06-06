import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightResultComponent } from './right-result.component';

describe('RightResultComponent', () => {
  let component: RightResultComponent;
  let fixture: ComponentFixture<RightResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
