import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MullionTableComponent } from './mullion-table.component';

describe('MullionTableComponent', () => {
  let component: MullionTableComponent;
  let fixture: ComponentFixture<MullionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MullionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MullionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
