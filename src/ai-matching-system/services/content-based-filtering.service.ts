import { Injectable } from '@nestjs/common';

export interface Profile {
  id: string;
  skills: string[];
  interests: string[];
  goals: string[];
}

@Injectable()
export class ContentBasedFilteringService {
  /**
   * Compute similarity between two profiles based on skills, interests, and goals.
   * Uses Jaccard similarity for each attribute and averages the result.
   */
  computeSimilarity(profileA: Profile, profileB: Profile): number {
    const skillSim = this.jaccard(profileA.skills, profileB.skills);
    const interestSim = this.jaccard(profileA.interests, profileB.interests);
    const goalSim = this.jaccard(profileA.goals, profileB.goals);
    return (skillSim + interestSim + goalSim) / 3;
  }

  /**
   * Jaccard similarity between two string arrays
   */
  private jaccard(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Given a mentee and a list of mentors, return mentors sorted by similarity.
   */
  matchMentors(mentee: Profile, mentors: Profile[], topN = 5): Profile[] {
    return mentors
      .map(mentor => ({ mentor, score: this.computeSimilarity(mentee, mentor) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(item => item.mentor);
  }
}
