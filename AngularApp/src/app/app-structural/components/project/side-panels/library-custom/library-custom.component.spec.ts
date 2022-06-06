import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryCustomComponent } from './library-custom.component';

describe('LibraryCustomComponent', () => {
  let component: LibraryCustomComponent;
  let fixture: ComponentFixture<LibraryCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
