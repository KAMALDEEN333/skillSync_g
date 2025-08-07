import { Injectable } from '@nestjs/common';


export interface Profile {
  id: string;
  skills: string[];
  interests: string[];
  goals: string[];
  // Optionally allows for additional attributes in the futures
  [key: string]: any;
}

@Injectable()
export class ContentBasedFilteringService {

  /**
   * Compute similarity between two profiles based on skills, interests, and goals.
   * Allows weighting of each attribute and returns a detailed breakdown if needed.
   */
  computeSimilarity(
    profileA: Profile,
    profileB: Profile,
    weights: { skills?: number; interests?: number; goals?: number } = { skills: 0.5, interests: 0.3, goals: 0.2 },
    detailed = false
  ): number | { score: number; breakdown: Record<string, number> } {
    const skillSim = this.fuzzyJaccard(profileA.skills, profileB.skills);
    const interestSim = this.fuzzyJaccard(profileA.interests, profileB.interests);
    const goalSim = this.fuzzyJaccard(profileA.goals, profileB.goals);
    const totalWeight = (weights.skills ?? 0) + (weights.interests ?? 0) + (weights.goals ?? 0);
    const score =
      ((skillSim * (weights.skills ?? 0)) +
        (interestSim * (weights.interests ?? 0)) +
        (goalSim * (weights.goals ?? 0))) /
      (totalWeight || 1);
    if (detailed) {
      return {
        score,
        breakdown: {
          skills: skillSim,
          interests: interestSim,
          goals: goalSim,
        },
      };
    }
    return score;
  }


  /**
   * Enhanced Jaccard similarity: supports partial matches (e.g., 'JavaScript' ~ 'javascript')
   * and fuzzy matching for typos or similar words.
   */
  private fuzzyJaccard(arr1: string[], arr2: string[]): number {
    if (!arr1?.length && !arr2?.length) return 0;
    if (!arr1?.length || !arr2?.length) return 0;
    const norm = (s: string) => s.trim().toLowerCase();
    const set1 = Array.from(new Set(arr1.map(norm)));
    const set2 = Array.from(new Set(arr2.map(norm)));
    let intersection = 0;
    for (const a of set1) {
      if (set2.includes(a)) {
        intersection++;
      } else if (set2.some(b => this.similarEnough(a, b))) {
        intersection++;
      }
    }
    const union = new Set([...set1, ...set2]);
    return intersection / union.size;
  }

  /**
   * Simple fuzzy match: returns true if two strings are similar enough (Levenshtein distance <= 2)
   */
  private similarEnough(a: string, b: string): boolean {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 2) return false;
    return this.levenshtein(a, b) <= 2;
  }

  /**
   * Levenshtein distance between two strings
   */
  private levenshtein(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[a.length][b.length];
  }


  /**
   * Given a mentee and a list of mentors, return mentors sorted by similarity.
   * Allows custom weights and returns detailed scores if requested.
   */
  matchMentors(
    mentee: Profile,
    mentors: Profile[],
    topN = 5,
    weights: { skills?: number; interests?: number; goals?: number } = { skills: 0.5, interests: 0.3, goals: 0.2 },
    detailed = false
  ): (Profile | { mentor: Profile; score: number; breakdown?: Record<string, number> })[] {
    const scored = mentors
      .map(mentor => {
        const sim = this.computeSimilarity(mentee, mentor, weights, detailed);
        if (detailed && typeof sim === 'object') {
          return { mentor, score: sim.score, breakdown: sim.breakdown };
        }
        return { mentor, score: typeof sim === 'number' ? sim : sim.score, breakdown: undefined };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
    if (detailed) return scored;
    return scored.map(item => item.mentor);
  }
}
