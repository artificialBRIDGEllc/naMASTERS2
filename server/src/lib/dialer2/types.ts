export type ViewKey = 'overview' | 'phase-1' | 'phase-2' | 'phase-3';
export type WorkspaceRole = 'agent' | 'manager' | 'admin' | 'qa';
export type ComplianceBand = 'pass' | 'warning' | 'critical';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: ComplianceBand | 'neutral';
}

export interface PhaseCard {
  id: ViewKey | 'integration';
  title: string;
  subtitle: string;
  outcomes: string[];
}

export interface RoleWorkspace {
  role: WorkspaceRole;
  headline: string;
  responsibilities: string[];
  shortcuts: string[];
}

export interface ProvisioningTemplate {
  id: string;
  name: string;
  description: string;
  autoAssets: string[];
  complianceBundle: string[];
  defaultStates: string[];
}

export interface ProvisioningRequest {
  fullName: string;
  email: string;
  npn: string;
  role: WorkspaceRole;
  templateId: string;
  states: string[];
}

export interface ProvisioningTask {
  id: string;
  label: string;
  detail: string;
  status: 'queued' | 'ready' | 'done';
}

export interface ProvisioningPlan {
  request: ProvisioningRequest;
  readiness: number;
  summary: string;
  tasks: ProvisioningTask[];
}

export interface JourneyEvent {
  id: string;
  label: string;
  timestamp: string;
  detail: string;
  tone: ComplianceBand | 'neutral' | 'success';
}

export interface Journey {
  id: string;
  leadName: string;
  source: string;
  policyStatus: string;
  events: JourneyEvent[];
}

export interface CallSummary {
  id: string;
  title: string;
  queue: string;
  agent: string;
  summary: string;
  nextAction: string;
  risk: ComplianceBand;
}

export interface ResourceAsset {
  id: string;
  queue: string;
  title: string;
  type: 'script' | 'pdf' | 'faq' | 'video';
  updatedAt: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  scope: string;
  status: 'connected' | 'ready' | 'attention';
  direction: 'one-way' | 'bi-directional';
  notes: string;
}

export interface WorkflowNode {
  id: string;
  title: string;
  kind: 'intake' | 'decision' | 'routing' | 'qa' | 'save' | 'complaint' | 'close';
  description: string;
}

export interface WorkflowRule {
  id: string;
  label: string;
  rationale: string;
}

export interface WorkflowDefinition {
  id: string;
  title: string;
  prompt: string;
  nodes: WorkflowNode[];
  rules: WorkflowRule[];
}

export interface EvidenceArtifact {
  id: string;
  leadName: string;
  artifact: string;
  queue: string;
  owner: string;
  band: ComplianceBand;
  capturedAt: string;
}

export interface ComplaintCase {
  id: string;
  leadName: string;
  owner: string;
  source: string;
  severity: ComplianceBand;
  linkedEvidence: string[];
  status: 'open' | 'triage' | 'resolved';
  summary: string;
}

export interface QAScorecard {
  id: string;
  agent: string;
  queue: string;
  score: number;
  band: ComplianceBand;
  notes: string;
}

export interface LiveCall {
  id: string;
  agent: string;
  leadName: string;
  queue: string;
  risk: ComplianceBand;
  actionHint: string;
}

export interface QuoteOption {
  id: string;
  carrier: string;
  plan: string;
  premium: string;
  fit: string;
}

export interface EnrollmentLead {
  id: string;
  fullName: string;
  state: string;
  product: string;
  source: string;
  permissionsReady: boolean;
  complianceChecks: string[];
}

export interface EnrollmentSubmission {
  id: string;
  quoteId: string;
  status: 'drafted' | 'submitted';
  message: string;
}

export interface RetentionCase {
  id: string;
  member: string;
  carrier: string;
  riskLevel: ComplianceBand;
  reason: string;
  savePlay: string;
}

export interface LtvSegment {
  id: string;
  channel: string;
  carrier: string;
  closeRate: number;
  persistence: number;
  averageCommission: number;
}

export interface ReleasePack {
  id: string;
  title: string;
  status: 'available' | 'applied';
  date: string;
  changes: string[];
}

export interface PartnerConnector {
  id: string;
  name: string;
  category: string;
  status: 'beta' | 'live';
  eventBusReady: boolean;
}

export interface Dialer20Data {
  metrics: KpiMetric[];
  phaseCards: PhaseCard[];
  roles: RoleWorkspace[];
  templates: ProvisioningTemplate[];
  journeys: Journey[];
  summaries: CallSummary[];
  resources: ResourceAsset[];
  integrations: IntegrationConnection[];
  workflow: WorkflowDefinition;
  evidence: EvidenceArtifact[];
  complaints: ComplaintCase[];
  qa: QAScorecard[];
  liveCalls: LiveCall[];
  lead: EnrollmentLead;
  quotes: QuoteOption[];
  retention: RetentionCase[];
  ltvSegments: LtvSegment[];
  releases: ReleasePack[];
  partners: PartnerConnector[];
}

export interface AssistantMessage {
  author: 'assistant' | 'user';
  text: string;
}

export interface ShellState {
  view: ViewKey;
  activeRole: WorkspaceRole;
  selectedJourneyId: string;
  selectedComplaintId: string;
  selectedRetentionId: string;
  selectedQuoteId: string;
  evidenceFilter: string;
  qaFilter: 'all' | ComplianceBand;
  workflowPrompt: string;
  workflowMessage: string;
  assistantOpen: boolean;
  assistantInput: string;
  assistantMessages: AssistantMessage[];
  provisioningPlan?: ProvisioningPlan;
  enrollmentSubmission?: EnrollmentSubmission;
  appliedReleaseId?: string;
}

export interface Dialer20Adapter {
  bootstrap(): Promise<Dialer20Data>;
  provisionAgent(request: ProvisioningRequest): Promise<ProvisioningPlan>;
  generateWorkflow(prompt: string): Promise<WorkflowDefinition>;
  saveWorkflow(workflow: WorkflowDefinition): Promise<{ saved: true; version: string }>;
  submitEnrollment(quoteId: string): Promise<EnrollmentSubmission>;
  applyRelease(releaseId: string): Promise<{ applied: true; releaseId: string }>;
}
