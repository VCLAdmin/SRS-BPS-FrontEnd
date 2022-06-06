import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorLeafPassiveComponent } from './door-leaf-passive.component';

describe('DoorLeafPassiveComponent', () => {
  let component: DoorLeafPassiveComponent;
  let fixture: ComponentFixture<DoorLeafPassiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorLeafPassiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorLeafPassiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
