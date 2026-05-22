export function complianceBandFromScore(score) {
  assertScore(score);
  if (score >= 90) return "pass";
  if (score >= 70) return "warning";
  return "critical";
}

export function scoreEvidenceCompleteness(artifacts) {
  if (!Array.isArray(artifacts)) {
    throw new TypeError("artifacts must be an array");
  }
  if (artifacts.length === 0) return 0;

  const weights = artifacts.map((artifact) => {
    switch (artifact.band) {
      case "pass":
        return 1;
      case "warning":
        return 0.7;
      case "critical":
        return 0.35;
      default:
        throw new Error(`Unknown evidence band: ${artifact.band}`);
    }
  });

  const average = weights.reduce((sum, value) => sum + value, 0) / weights.length;
  return Math.round(average * 100);
}

export function buildProvisioningReadiness(request) {
  const required = [
    ["fullName", request.fullName],
    ["email", request.email],
    ["npn", request.npn],
    ["templateId", request.templateId],
  ];
  const missing = required
    .filter(([, value]) => typeof value !== "string" || value.trim() === "")
    .map(([field]) => field);

  if (!Array.isArray(request.states) || request.states.length === 0) {
    missing.push("states");
  }

  const readiness = Math.max(0, Math.round(((required.length + 1 - missing.length) / (required.length + 1)) * 100));
  return {
    readiness,
    band: complianceBandFromScore(readiness),
    missing,
  };
}

function assertScore(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("score must be between 0 and 100");
  }
}
