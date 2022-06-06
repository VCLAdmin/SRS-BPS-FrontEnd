import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OuterTableComponent } from './outer-table.component';

describe('OuterTableComponent', () => {
  let component: OuterTableComponent;
  let fixture: ComponentFixture<OuterTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OuterTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OuterTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
