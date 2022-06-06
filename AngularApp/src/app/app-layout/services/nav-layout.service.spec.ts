import { TestBed } from '@angular/core/testing';

import { NavLayoutService } from './nav-layout.service';

describe('NavLayoutService', () => {
  let service: NavLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
