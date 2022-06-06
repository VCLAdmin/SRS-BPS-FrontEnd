import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuralProfileTableComponent } from './structural-profile-table.component';

describe('StructuralProfileTableComponent', () => {
  let component: StructuralProfileTableComponent;
  let fixture: ComponentFixture<StructuralProfileTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructuralProfileTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuralProfileTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
