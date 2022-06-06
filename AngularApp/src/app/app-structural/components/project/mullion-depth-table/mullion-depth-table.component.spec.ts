import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MullionDepthTableComponent } from './mullion-depth-table.component';

describe('MullionDepthTableComponent', () => {
  let component: MullionDepthTableComponent;
  let fixture: ComponentFixture<MullionDepthTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MullionDepthTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MullionDepthTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
