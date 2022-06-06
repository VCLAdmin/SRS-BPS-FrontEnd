import { TestBed } from '@angular/core/testing';

import { UnifiedModelService } from './unified-model.service';

describe('UnifiedModelService', () => {
  let service: UnifiedModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnifiedModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
