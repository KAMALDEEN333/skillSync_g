import { Injectable } from '@nestjs/common';
import { ContentBasedFilteringService, Profile } from '../services/content-based-filtering.service';

@Injectable()
export class MatchingService {
  constructor(private readonly contentBasedFiltering: ContentBasedFilteringService) {}

  /**
   * Match mentees to mentors using content-based filtering.
   * @param menteeProfile mentee profile
   * @param mentorProfiles list of mentor profiles
   * @param topN number of top matches to return
   */
  matchMenteeToMentors(menteeProfile: Profile, mentorProfiles: Profile[], topN = 5) {
    return this.contentBasedFiltering.matchMentors(menteeProfile, mentorProfiles, topN);
  }
}
