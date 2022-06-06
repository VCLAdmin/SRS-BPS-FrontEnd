import { TestBed } from '@angular/core/testing';

import { AppconstantsService } from './appconstants.service';

describe('AppconstantsService', () => {
  let service: AppconstantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppconstantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
