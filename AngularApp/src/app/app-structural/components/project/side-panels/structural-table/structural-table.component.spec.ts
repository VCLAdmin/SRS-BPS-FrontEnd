import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuralTableComponent } from './structural-table.component';

describe('StructuralTableComponent', () => {
  let component: StructuralTableComponent;
  let fixture: ComponentFixture<StructuralTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructuralTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuralTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
