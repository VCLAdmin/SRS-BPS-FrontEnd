import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleColorComponent } from './handle-color.component';

describe('HandleColorComponent', () => {
  let component: HandleColorComponent;
  let fixture: ComponentFixture<HandleColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandleColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
