import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorLeafActiveComponent } from './door-leaf-active.component';

describe('DoorLeafActiveComponent', () => {
  let component: DoorLeafActiveComponent;
  let fixture: ComponentFixture<DoorLeafActiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorLeafActiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorLeafActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
