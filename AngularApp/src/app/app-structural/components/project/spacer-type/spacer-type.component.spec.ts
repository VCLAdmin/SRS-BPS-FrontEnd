import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacerTypeComponent } from './spacer-type.component';

describe('SpacerTypeComponent', () => {
  let component: SpacerTypeComponent;
  let fixture: ComponentFixture<SpacerTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpacerTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpacerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
