import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProvisioningReadiness,
  complianceBandFromScore,
  scoreEvidenceCompleteness,
} from "../quality/compliance-scoring.mjs";

describe("complianceBandFromScore", () => {
  it("uses pass, warning, and critical bands for QA dashboards", () => {
    assert.equal(complianceBandFromScore(95), "pass");
    assert.equal(complianceBandFromScore(75), "warning");
    assert.equal(complianceBandFromScore(40), "critical");
  });
});

describe("scoreEvidenceCompleteness", () => {
  it("weights evidence artifacts by compliance severity", () => {
    const score = scoreEvidenceCompleteness([
      { band: "pass" },
      { band: "warning" },
      { band: "critical" },
    ]);

    assert.equal(score, 68);
  });
});

describe("buildProvisioningReadiness", () => {
  it("requires NPN, template, and licensed states before agent provisioning", () => {
    const result = buildProvisioningReadiness({
      fullName: "Demo Agent",
      email: "agent@example.com",
      npn: "",
      templateId: "medicare-aep",
      states: [],
    });

    assert.deepEqual(result.missing, ["npn", "states"]);
    assert.equal(result.band, "critical");
  });
});
