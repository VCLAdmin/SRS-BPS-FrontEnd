import { TestBed } from '@angular/core/testing';

import { ValidatePanelsService } from './validate-panels.service';

describe('ValidatePanelsService', () => {
  let service: ValidatePanelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatePanelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
