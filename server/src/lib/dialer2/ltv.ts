import type { LtvSegment } from './types';

export interface RankedLtvSegment extends LtvSegment {
  opportunityScore: number;
}

export function rankLtvSegments(segments: LtvSegment[]): RankedLtvSegment[] {
  return [...segments]
    .map((segment) => ({
      ...segment,
      opportunityScore: Math.round(
        segment.closeRate * 40 + segment.persistence * 40 + (segment.averageCommission / 500) * 20
      )
    }))
    .sort((left, right) => right.opportunityScore - left.opportunityScore);
}
