import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameCombinationTableComponent } from './frame-combination-table.component';

describe('FrameCombinationTableComponent', () => {
  let component: FrameCombinationTableComponent;
  let fixture: ComponentFixture<FrameCombinationTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrameCombinationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameCombinationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
