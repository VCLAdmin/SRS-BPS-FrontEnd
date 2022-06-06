import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelCustomComponent } from './model-custom.component';

describe('ModelCustomComponent', () => {
  let component: ModelCustomComponent;
  let fixture: ComponentFixture<ModelCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
