import { TestBed } from '@angular/core/testing';

import { ConfigPanelsService } from './config-panels.service';

describe('ConfigPanelsService', () => {
  let service: ConfigPanelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigPanelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
