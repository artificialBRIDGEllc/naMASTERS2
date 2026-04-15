import type { ComplianceBand, EvidenceArtifact } from './types';

export function complianceBandFromScore(score: number): ComplianceBand {
  if (score >= 90) return 'pass';
  if (score >= 70) return 'warning';
  return 'critical';
}

export function scoreEvidenceCompleteness(artifacts: EvidenceArtifact[]): number {
  if (!artifacts.length) return 0;
  const weights = artifacts.map((artifact) => {
    switch (artifact.band) {
      case 'pass':
        return 1;
      case 'warning':
        return 0.7;
      case 'critical':
        return 0.35;
    }
  });
  const average = weights.reduce((sum, value) => sum + value, 0) / weights.length;
  return Math.round(average * 100);
}
