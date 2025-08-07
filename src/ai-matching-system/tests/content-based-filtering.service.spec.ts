import { ContentBasedFilteringService, Profile } from '../services/content-based-filtering.service';

describe('ContentBasedFilteringService', () => {
  let service: ContentBasedFilteringService;

  beforeEach(() => {
    service = new ContentBasedFilteringService();
  });

  it('should compute Jaccard similarity correctly', () => {
    expect(service['jaccard'](['a', 'b'], ['b', 'c'])).toBeCloseTo(1/3);
    expect(service['jaccard'](['a', 'b'], ['a', 'b'])).toBe(1);
    expect(service['jaccard']([], [])).toBe(0);
  });

  it('should compute profile similarity', () => {
    const p1: Profile = { id: '1', skills: ['js', 'ts'], interests: ['ai'], goals: ['learn'] };
    const p2: Profile = { id: '2', skills: ['js'], interests: ['ai', 'ml'], goals: ['teach'] };
    const sim = service.computeSimilarity(p1, p2);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it('should match mentors by similarity', () => {
    const mentee: Profile = { id: 'm', skills: ['js'], interests: ['ai'], goals: ['learn'] };
    const mentors: Profile[] = [
      { id: '1', skills: ['js'], interests: ['ai'], goals: ['teach'] },
      { id: '2', skills: ['python'], interests: ['ml'], goals: ['teach'] },
      { id: '3', skills: ['js', 'python'], interests: ['ai'], goals: ['learn'] }
    ];
    const matches = service.matchMentors(mentee, mentors, 2);
    expect(matches.length).toBe(2);
    expect(matches[0].id).toBe('3'); // most similar
  });
});
