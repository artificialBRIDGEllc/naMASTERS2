import type { Dialer20Data } from './types';

export const seedData: Dialer20Data = {
  metrics: [
    { id: 'cpa', label: 'Cost per sale', value: '$128', delta: '-18% vs baseline', tone: 'pass' },
    { id: 'agents', label: 'Ready agents', value: '46', delta: '+12 auto-provisioned', tone: 'neutral' },
    { id: 'risk', label: 'Live risk alerts', value: '4', delta: '2 auto-contained', tone: 'warning' },
    { id: 'saves', label: 'Retention rescues', value: '31', delta: '+9 this week', tone: 'pass' }
  ],
  phaseCards: [
    {
      id: 'phase-1',
      title: 'Phase 1 — Simplify the front door',
      subtitle: 'Single identity, guided onboarding, journey visibility, AI summaries, in-app resources, and self-serve integrations.',
      outcomes: ['Lower admin setup time', 'Fewer queue / number misses', 'Faster agent readiness']
    },
    {
      id: 'phase-2',
      title: 'Phase 2 — Operational intelligence',
      subtitle: 'Routing studio, workflow generator, evidence vault, complaint auto-linking, QA by exception, and supervisor controls.',
      outcomes: ['Less manual QA', 'Faster complaint handling', 'Safer routing changes']
    },
    {
      id: 'phase-3',
      title: 'Phase 3 — End-to-end Medicare OS',
      subtitle: 'Enrollment workbench, retention rescue, LTV optimization, release management, and marketplace/event bus seams.',
      outcomes: ['Higher close quality', 'Better persistence', 'Clearer margin control']
    }
  ],
  roles: [
    {
      role: 'agent',
      headline: 'One workbench to handle the call, quote, evidence, and follow-up.',
      responsibilities: ['Use guided script blocks', 'See source + journey context', 'Submit enrollment without tab switching'],
      shortcuts: ['Open workbench', 'Review AI summary', 'Schedule callback']
    },
    {
      role: 'manager',
      headline: 'Monitor readiness, coach by exception, and keep queues flowing.',
      responsibilities: ['Approve provisioning exceptions', 'Review live risk alerts', 'Reassign workflows and complaints'],
      shortcuts: ['Open supervisor desk', 'Review QA flags', 'Check appointment load']
    },
    {
      role: 'admin',
      headline: 'Provision once, template everything, and ship policy-safe operations.',
      responsibilities: ['Map templates to queues', 'Manage integrations', 'Apply regulatory packs'],
      shortcuts: ['Run onboarding wizard', 'Open routing studio', 'Sync connectors']
    },
    {
      role: 'qa',
      headline: 'Work from risk-ranked evidence instead of sampling blindly.',
      responsibilities: ['Review critical calls', 'Resolve complaint evidence gaps', 'Calibrate policy packs'],
      shortcuts: ['Open evidence vault', 'Review complaint cases', 'Export audit packet']
    }
  ],
  templates: [
    {
      id: 'medicare-inbound',
      name: 'Medicare inbound seller',
      description: 'For queue-based Medicare inbound sales with compliance scoring and quote handoff.',
      autoAssets: ['Queue membership', 'Callback number', 'Voicemail greeting', 'Script pack', 'QA rubric'],
      complianceBundle: ['SOA checklist', 'Disclosure card', 'Recording retention', 'Licensing guardrail'],
      defaultStates: ['TX', 'FL', 'PA']
    },
    {
      id: 'retention-specialist',
      name: 'Retention specialist',
      description: 'For disenrollment rescue and post-sale persistence workflows.',
      autoAssets: ['Retention queue', 'Save playbook', 'Renewal follow-ups', 'Escalation rule'],
      complianceBundle: ['Rapid disenrollment review', 'Complaint trigger watch', 'Callback SLA'],
      defaultStates: ['AZ', 'NV', 'TX']
    },
    {
      id: 'manager-agent',
      name: 'Manager + agent hybrid',
      description: 'For leaders who coach live but still need a selling workspace without separate browsers.',
      autoAssets: ['Role switcher', 'Supervisor barge tools', 'Agent dialer badge', 'Dual workflow home'],
      complianceBundle: ['Privileged action logging', 'Coaching audit trail', 'Call intervention notes'],
      defaultStates: ['FL', 'GA']
    }
  ],
  journeys: [
    {
      id: 'journey-1',
      leadName: 'Mary Holloway',
      source: 'Publisher 12 / Medicare inbound',
      policyStatus: 'Submitted — pending carrier ACK',
      events: [
        { id: 'j1-1', label: 'Lead created', timestamp: '09:12 AM', detail: 'Publisher 12 passed call with state pre-check.', tone: 'neutral' },
        { id: 'j1-2', label: 'Sales call recorded', timestamp: '09:14 AM', detail: 'Transcript captured and scored in real time.', tone: 'pass' },
        { id: 'j1-3', label: 'SOA captured', timestamp: '09:16 AM', detail: 'Consent artifact attached to journey graph.', tone: 'pass' },
        { id: 'j1-4', label: 'Quote selected', timestamp: '09:19 AM', detail: 'Plan Horizon Gold chosen after comparison.', tone: 'success' },
        { id: 'j1-5', label: 'Carrier ACK pending', timestamp: '09:21 AM', detail: 'Waiting on downstream policy confirmation.', tone: 'warning' }
      ]
    },
    {
      id: 'journey-2',
      leadName: 'Victor Greene',
      source: 'Warm transfer / Final expense',
      policyStatus: 'Complaint triage open',
      events: [
        { id: 'j2-1', label: 'Screened transfer accepted', timestamp: '10:02 AM', detail: 'Warm transfer verified with screening notes.', tone: 'neutral' },
        { id: 'j2-2', label: 'Disclosure gap flagged', timestamp: '10:09 AM', detail: 'AI found missing disclosure sentence.', tone: 'critical' },
        { id: 'j2-3', label: 'Complaint auto-created', timestamp: '10:14 AM', detail: 'Evidence packet linked to manager review.', tone: 'warning' },
        { id: 'j2-4', label: 'Coaching assigned', timestamp: '10:18 AM', detail: 'Supervisor set whisper rehearsal task.', tone: 'warning' }
      ]
    }
  ],
  summaries: [
    {
      id: 'sum-1',
      title: 'Mary Holloway follow-up summary',
      queue: 'Medicare Inbound',
      agent: 'Taylor Reese',
      summary: 'Customer accepted Horizon Gold after drug coverage comparison. Transcript includes clean disclosure flow and SOA capture.',
      nextAction: 'Check carrier ACK in 30 minutes and schedule plan welcome callback.',
      risk: 'pass'
    },
    {
      id: 'sum-2',
      title: 'Victor Greene save attempt',
      queue: 'Retention Rescue',
      agent: 'Noah Blake',
      summary: 'Member expressed cost concern and confusion around provider network. AI summary recommends provider lookup before next contact.',
      nextAction: 'Route to retention specialist with provider crosswalk attached.',
      risk: 'warning'
    },
    {
      id: 'sum-3',
      title: 'Complaint-ready evidence brief',
      queue: 'Final Expense',
      agent: 'Ava Johnson',
      summary: 'Transcript shows fast script skip near required disclosure. Evidence bundle pre-built for QA and complaint response.',
      nextAction: 'Approve remediation script pack before agent returns to queue.',
      risk: 'critical'
    }
  ],
  resources: [
    { id: 'res-1', queue: 'Medicare Inbound', title: '2026 disclaimer block', type: 'script', updatedAt: 'Mar 12' },
    { id: 'res-2', queue: 'Retention Rescue', title: 'Save playbook / premium objection', type: 'faq', updatedAt: 'Mar 10' },
    { id: 'res-3', queue: 'Direct to Agent', title: 'Callback promise standards', type: 'video', updatedAt: 'Mar 08' },
    { id: 'res-4', queue: 'Compliance', title: 'SOA timing checklist', type: 'pdf', updatedAt: 'Mar 05' }
  ],
  integrations: [
    { id: 'int-1', name: 'GoHighLevel', scope: 'Lead sync + activity', status: 'attention', direction: 'bi-directional', notes: 'Promote to self-serve OAuth and field mapping.' },
    { id: 'int-2', name: 'Quote & Enroll Adapter', scope: 'Plan compare + submit', status: 'connected', direction: 'bi-directional', notes: 'Embedded in workbench.' },
    { id: 'int-3', name: 'Warehouse Export', scope: 'Journeys + commissions', status: 'ready', direction: 'one-way', notes: 'Event bus compatible.' }
  ],
  workflow: {
    id: 'wf-1',
    title: 'Medicare inbound fast path',
    prompt: 'Build a compliant Medicare inbound flow with complaint auto-linking and QA by exception.',
    nodes: [
      { id: 'node-1', title: 'Lead intake', kind: 'intake', description: 'Accept publisher call only after state + time-zone gate passes.' },
      { id: 'node-2', title: 'Disclosure checkpoint', kind: 'decision', description: 'Require opening disclosure before quote access unlocks.' },
      { id: 'node-3', title: 'Performance routing', kind: 'routing', description: 'Rank agents by licensure, fit score, and queue capacity.' },
      { id: 'node-4', title: 'AI QA', kind: 'qa', description: 'Send only warning/critical calls to human review.' },
      { id: 'node-5', title: 'Close + save', kind: 'close', description: 'Attach evidence, schedule callback, and queue retention if risk appears.' }
    ],
    rules: [
      { id: 'rule-1', label: 'Do not route if state is unlicensed', rationale: 'Prevents misrouted sales calls.' },
      { id: 'rule-2', label: 'Auto-create complaint case on critical disclosure miss', rationale: 'Cuts manual handoff time.' },
      { id: 'rule-3', label: 'Attach script version to evidence packet', rationale: 'Improves audit readiness.' }
    ]
  },
  evidence: [
    { id: 'ev-1', leadName: 'Mary Holloway', artifact: 'Recording + transcript', queue: 'Medicare Inbound', owner: 'Taylor Reese', band: 'pass', capturedAt: '09:14 AM' },
    { id: 'ev-2', leadName: 'Victor Greene', artifact: 'Disclosure exception packet', queue: 'Final Expense', owner: 'Ava Johnson', band: 'critical', capturedAt: '10:09 AM' },
    { id: 'ev-3', leadName: 'Stella Brown', artifact: 'SOA capture receipt', queue: 'Retention Rescue', owner: 'Noah Blake', band: 'pass', capturedAt: '11:22 AM' },
    { id: 'ev-4', leadName: 'Adam Cross', artifact: 'Barge intervention note', queue: 'Direct to Agent', owner: 'Lena Cruz', band: 'warning', capturedAt: '11:41 AM' }
  ],
  complaints: [
    {
      id: 'cmp-1',
      leadName: 'Victor Greene',
      owner: 'Lena Cruz',
      source: 'Final Expense',
      severity: 'critical',
      linkedEvidence: ['Recording', 'Transcript', 'Script version', 'QA note'],
      status: 'triage',
      summary: 'Disclosure sequence incomplete before product explanation.'
    },
    {
      id: 'cmp-2',
      leadName: 'Nina Burke',
      owner: 'Milo Ross',
      source: 'Medicare Inbound',
      severity: 'warning',
      linkedEvidence: ['Call summary', 'Disposition trail'],
      status: 'open',
      summary: 'Customer disputed callback timing after after-hours voicemail.'
    }
  ],
  qa: [
    { id: 'qa-1', agent: 'Taylor Reese', queue: 'Medicare Inbound', score: 96, band: 'pass', notes: 'Strong pacing and disclosure timing.' },
    { id: 'qa-2', agent: 'Ava Johnson', queue: 'Final Expense', score: 72, band: 'warning', notes: 'Needs coaching on scripted transition.' },
    { id: 'qa-3', agent: 'Noah Blake', queue: 'Retention Rescue', score: 88, band: 'pass', notes: 'Good save-play execution.' },
    { id: 'qa-4', agent: 'Lena Cruz', queue: 'Direct to Agent', score: 61, band: 'critical', notes: 'Intervention log incomplete.' }
  ],
  liveCalls: [
    { id: 'call-1', agent: 'Taylor Reese', leadName: 'Mary Holloway', queue: 'Medicare Inbound', risk: 'pass', actionHint: 'No intervention needed — coach after call.' },
    { id: 'call-2', agent: 'Ava Johnson', leadName: 'Victor Greene', queue: 'Final Expense', risk: 'critical', actionHint: 'Barge recommended — disclosure miss active.' },
    { id: 'call-3', agent: 'Noah Blake', leadName: 'Stella Brown', queue: 'Retention Rescue', risk: 'warning', actionHint: 'Whisper provider-network reminder.' }
  ],
  lead: {
    id: 'lead-1',
    fullName: 'Mary Holloway',
    state: 'TX',
    product: 'MAPD',
    source: 'Publisher 12 / Medicare inbound',
    permissionsReady: true,
    complianceChecks: ['Recording on', 'SOA pending confirmation', 'State licensed', 'Script version 2026.3']
  },
  quotes: [
    { id: 'quote-1', carrier: 'Horizon', plan: 'Gold PPO', premium: '$0', fit: 'Best drug coverage' },
    { id: 'quote-2', carrier: 'BridgeCare', plan: 'Secure HMO', premium: '$12', fit: 'Lower PCP copay' },
    { id: 'quote-3', carrier: 'North Star', plan: 'Choice PPO', premium: '$19', fit: 'Broader provider access' }
  ],
  retention: [
    { id: 'ret-1', member: 'Stella Brown', carrier: 'Horizon', riskLevel: 'warning', reason: 'Provider mismatch concern', savePlay: 'Route to network specialist + callback in 24h' },
    { id: 'ret-2', member: 'Leon Watson', carrier: 'BridgeCare', riskLevel: 'critical', reason: 'Rapid disenrollment intent', savePlay: 'Priority save desk + supervisor approval' },
    { id: 'ret-3', member: 'Gina Perez', carrier: 'North Star', riskLevel: 'pass', reason: 'Price comparison shopping', savePlay: 'Reinforce ancillary benefit value' }
  ],
  ltvSegments: [
    { id: 'ltv-1', channel: 'Publisher 12', carrier: 'Horizon', closeRate: 0.34, persistence: 0.91, averageCommission: 412 },
    { id: 'ltv-2', channel: 'Warm transfer', carrier: 'North Star', closeRate: 0.29, persistence: 0.88, averageCommission: 436 },
    { id: 'ltv-3', channel: 'Retention rescue', carrier: 'BridgeCare', closeRate: 0.22, persistence: 0.95, averageCommission: 380 }
  ],
  releases: [
    { id: 'rel-1', title: 'CMS 2026 agent guidance pack', status: 'available', date: 'Mar 02', changes: ['Update disclosure cards', 'Refresh QA rubric', 'Version new evidence checklist'] },
    { id: 'rel-2', title: 'Retention compliance patch', status: 'applied', date: 'Feb 18', changes: ['Add save-call disclaimer', 'New callback SLA watch'] }
  ],
  partners: [
    { id: 'prt-1', name: 'CRM Connector', category: 'CRM', status: 'live', eventBusReady: true },
    { id: 'prt-2', name: 'Carrier Event Feed', category: 'Carrier', status: 'beta', eventBusReady: true },
    { id: 'prt-3', name: 'QA Warehouse Sync', category: 'Data', status: 'live', eventBusReady: false }
  ]
};
