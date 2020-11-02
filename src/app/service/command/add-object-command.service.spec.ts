import { TestBed } from '@angular/core/testing';

import { AddObjectCommandService } from './add-object-command.service';

describe('AddObjectCommandService', () => {
  let service: AddObjectCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddObjectCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
