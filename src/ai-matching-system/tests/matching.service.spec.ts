import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../services/matching.service';
import { ContentBasedFilteringService, Profile } from '../services/content-based-filtering.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let cbf: ContentBasedFilteringService;

  beforeEach(async () => {
    cbf = new ContentBasedFilteringService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: ContentBasedFilteringService, useValue: cbf },
      ],
    }).compile();
    service = module.get<MatchingService>(MatchingService);
  });

  it('should match mentee to mentors using content-based filtering', () => {
    const mentee: Profile = { id: 'm', skills: ['js'], interests: ['ai'], goals: ['learn'] };
    const mentors: Profile[] = [
      { id: '1', skills: ['js'], interests: ['ai'], goals: ['teach'] },
      { id: '2', skills: ['python'], interests: ['ml'], goals: ['teach'] },
      { id: '3', skills: ['js', 'python'], interests: ['ai'], goals: ['learn'] }
    ];
    const matches = service.matchMenteeToMentors(mentee, mentors, 2);
    expect(matches.length).toBe(2);
    // Support both Profile and { mentor, score, breakdown }
    const first = matches[0] as any;
    const id = first.id ?? first.mentor?.id;
    expect(id).toBe('1');
  });

  it('should support custom weights and detailed output', () => {
    const mentee: Profile = { id: 'm', skills: ['js'], interests: ['ai'], goals: ['learn'] };
    const mentors: Profile[] = [
      { id: '1', skills: ['js'], interests: ['ai'], goals: ['teach'] },
      { id: '2', skills: ['python'], interests: ['ml'], goals: ['teach'] }
    ];
    // @ts-ignore
    const matches = cbf.matchMentors(mentee, mentors, 2, { skills: 1, interests: 0, goals: 0 }, true);
    expect(matches[0]).toHaveProperty('score');
    expect(matches[0]).toHaveProperty('breakdown');
  });
});
