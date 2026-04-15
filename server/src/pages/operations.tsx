import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { seedData } from "@/lib/dialer2/data";
import { buildProvisioningPlan } from "@/lib/dialer2/provisioning";
import { generateWorkflowDefinition } from "@/lib/dialer2/workflow";
import { scoreEvidenceCompleteness } from "@/lib/dialer2/compliance";
import { rankLtvSegments } from "@/lib/dialer2/ltv";
import { replyToAssistant } from "@/lib/dialer2/assistant";
import { titleCase } from "@/lib/dialer2/format";
import type {
  ViewKey,
  WorkspaceRole,
  ComplianceBand,
  ShellState,
  Dialer20Data,
  ProvisioningPlan,
  EnrollmentSubmission,
  AssistantMessage,
  WorkflowDefinition,
} from "@/lib/dialer2/types";

const data: Dialer20Data = seedData;

function toneColors(tone: string) {
  switch (tone) {
    case "pass":
    case "success":
      return "text-green-400 bg-green-500/10 border-green-500/20";
    case "warning":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "critical":
    case "danger":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-zinc-300 bg-white/[0.04] border-white/[0.07]";
  }
}

function Badge({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${toneColors(tone)}`}>
      {label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-3 rounded-full neu-inset overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function OverviewView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((m) => (
          <motion.div key={m.id} {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
            <span className="text-sm text-zinc-400">{m.label}</span>
            <div className="text-3xl font-extrabold text-white mt-1">{m.value}</div>
            <Badge label={m.delta} tone={m.tone} />
          </motion.div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold text-white mb-1">Three-phase modernization pack</h2>
        <p className="text-sm text-zinc-400 mb-4">Built to slot into a live dialer without forcing a full rewrite. Each phase is deployable on its own route.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data.phaseCards.map((card) => (
            <motion.div key={card.id} {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{card.subtitle}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate(card.id as ViewKey)}
                  className="neu-btn text-xs px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
                >
                  Open
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.outcomes.map((o) => (
                  <Badge key={o} label={o} tone="neutral" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-3">Why this kit exists</h3>
          <ul className="space-y-2">
            {[
              "Current flows show separate setup for inviting users, assigning permissions, queues, numbers, and voicemail.",
              "Outbound setup is spread across lead list import, field mapping, campaign creation, scripts, and queue rules.",
              "Complaint handling, recordings, coaching, and integrations are disconnected surfaces.",
            ].map((text, i) => (
              <li key={i} className="neu-inset rounded-xl p-3 text-sm text-zinc-300">{text}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-3">Integration seams included</h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Single adapter interface", "Host-owned telephony", "Custom-element mount", "Route manifest export", "Deterministic AI fallbacks"].map((s) => (
              <Badge key={s} label={s} tone="pass" />
            ))}
          </div>
          <p className="text-sm text-zinc-400">The host dialer stays in control of calls, permissions, and backend writes. This kit focuses on workflow orchestration, presentation, and typed seams.</p>
        </motion.div>
      </section>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1">Current friction → 2.0 upgrade map</h3>
        <p className="text-sm text-zinc-400 mb-4">Each row mirrors a public pain point and the coded module that replaces it.</p>
        <div className="neu-inset rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-white font-semibold">Current behavior</th>
                <th className="text-left p-3 text-white font-semibold">2.0 module</th>
                <th className="text-left p-3 text-white font-semibold">Benefit</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Separate setup for user, queue, number, and voicemail", "Phase 1 provisioning wizard", "One readiness flow with template-driven automation"],
                ["Manual campaign and routing configuration", "Phase 2 routing studio + NL builder", "Safer workflow creation with fewer setup misses"],
                ["Complaint and QA evidence assembled in multiple screens", "Evidence vault + complaint auto-linking", "Faster triage and audit readiness"],
                ["Agent workflow split across dialer, resources, and enrollment tools", "Phase 3 enrollment workbench", "Higher conversion quality with lower tab-switch cost"],
              ].map(([current, module, benefit], i) => (
                <tr key={i} className="border-b border-white/5 neu-table-row">
                  <td className="p-3 text-zinc-400">{current}</td>
                  <td className="p-3 text-zinc-300">{module}</td>
                  <td className="p-3 text-zinc-300">{benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhaseOneView() {
  const [activeRole, setActiveRole] = useState<WorkspaceRole>("agent");
  const [selectedJourneyId, setSelectedJourneyId] = useState(data.journeys[0]?.id ?? "");
  const [plan, setPlan] = useState<ProvisioningPlan | null>(null);
  const [formData, setFormData] = useState({
    fullName: "Jordan Mercer",
    email: "jordan@agency.example",
    npn: "4455667",
    templateId: data.templates[0]?.id ?? "",
    role: "agent" as WorkspaceRole,
    states: "TX, FL, PA",
  });

  const role = data.roles.find((r) => r.role === activeRole) ?? data.roles[0]!;
  const journey = data.journeys.find((j) => j.id === selectedJourneyId) ?? data.journeys[0]!;

  const handleProvision = useCallback(() => {
    const template = data.templates.find((t) => t.id === formData.templateId) ?? data.templates[0]!;
    const result = buildProvisioningPlan(
      { ...formData, states: formData.states.split(",").map((s) => s.trim()) },
      template
    );
    setPlan(result);
  }, [formData]);

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Phase 1 — simplify the front door</h2>
            <p className="text-sm text-zinc-400">One identity, one provisioning flow, clearer journey visibility, and resources embedded where agents already work.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.roles.map((r) => (
              <motion.button
                key={r.role}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveRole(r.role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  r.role === activeRole
                    ? "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {titleCase(r.role)} workspace
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">{role.headline}</h3>
              <p className="text-sm text-zinc-400 mt-1">Role-aware shortcuts and responsibilities surfaced from the same identity.</p>
            </div>
            <Badge label={`${titleCase(role.role)} active`} tone="pass" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Responsibilities</h4>
              <ul className="space-y-1.5">
                {role.responsibilities.map((item, i) => (
                  <li key={i} className="neu-inset rounded-lg p-2.5 text-xs text-zinc-300">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Pinned shortcuts</h4>
              <ul className="space-y-1.5">
                {role.shortcuts.map((item, i) => (
                  <li key={i} className="neu-inset rounded-lg p-2.5 text-xs text-zinc-300">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Template provisioning wizard</h3>
              <p className="text-sm text-zinc-400 mt-1">Auto-attaches queues, numbers, voicemail, scripts, and compliance tasks.</p>
            </div>
            {plan ? <Badge label={`${plan.readiness}% ready`} tone="pass" /> : <Badge label="Awaiting run" tone="warning" />}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">Full name</span>
                <input className="neu-input text-sm" value={formData.fullName} onChange={(e) => setFormData((f) => ({ ...f, fullName: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">Email</span>
                <input className="neu-input text-sm" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">NPN</span>
                <input className="neu-input text-sm" value={formData.npn} onChange={(e) => setFormData((f) => ({ ...f, npn: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">Template</span>
                <select className="neu-input text-sm" value={formData.templateId} onChange={(e) => setFormData((f) => ({ ...f, templateId: e.target.value }))}>
                  {data.templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">Role</span>
                <select className="neu-input text-sm" value={formData.role} onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value as WorkspaceRole }))}>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="qa">QA</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">Licensed states</span>
                <input className="neu-input text-sm" value={formData.states} onChange={(e) => setFormData((f) => ({ ...f, states: e.target.value }))} />
              </label>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProvision}
              className="neu-btn-primary w-full py-2.5 rounded-xl text-sm font-semibold"
            >
              Generate readiness plan
            </motion.button>
          </div>

          <AnimatePresence>
            {plan && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                <div className="neu-inset rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">{plan.summary}</span>
                    <Badge label="Auto-provisioned" tone="pass" />
                  </div>
                  <ProgressBar value={plan.readiness} />
                  <ul className="space-y-2 mt-3">
                    {plan.tasks.map((task) => (
                      <li key={task.id} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{task.label}</span>
                          <Badge label={task.status} tone={task.status === "done" ? "pass" : "warning"} />
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block">{task.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Journey graph</h3>
              <p className="text-sm text-zinc-400 mt-1">Source, call, evidence, quote, policy, complaint, and payout signals on one timeline.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.journeys.map((j) => (
                <motion.button
                  key={j.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedJourneyId(j.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    j.id === selectedJourneyId
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white"
                  }`}
                >
                  {j.leadName}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="neu-inset rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{journey.leadName}</span>
                <span className="text-xs text-zinc-400 block">{journey.source}</span>
              </div>
              <Badge label={journey.policyStatus} tone={journey.policyStatus.toLowerCase().includes("pending") ? "warning" : "pass"} />
            </div>
          </div>
          <div className="space-y-3 relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-blue-500/20 rounded-full" />
            {journey.events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-5"
              >
                <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{event.label}</span>
                  <Badge label={event.timestamp} tone={event.tone} />
                </div>
                <span className="text-xs text-zinc-400">{event.detail}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-3">AI summaries + embedded resources</h3>
          <div className="space-y-3">
            {data.summaries.map((s) => (
              <div key={s.id} className="neu-inset rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{s.title}</span>
                  <Badge label={s.risk} tone={s.risk} />
                </div>
                <span className="text-xs text-zinc-500">{s.agent} · {s.queue}</span>
                <p className="text-sm text-zinc-300 mt-1">{s.summary}</p>
                <div className="bg-white/[0.03] rounded-lg p-2 mt-2 border border-white/5 text-xs text-zinc-400">
                  Next action: {s.nextAction}
                </div>
              </div>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-white mt-4 mb-2">Queue resource hub</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.resources.map((r) => (
              <Badge key={r.id} label={`${r.queue} · ${r.title} · ${r.updatedAt}`} tone="neutral" />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1">Self-serve integration center</h3>
        <p className="text-sm text-zinc-400 mb-4">Swap support-dependent setup for explicit status, data direction, and host-owned connector contracts.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.integrations.map((int) => (
            <div key={int.id} className="neu-inset rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-semibold text-white">{int.name}</span>
                  <span className="text-xs text-zinc-400 block">{int.scope}</span>
                </div>
                <Badge label={int.status} tone={int.status === "connected" ? "pass" : int.status === "attention" ? "warning" : "neutral"} />
              </div>
              <span className="text-xs text-zinc-400">{int.direction} · {int.notes}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhaseTwoView() {
  const [evidenceFilter, setEvidenceFilter] = useState("");
  const [qaFilter, setQaFilter] = useState<"all" | ComplianceBand>("all");
  const [selectedComplaintId, setSelectedComplaintId] = useState(data.complaints[0]?.id ?? "");
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(data.workflow);
  const [workflowPrompt, setWorkflowPrompt] = useState(data.workflow.prompt);
  const [workflowMsg, setWorkflowMsg] = useState("");

  const evidenceItems = evidenceFilter
    ? data.evidence.filter((a) => {
        const m = evidenceFilter.toLowerCase();
        return a.leadName.toLowerCase().includes(m) || a.queue.toLowerCase().includes(m) || a.artifact.toLowerCase().includes(m);
      })
    : data.evidence;
  const qaRows = qaFilter === "all" ? data.qa : data.qa.filter((c) => c.band === qaFilter);
  const selectedComplaint = data.complaints.find((c) => c.id === selectedComplaintId) ?? data.complaints[0]!;
  const complianceScore = scoreEvidenceCompleteness(data.evidence);

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Phase 2 — operational intelligence</h2>
          <p className="text-sm text-zinc-400">Move routing, QA, and complaints into visual systems with policy-aware automation.</p>
        </div>
        <Badge label={`${complianceScore}% evidence completeness`} tone={complianceScore >= 90 ? "pass" : complianceScore >= 70 ? "warning" : "critical"} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Routing studio + NL builder</h3>
              <p className="text-sm text-zinc-400 mt-1">Generate workflows from business language, inspect nodes, save JSON back to config.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (workflow.nodes.length > 0) setWorkflowMsg("Workflow definition saved locally.");
              }}
              className="neu-btn text-xs px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
            >
              Save workflow
            </motion.button>
          </div>
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Describe the workflow</span>
              <textarea
                className="neu-input text-sm min-h-[100px] resize-y"
                value={workflowPrompt}
                onChange={(e) => setWorkflowPrompt(e.target.value)}
              />
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const wf = generateWorkflowDefinition(workflowPrompt);
                  setWorkflow(wf);
                  setWorkflowMsg("Flow generated successfully.");
                }}
                className="neu-btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Generate routing flow
              </motion.button>
              {workflowMsg && <span className="text-xs text-green-400">{workflowMsg}</span>}
            </div>
          </div>
          <div className="neu-inset rounded-xl p-3 mt-4 mb-4">
            <span className="text-sm font-semibold text-white">{workflow.title}</span>
            <span className="text-xs text-zinc-400 block">{workflow.prompt}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {workflow.nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="bg-blue-500/[0.06] border border-blue-500/15 rounded-xl p-3"
              >
                <Badge label={node.kind} tone="neutral" />
                <h4 className="text-xs font-semibold text-white mt-2 mb-1">{node.title}</h4>
                <span className="text-[11px] text-zinc-400 leading-relaxed">{node.description}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {workflow.rules.map((r) => (
              <Badge key={r.id} label={r.label} tone="neutral" />
            ))}
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Supervisor by exception</h3>
              <p className="text-sm text-zinc-400 mt-1">Only live conversations requiring whisper, barge, or follow-up.</p>
            </div>
            <Badge label={`${data.liveCalls.length} live calls`} tone="neutral" />
          </div>
          <div className="space-y-3">
            {data.liveCalls.map((call) => (
              <div key={call.id} className="neu-inset rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{call.agent} · {call.queue}</span>
                  <Badge label={call.risk} tone={call.risk} />
                </div>
                <span className="text-xs text-zinc-400">Lead: {call.leadName}</span>
                <p className="text-sm text-zinc-300 mt-1">{call.actionHint}</p>
                <div className="flex gap-2 mt-2">
                  {["Listen", "Whisper"].map((a) => (
                    <motion.button key={a} whileTap={{ scale: 0.95 }} className="neu-btn text-xs px-3 py-1.5 rounded-lg text-white">{a}</motion.button>
                  ))}
                  <motion.button whileTap={{ scale: 0.95 }} className="neu-btn-primary text-xs px-3 py-1.5 rounded-lg">Barge</motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Compliance evidence vault</h3>
              <p className="text-sm text-zinc-400 mt-1">Search by lead, queue, or evidence type.</p>
            </div>
            <input
              className="neu-input text-sm max-w-[200px]"
              placeholder="Filter evidence"
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
            />
          </div>
          <div className="neu-inset rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Lead", "Artifact", "Queue", "Owner", "Band"].map((h) => (
                    <th key={h} className="text-left p-3 text-white font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evidenceItems.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 neu-table-row">
                    <td className="p-3 text-zinc-300 text-xs">{a.leadName}</td>
                    <td className="p-3 text-zinc-300 text-xs">{a.artifact}</td>
                    <td className="p-3 text-zinc-400 text-xs">{a.queue}</td>
                    <td className="p-3 text-zinc-400 text-xs">{a.owner}</td>
                    <td className="p-3"><Badge label={a.band} tone={a.band} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Complaint auto-linking</h3>
              <p className="text-sm text-zinc-400 mt-1">Cases open with evidence already attached.</p>
            </div>
            <div className="flex gap-1.5">
              {data.complaints.map((c) => (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedComplaintId(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    c.id === selectedComplaintId
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white"
                  }`}
                >
                  {c.leadName}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="neu-inset rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{selectedComplaint.leadName}</span>
              <Badge label={selectedComplaint.status} tone={selectedComplaint.severity} />
            </div>
            <span className="text-xs text-zinc-400">Owner: {selectedComplaint.owner} · Source: {selectedComplaint.source}</span>
            <p className="text-sm text-zinc-300 mt-2">{selectedComplaint.summary}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedComplaint.linkedEvidence.map((e) => (
                <Badge key={e} label={e} tone="neutral" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">QA scorecards</h3>
            <p className="text-sm text-zinc-400 mt-1">AI scoring, then only warning and critical calls go to human QA.</p>
          </div>
          <div className="flex gap-1.5">
            {(["all", "pass", "warning", "critical"] as const).map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQaFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  f === qaFilter
                    ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white"
                }`}
              >
                {titleCase(f)}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {qaRows.map((card) => (
            <div key={card.id} className="neu-inset rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{card.agent} · {card.queue}</span>
                <Badge label={String(card.score)} tone={card.band} />
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500/80 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${card.score}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
              <span className="text-xs text-zinc-400">{card.notes}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhaseThreeView() {
  const [selectedRetentionId, setSelectedRetentionId] = useState(data.retention[0]?.id ?? "");
  const [selectedQuoteId, setSelectedQuoteId] = useState(data.quotes[0]?.id ?? "");
  const [enrollment, setEnrollment] = useState<EnrollmentSubmission | null>(null);
  const [appliedReleaseId, setAppliedReleaseId] = useState<string | null>(null);

  const selectedRetention = data.retention.find((r) => r.id === selectedRetentionId) ?? data.retention[0]!;
  const rankedSegments = rankLtvSegments(data.ltvSegments);

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white">Phase 3 — end-to-end Medicare OS</h2>
        <p className="text-sm text-zinc-400">Unify quoting, enrollment, persistence, regulatory change, and partner connectivity inside the same journey-aware workspace.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Enrollment workbench</h3>
              <p className="text-sm text-zinc-400 mt-1">Lead context, compliance gates, quote comparison, and submission in one screen.</p>
            </div>
            <Badge label={data.lead.permissionsReady ? "Ready to enroll" : "Blocked"} tone={data.lead.permissionsReady ? "pass" : "critical"} />
          </div>
          <div className="neu-inset rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{data.lead.fullName}</span>
                <span className="text-xs text-zinc-400 block">{data.lead.product} · {data.lead.state} · {data.lead.source}</span>
              </div>
              <Badge label="Journey linked" tone="pass" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {data.lead.complianceChecks.map((c) => (
                <Badge key={c} label={c} tone="neutral" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Recommended quote</span>
              <select className="neu-input text-sm" value={selectedQuoteId} onChange={(e) => setSelectedQuoteId(e.target.value)}>
                {data.quotes.map((q) => (
                  <option key={q.id} value={q.id}>{q.carrier} · {q.plan} · {q.premium}</option>
                ))}
              </select>
            </label>
            <div className="neu-inset rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Carrier", "Plan", "Premium", "Fit"].map((h) => (
                      <th key={h} className="text-left p-3 text-white font-semibold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.quotes.map((q) => (
                    <tr key={q.id} className="border-b border-white/5 neu-table-row">
                      <td className="p-3 text-zinc-300 text-xs">{q.carrier}</td>
                      <td className="p-3 text-zinc-300 text-xs">{q.plan}</td>
                      <td className="p-3 text-zinc-300 text-xs">{q.premium}</td>
                      <td className="p-3 text-zinc-400 text-xs">{q.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEnrollment({ id: `enr-${Date.now()}`, quoteId: selectedQuoteId, status: "submitted", message: "Enrollment submitted to carrier. Confirmation expected within 24 hours." })}
                className="neu-btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Submit enrollment
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="neu-btn px-4 py-2 rounded-xl text-sm text-white">Schedule callback</motion.button>
            </div>
          </div>
          <AnimatePresence>
            {enrollment && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                <div className="neu-inset rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{enrollment.id}</span>
                    <Badge label={enrollment.status} tone={enrollment.status === "submitted" ? "pass" : "warning"} />
                  </div>
                  <span className="text-xs text-zinc-400">{enrollment.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Retention rescue</h3>
              <p className="text-sm text-zinc-400 mt-1">Trigger save plays from persistence risk, complaint pressure, and churn signals.</p>
            </div>
            <div className="flex gap-1.5">
              {data.retention.map((r) => (
                <motion.button
                  key={r.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRetentionId(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    r.id === selectedRetentionId
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white"
                  }`}
                >
                  {r.member}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="neu-inset rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{selectedRetention.member} · {selectedRetention.carrier}</span>
              <Badge label={selectedRetention.riskLevel} tone={selectedRetention.riskLevel} />
            </div>
            <span className="text-xs text-zinc-400">{selectedRetention.reason}</span>
            <p className="text-sm text-zinc-300 mt-2">{selectedRetention.savePlay}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge label="Persistence rules attached" tone="pass" />
            <Badge label="Complaint hold guardrail" tone="pass" />
            <Badge label="Supervisor approval path" tone="pass" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-1">LTV optimizer</h3>
          <p className="text-sm text-zinc-400 mb-4">Rank channels by close rate, persistence, and commission contribution.</p>
          <div className="neu-inset rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Channel", "Carrier", "Close rate", "Persistence", "Avg commission", "Opportunity"].map((h) => (
                    <th key={h} className="text-left p-3 text-white font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankedSegments.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 neu-table-row">
                    <td className="p-3 text-zinc-300 text-xs">{s.channel}</td>
                    <td className="p-3 text-zinc-300 text-xs">{s.carrier}</td>
                    <td className="p-3 text-zinc-300 text-xs">{Math.round(s.closeRate * 100)}%</td>
                    <td className="p-3 text-zinc-300 text-xs">{Math.round(s.persistence * 100)}%</td>
                    <td className="p-3 text-zinc-300 text-xs">${s.averageCommission}</td>
                    <td className="p-3"><Badge label={String(s.opportunityScore)} tone={s.opportunityScore >= 70 ? "pass" : "warning"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Regulatory release manager</h3>
              <p className="text-sm text-zinc-400 mt-1">Ship new script versions, QA rubrics, and evidence rules as one release pack.</p>
            </div>
            {appliedReleaseId ? <Badge label="Pack applied" tone="pass" /> : <Badge label="Pending action" tone="warning" />}
          </div>
          <div className="space-y-3">
            {data.releases.map((release) => (
              <div key={release.id} className="neu-inset rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-white">{release.title}</span>
                    <span className="text-xs text-zinc-400 block">{release.date}</span>
                  </div>
                  <Badge
                    label={release.status === "applied" || release.id === appliedReleaseId ? "applied" : release.status}
                    tone={release.status === "applied" || release.id === appliedReleaseId ? "pass" : "warning"}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {release.changes.map((c) => (
                    <Badge key={c} label={c} tone="neutral" />
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAppliedReleaseId(release.id)}
                  className="neu-btn text-xs px-3 py-1.5 rounded-lg text-white"
                >
                  Apply pack
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1">Marketplace + event bus seam</h3>
        <p className="text-sm text-zinc-400 mb-4">Connectors as products with typed event publication.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.partners.map((p) => (
            <div key={p.id} className="neu-inset rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <Badge label={p.status} tone={p.status === "live" ? "pass" : "warning"} />
              </div>
              <span className="text-xs text-zinc-400">{p.category} connector</span>
              <div className="mt-2">
                <Badge label={p.eventBusReady ? "Event bus ready" : "Needs event adapter"} tone={p.eventBusReady ? "pass" : "warning"} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const TAB_ITEMS: { key: ViewKey; label: string; teaser: string }[] = [
  { key: "overview", label: "Overview", teaser: "Upgrade map & seams" },
  { key: "phase-1", label: "Phase 1", teaser: "Onboarding & journeys" },
  { key: "phase-2", label: "Phase 2", teaser: "Routing & compliance" },
  { key: "phase-3", label: "Phase 3", teaser: "Enrollment & LTV" },
];

export default function OperationsPage() {
  const [view, setView] = useState<ViewKey>("overview");
  const [assistOpen, setAssistOpen] = useState(false);
  const [assistInput, setAssistInput] = useState("");
  const [assistMessages, setAssistMessages] = useState<AssistantMessage[]>([
    { author: "assistant", text: "Welcome to Agent Assist. Ask about onboarding, routing, complaints, retention, or any 2.0 module." },
  ]);

  const handleAssistSubmit = useCallback(() => {
    if (!assistInput.trim()) return;
    const userMsg: AssistantMessage = { author: "user", text: assistInput.trim() };
    const reply = replyToAssistant(assistInput, view);
    setAssistMessages((prev) => [...prev, userMsg, reply]);
    setAssistInput("");
  }, [assistInput, view]);

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Dialer 2.0 Operations
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-[70ch]">
              Framework-neutral, compliance-aware workspace pack — plugs into the live dialer with lower rewrite risk than a full frontend replacement.
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAssistOpen((o) => !o)}
              className="neu-btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
            >
              {assistOpen ? "Close Assist" : "Agent Assist"}
            </motion.button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {TAB_ITEMS.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                tab.key === view
                  ? "neu-btn-primary border-blue-500/30 shadow-[0_0_16px_rgba(59,130,246,0.2)]"
                  : "neu-raised border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="font-semibold">{tab.label}</span>
              <span className="text-xs opacity-60 ml-1.5 hidden sm:inline">· {tab.teaser}</span>
            </motion.button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {view === "overview" && <OverviewView onNavigate={setView} />}
            {view === "phase-1" && <PhaseOneView />}
            {view === "phase-2" && <PhaseTwoView />}
            {view === "phase-3" && <PhaseThreeView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {assistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-5 bottom-5 z-50 w-[min(380px,calc(100vw-40px))]"
          >
            <div className="neu-raised rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-bold text-white">Agent Assist</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAssistOpen(false)}
                  className="text-zinc-400 hover:text-white text-xs"
                >
                  Close
                </motion.button>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-3 space-y-2">
                {assistMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-3 py-2 rounded-xl text-sm max-w-[92%] ${
                      msg.author === "user"
                        ? "ml-auto neu-chat-bubble-user text-white"
                        : "neu-chat-bubble-ai text-zinc-300"
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleAssistSubmit(); }}
                className="flex gap-2 p-3 border-t border-white/5"
              >
                <input
                  className="neu-input text-sm flex-1"
                  placeholder="Ask about onboarding, routing, complaints..."
                  value={assistInput}
                  onChange={(e) => setAssistInput(e.target.value)}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="neu-btn-primary px-3 py-2 rounded-xl text-sm font-semibold"
                >
                  Ask
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
