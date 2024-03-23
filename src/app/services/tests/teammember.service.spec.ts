import { TestBed } from '@angular/core/testing';

import { TeammemberService } from '../teammember.service';

describe('TeammemberService', () => {
  let service: TeammemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeammemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
