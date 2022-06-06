import { TestBed } from '@angular/core/testing';

import { FramingService } from './framing.service';

describe('FramingService', () => {
  let service: FramingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FramingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
