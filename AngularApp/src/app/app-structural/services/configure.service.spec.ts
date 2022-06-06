import { TestBed } from '@angular/core/testing';

import { ConfigureService } from './configure.service';

describe('ConfigureService', () => {
  let service: ConfigureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
