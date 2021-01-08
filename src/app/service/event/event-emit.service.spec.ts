import { TestBed } from '@angular/core/testing';

import { EventEmitService } from './event-emit.service';

describe('EventEmitService', () => {
  let service: EventEmitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventEmitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
