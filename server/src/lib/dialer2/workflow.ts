import type { WorkflowDefinition, WorkflowNode, WorkflowRule } from './types';

function makeNode(id: number, title: string, kind: WorkflowNode['kind'], description: string): WorkflowNode {
  return { id: `node-${id}`, title, kind, description };
}

function rule(id: number, label: string, rationale: string): WorkflowRule {
  return { id: `rule-${id}`, label, rationale };
}

export function generateWorkflowDefinition(prompt: string): WorkflowDefinition {
  const normalized = prompt.trim().toLowerCase();
  const nodes: WorkflowNode[] = [];
  const rules: WorkflowRule[] = [];
  let title = 'Generated routing flow';

  if (normalized.includes('retention')) {
    title = 'Retention rescue workflow';
    nodes.push(
      makeNode(1, 'Intent capture', 'intake', 'Capture cancellation risk, reason code, and policy age.'),
      makeNode(2, 'Persistence decision', 'decision', 'Branch by rapid disenrollment risk and complaint history.'),
      makeNode(3, 'Save specialist route', 'routing', 'Send to best save specialist by carrier and issue type.'),
      makeNode(4, 'Save play QA', 'qa', 'Trigger QA only for high-risk or failed saves.'),
      makeNode(5, 'Retention closeout', 'save', 'Write save outcome, callback, and carrier notification.')
    );
    rules.push(
      rule(1, 'Escalate rapid disenrollment intent immediately', 'Keeps rescue SLAs tight.'),
      rule(2, 'Attach provider mismatch notes to callback', 'Improves first-call save resolution.'),
      rule(3, 'Suppress outbound retries after complaint hold', 'Prevents compounding friction.')
    );
  } else if (normalized.includes('complaint')) {
    title = 'Complaint triage workflow';
    nodes.push(
      makeNode(1, 'Case intake', 'complaint', 'Open case from transcript, voicemail, or manager report.'),
      makeNode(2, 'Evidence bundle', 'qa', 'Attach transcript, recording, script version, and coaching notes.'),
      makeNode(3, 'Supervisor route', 'routing', 'Route by severity and product line.'),
      makeNode(4, 'Root-cause review', 'decision', 'Classify script, routing, or behavior failure.'),
      makeNode(5, 'Case resolution', 'close', 'Document remediation and return-to-queue rules.')
    );
    rules.push(
      rule(1, 'Auto-link evidence on creation', 'Removes four-step manual assembly.'),
      rule(2, 'Freeze related routing template during critical review', 'Stops repeat failure during investigation.'),
      rule(3, 'Publish coaching action with resolution', 'Turns closed cases into prevention loops.')
    );
  } else {
    title = 'Medicare inbound workflow';
    nodes.push(
      makeNode(1, 'Lead intake', 'intake', 'Check publisher, state, time zone, and queue fit.'),
      makeNode(2, 'Disclosure gate', 'decision', 'Require opening disclosure before quote tools unlock.'),
      makeNode(3, 'Performance routing', 'routing', 'Rank licensed agents by fit, capacity, and close quality.'),
      makeNode(4, 'AI QA by exception', 'qa', 'Only warning or critical calls move to human review.'),
      makeNode(5, 'Evidence + close', 'close', 'Store consent, script version, summary, and next action.')
    );
    rules.push(
      rule(1, 'Do not route unlicensed states', 'Protects against compliance misses.'),
      rule(2, 'Open complaint automatically on critical disclosure miss', 'Compresses investigation handoff.'),
      rule(3, 'Queue retention when plan-fit risk is high', 'Improves long-term persistence.')
    );
  }

  return {
    id: `generated-${Date.now()}`,
    title,
    prompt,
    nodes,
    rules
  };
}
