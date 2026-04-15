import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import {
  useSovereignHealth, useSovereignMemoryStats, useSovereignEntities,
  useSovereignGraphStats, useSovereignRelationships, useSovereignComplianceReport,
  useSovereignAudit, useSovereignVoiceSession, useSovereignVoiceTranscript,
  useSovereignVoiceSegments, useSovereignIngestStatus,
  useProcessUtterance, useComplianceCheck, useComplianceReset,
  useAddEntity, useVoiceSessionStart, useVoiceSessionEnd, useAddTranscript,
} from "@/hooks/use-sovereign";
import {
  Brain, Shield, Database, MessageSquare, Mic, FileText,
  Activity, AlertTriangle, CheckCircle, XCircle, Send,
  RefreshCw, Zap, Network, Eye, BarChart3, Clock,
  TrendingUp, Volume2, MicOff, Play, Square, Link2
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type TabKey = "overview" | "memory" | "compliance" | "interact" | "voice" | "ingest";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "memory", label: "Memory", icon: Database },
  { key: "compliance", label: "Compliance", icon: Shield },
  { key: "interact", label: "Interact", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "ingest", label: "Ingest", icon: FileText },
];

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function Badge({ label, tone }: { label: string; tone: string }) {
  const colors: Record<string, string> = {
    pass: "text-green-400 bg-green-500/10 border-green-500/20",
    success: "text-green-400 bg-green-500/10 border-green-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    critical: "text-red-400 bg-red-500/10 border-red-500/20",
    danger: "text-red-400 bg-red-500/10 border-red-500/20",
    violation: "text-red-400 bg-red-500/10 border-red-500/20",
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    HIGH: "text-green-400 bg-green-500/10 border-green-500/20",
    MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    LOW: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${colors[tone] || "text-zinc-300 bg-white/[0.04] border-white/[0.07]"}`}>
      {label}
    </span>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "text-green-400" : score >= 70 ? "text-amber-400" : "text-red-400";
  const ring = score >= 90 ? "stroke-green-500" : score >= 70 ? "stroke-amber-500" : "stroke-red-500";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" className={ring} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
    </div>
  );
}

function RefreshBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, rotate: 180 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={loading}
      className="neu-btn p-2.5 rounded-xl text-zinc-400 hover:text-white"
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </motion.button>
  );
}

function OverviewTab() {
  const qc = useQueryClient();
  const { data: health, isLoading: healthLoading } = useSovereignHealth();
  const { data: memStats, isLoading: memLoading } = useSovereignMemoryStats();
  const { data: compliance } = useSovereignComplianceReport();
  const { data: audit } = useSovereignAudit(5);

  const loading = healthLoading || memLoading;
  const refresh = () => qc.invalidateQueries({ queryKey: ["sovereign"] });

  const services = health?.services || {};
  const stats = memStats?.stats || {};
  const compScore = compliance?.overall_score ?? 100;
  const auditStats = audit?.stats || { total_actions: 0, completed: 0, failed: 0, pending: 0, by_confidence: { HIGH: 0, MEDIUM: 0, LOW: 0 }, by_gate: { auto_execute: 0, flag_for_review: 0, queued: 0 } };

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Sovereign Agent v3</h2>
          <p className="text-sm text-zinc-400">Autonomous voice AI command center</p>
        </div>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cognitive Engine", icon: Brain, status: services.cognitive_engine || "unknown", color: "text-purple-400" },
          { label: "Compliance Monitor", icon: Shield, status: services.compliance_monitor || "unknown", color: "text-green-400" },
          { label: "Memory System", icon: Database, status: services.memory_system || "unknown", color: "text-blue-400" },
          { label: "Voice Pipeline", icon: Volume2, status: services.voice_pipeline || "unknown", color: "text-amber-400" },
        ].map((svc) => (
          <motion.div key={svc.label} {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl neu-inset flex items-center justify-center ${svc.color}`}>
                <svc.icon size={18} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-white block">{svc.label}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${svc.status === "active" ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-zinc-600"}`} />
                  <span className="text-xs text-zinc-400 capitalize">{svc.status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5 flex items-center justify-center">
          <ScoreGauge score={compScore} label="Compliance Score" />
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Database size={14} className="text-blue-400" /> Memory Stats
          </h3>
          <div className="space-y-3">
            {[
              { label: "Episodic memories", value: stats.episodic_count ?? 0, icon: Clock },
              { label: "Entities tracked", value: stats.entity_count ?? 0, icon: Network },
              { label: "Relationships", value: stats.relationship_count ?? 0, icon: TrendingUp },
              { label: "Procedural patterns", value: stats.procedural_count ?? 0, icon: Zap },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <item.icon size={13} className="text-zinc-500" />
                  {item.label}
                </div>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-amber-400" /> Executor Stats
          </h3>
          <div className="space-y-3">
            {[
              { label: "Total actions", value: auditStats.total_actions, icon: Activity, color: "text-zinc-300" },
              { label: "Auto-executed (HIGH)", value: auditStats.by_confidence?.HIGH ?? 0, icon: CheckCircle, color: "text-green-400" },
              { label: "Flagged (MEDIUM)", value: auditStats.by_confidence?.MEDIUM ?? 0, icon: AlertTriangle, color: "text-amber-400" },
              { label: "Queued (LOW)", value: auditStats.by_confidence?.LOW ?? 0, icon: Clock, color: "text-red-400" },
              { label: "Pending review", value: auditStats.pending, icon: Eye, color: "text-blue-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <item.icon size={13} className={item.color} />
                  {item.label}
                </div>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Eye size={14} className="text-blue-400" /> Recent Audit Log
        </h3>
        {(audit?.entries?.length ?? 0) === 0 ? (
          <div className="neu-inset rounded-xl p-6 text-center text-sm text-zinc-500">
            No audit entries yet. Process an utterance to begin.
          </div>
        ) : (
          <div className="space-y-2">
            {audit!.entries.slice(0, 5).map((entry: Record<string, unknown>, i: number) => (
              <div key={i} className="neu-inset rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {entry.success ? (
                    <CheckCircle size={14} className="text-green-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-400 shrink-0" />
                  )}
                  <span className="text-sm text-zinc-300 truncate">{String(entry.action)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge label={String(entry.confidence || "N/A")} tone={String(entry.confidence || "neutral")} />
                  <span className="text-xs text-zinc-500">
                    {new Date(String(entry.timestamp)).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MemoryTab() {
  const qc = useQueryClient();
  const { data: statsData, isLoading } = useSovereignMemoryStats();
  const { data: graphData } = useSovereignGraphStats();
  const { data: entitiesData } = useSovereignEntities(30);
  const { data: relsData } = useSovereignRelationships(30);
  const addEntityMut = useAddEntity();
  const [newEntity, setNewEntity] = useState({ type: "person", value: "", confidence: 0.9 });

  const refresh = () => qc.invalidateQueries({ queryKey: ["sovereign", "memory"] });
  const memStats = statsData?.stats || {};
  const entityTypes = graphData?.entity_types || {};
  const entities = entitiesData?.entities || [];
  const relationships = relsData?.relationships || [];

  const handleAdd = () => {
    if (!newEntity.value.trim()) return;
    addEntityMut.mutate({ ...newEntity, source: "manual" }, {
      onSuccess: () => setNewEntity({ type: "person", value: "", confidence: 0.9 }),
    });
  };

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">3-Layer Memory System</h2>
          <p className="text-sm text-zinc-400">Episodic, semantic, and procedural memory with PostgreSQL persistence</p>
        </div>
        <RefreshBtn onClick={refresh} loading={isLoading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Episodic", value: memStats.episodic_count ?? 0, desc: "Conversation snapshots", color: "text-purple-400" },
          { label: "Entities", value: memStats.entity_count ?? 0, desc: "Tracked knowledge nodes", color: "text-blue-400" },
          { label: "Relationships", value: memStats.relationship_count ?? 0, desc: "Graph connections", color: "text-cyan-400" },
          { label: "Procedural", value: memStats.procedural_count ?? 0, desc: "Learned patterns", color: "text-green-400" },
        ].map((m) => (
          <motion.div key={m.label} {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
            <span className="text-xs text-zinc-400">{m.label}</span>
            <div className={`text-3xl font-extrabold mt-1 ${m.color}`}>{m.value}</div>
            <span className="text-xs text-zinc-500">{m.desc}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Network size={14} className="text-cyan-400" /> Knowledge Graph Distribution
          </h3>
          {Object.keys(entityTypes).length === 0 ? (
            <div className="neu-inset rounded-xl p-6 text-center text-sm text-zinc-500">
              No entities in the knowledge graph yet.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(entityTypes).map(([type, count]) => {
                const total = Object.values(entityTypes as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300 capitalize">{type}</span>
                      <span className="text-xs text-zinc-400">{count as number} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full neu-inset overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Add Entity Manually</h3>
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Type</span>
              <select
                className="neu-input text-sm rounded-xl px-3 py-2.5"
                value={newEntity.type}
                onChange={(e) => setNewEntity((s) => ({ ...s, type: e.target.value }))}
              >
                {["person", "plan", "carrier", "medication", "provider", "date", "phone", "address", "npi", "medicare_id"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Value</span>
              <input
                className="neu-input text-sm rounded-xl px-3 py-2.5"
                placeholder="Entity value..."
                value={newEntity.value}
                onChange={(e) => setNewEntity((s) => ({ ...s, value: e.target.value }))}
              />
            </label>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              disabled={addEntityMut.isPending}
              className="neu-btn-primary w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {addEntityMut.isPending ? "Adding..." : "Add Entity"}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Database size={14} className="text-blue-400" /> Entity Registry
        </h3>
        {entities.length === 0 ? (
          <div className="neu-inset rounded-xl p-6 text-center text-sm text-zinc-500">
            No entities stored yet. Use the cognitive engine or add manually.
          </div>
        ) : (
          <div className="neu-inset rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-white font-semibold">Type</th>
                  <th className="text-left p-3 text-white font-semibold">Value</th>
                  <th className="text-left p-3 text-white font-semibold">Confidence</th>
                  <th className="text-left p-3 text-white font-semibold">Source</th>
                  <th className="text-left p-3 text-white font-semibold">Links</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-b border-white/5 neu-table-row">
                    <td className="p-3"><Badge label={String(e.type)} tone="info" /></td>
                    <td className="p-3 text-zinc-300">{String(e.value)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full neu-inset overflow-hidden">
                          <div
                            className={`h-full rounded-full ${Number(e.confidence) >= 0.8 ? "bg-green-500" : Number(e.confidence) >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${Math.round(Number(e.confidence || 0) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{Math.round(Number(e.confidence || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-500 text-xs">{String(e.source)}</td>
                    <td className="p-3 text-zinc-400 text-xs">{Number(e.relationship_count || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Link2 size={14} className="text-cyan-400" /> Relationships
        </h3>
        {relationships.length === 0 ? (
          <div className="neu-inset rounded-xl p-6 text-center text-sm text-zinc-500">
            No relationships yet. Relationships are created when entities are linked by the cognitive engine.
          </div>
        ) : (
          <div className="space-y-2">
            {relationships.map((r: Record<string, unknown>, i: number) => (
              <div key={i} className="neu-inset rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400 font-mono text-xs">{String(r.source_entity_id).slice(0, 8)}</span>
                  <span className="text-blue-400">→</span>
                  <Badge label={String(r.relation_type)} tone="info" />
                  <span className="text-blue-400">→</span>
                  <span className="text-zinc-400 font-mono text-xs">{String(r.target_entity_id).slice(0, 8)}</span>
                </div>
                <span className="text-xs text-zinc-500">{Math.round(Number(r.confidence || 0) * 100)}% conf</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function ComplianceTab() {
  const qc = useQueryClient();
  const { data: report, isLoading } = useSovereignComplianceReport();
  const checkMut = useComplianceCheck();
  const resetMut = useComplianceReset();
  const [checkText, setCheckText] = useState("");
  const [checkResult, setCheckResult] = useState<Record<string, unknown> | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["sovereign", "compliance"] });

  const handleCheck = () => {
    if (!checkText.trim()) return;
    checkMut.mutate(checkText, { onSuccess: (data) => setCheckResult(data) });
  };

  const handleReset = () => {
    resetMut.mutate(undefined, { onSuccess: () => setCheckResult(null) });
  };

  const score = Number(report?.overall_score ?? 100);
  const violations = Number(report?.violations ?? 0);
  const warnings = Number(report?.warnings ?? 0);
  const totalUtterances = Number(report?.total_utterances ?? 0);
  const violationDetails = (report?.violation_details ?? []) as Array<Record<string, string>>;
  const checkViolations = ((checkResult as Record<string, unknown[]> | null)?.violations ?? []) as Array<Record<string, string>>;

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">CMS/TCPA Compliance Monitor</h2>
          <p className="text-sm text-zinc-400">Real-time compliance scanning with 26 CMS/TPMO/TCPA patterns</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={resetMut.isPending}
            className="neu-btn px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
          >
            Reset
          </motion.button>
          <RefreshBtn onClick={refresh} loading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5 flex items-center justify-center">
          <ScoreGauge score={score} label="Overall Score" />
        </motion.div>
        {[
          { label: "Violations", value: violations, icon: XCircle, color: "text-red-400", tone: "critical" },
          { label: "Warnings", value: warnings, icon: AlertTriangle, color: "text-amber-400", tone: "warning" },
          { label: "Utterances Scanned", value: totalUtterances, icon: Eye, color: "text-blue-400", tone: "info" },
        ].map((m) => (
          <motion.div key={m.label} {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} className={m.color} />
              <span className="text-sm text-zinc-400">{m.label}</span>
            </div>
            <div className={`text-3xl font-extrabold ${m.color}`}>{m.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Live Compliance Check</h3>
        <div className="flex gap-3">
          <input
            className="neu-input text-sm rounded-xl px-4 py-3 flex-1"
            placeholder="Type an agent utterance to check for compliance violations..."
            value={checkText}
            onChange={(e) => setCheckText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={checkMut.isPending}
            className="neu-btn-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Shield size={14} /> {checkMut.isPending ? "Checking..." : "Check"}
          </motion.button>
        </div>

        <AnimatePresence>
          {checkResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              {checkViolations.length === 0 ? (
                <div className="neu-inset rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-400" />
                  <span className="text-sm text-green-400 font-medium">No compliance violations detected</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {checkViolations.map((v, i) => (
                    <div key={i} className="neu-inset rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className={v.severity === "critical" ? "text-red-400" : v.severity === "violation" ? "text-red-400" : "text-amber-400"} />
                          <span className="text-sm font-semibold text-white">{v.rule}</span>
                        </div>
                        <Badge label={v.severity} tone={v.severity === "warning" ? "warning" : "critical"} />
                      </div>
                      <p className="text-sm text-zinc-300 mb-1">{v.description}</p>
                      <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                        <span className="text-xs text-zinc-400">Recommendation: </span>
                        <span className="text-xs text-green-400">{v.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {violationDetails.length > 0 && (
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" /> Violation History ({violationDetails.length})
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {violationDetails.map((v, i) => (
              <div key={i} className="neu-inset rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{v.rule}</span>
                    <Badge label={v.severity} tone={v.severity === "warning" ? "warning" : "critical"} />
                  </div>
                  <p className="text-xs text-zinc-400">{v.description}</p>
                  <p className="text-xs text-zinc-500 mt-1">Matched: "{v.matchedText}"</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Prohibited Pattern Categories (26 patterns)</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Guarantee claims", "Free plan language", "No-cost misleading", "Superlative claims",
            "Pressure tactics", "False urgency", "Secrecy encouragement", "CMS endorsement",
            "Government affiliation", "Bandwagon tactics", "Limited time offers", "Act now pressure",
            "Offer expiry language", "Medicare impersonation", "Personal recommendations",
            "Personal opinions", "Plan disparagement", "Premature data collection",
            "Gift rule violations", "Misleading cost language", "No-obligation claims",
            "Risk-free claims", "Savings exaggeration", "Network accuracy",
            "Enrollment pressure", "Neighbor references",
          ].map((cat) => (
            <Badge key={cat} label={cat} tone="neutral" />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InteractTab() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{
    role: string;
    content: string;
    compliance?: Record<string, unknown>;
    confidence?: string;
    gate_decision?: string;
    extracted_entities?: Array<Record<string, unknown>>;
    timestamp: string;
  }>>([]);
  const processMut = useProcessUtterance();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || processMut.isPending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date().toISOString() }]);

    processMut.mutate({ input: userMsg, context: "interactive_session" }, {
      onSuccess: (result) => {
        const cog = result.cognitive_output || {};
        const analysis = cog.analysis || "No analysis available";
        const suggestions = (cog.suggestions as string[] || []).join("\n- ");
        const recommended = cog.recommended_response || "";
        const sentiment = cog.sentiment || "neutral";

        let reply = `**Analysis:** ${analysis}`;
        if (suggestions) reply += `\n\n**Coaching Suggestions:**\n- ${suggestions}`;
        if (recommended) reply += `\n\n**Recommended Response:**\n"${recommended}"`;
        reply += `\n\n**Sentiment:** ${sentiment}`;

        setMessages((prev) => [...prev, {
          role: "assistant",
          content: reply,
          compliance: result.compliance,
          confidence: result.confidence,
          gate_decision: result.gate_decision,
          extracted_entities: result.extracted_entities,
          timestamp: new Date().toISOString(),
        }]);
      },
      onError: () => {
        setMessages((prev) => [...prev, {
          role: "system",
          content: "Failed to process input. Please try again.",
          timestamp: new Date().toISOString(),
        }]);
      },
    });
  };

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Cognitive Engine Interaction</h2>
        <p className="text-sm text-zinc-400">Send utterances to the Sovereign Agent for analysis, coaching, and compliance checks</p>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: 400 }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Brain size={48} className="text-zinc-700 mx-auto mb-4" />
                <p className="text-sm text-zinc-500">Type an agent utterance to analyze</p>
                <p className="text-xs text-zinc-600 mt-1">The cognitive engine will provide real-time coaching and compliance feedback</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === "user" ? "neu-chat-bubble-user text-white" :
                msg.role === "system" ? "bg-red-500/10 border border-red-500/20 text-red-300" :
                "neu-chat-bubble-ai text-zinc-200"
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                {msg.extracted_entities && msg.extracted_entities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs font-semibold text-zinc-400 block mb-2">Extracted Entities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.extracted_entities.map((ent, ei) => (
                        <div key={ei} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07]">
                          <Badge label={String(ent.type)} tone="info" />
                          <span className="text-xs text-zinc-300">{String(ent.value)}</span>
                          <span className="text-[10px] text-zinc-500">({Math.round(Number(ent.confidence || 0) * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(msg.compliance || msg.confidence) && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 flex-wrap">
                    {msg.compliance && (
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className={
                          Number((msg.compliance as Record<string, number>).score) >= 90 ? "text-green-400" :
                          Number((msg.compliance as Record<string, number>).score) >= 70 ? "text-amber-400" : "text-red-400"
                        } />
                        <span className="text-xs text-zinc-400">
                          Score: {(msg.compliance as Record<string, number>).score}
                        </span>
                      </div>
                    )}
                    {msg.confidence && (
                      <Badge label={`Confidence: ${msg.confidence}`} tone={msg.confidence} />
                    )}
                    {msg.gate_decision && (
                      <span className="text-[10px] text-zinc-500">{msg.gate_decision.replace(/_/g, " ")}</span>
                    )}
                  </div>
                )}
                <div className="text-[10px] text-zinc-500 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}

          {processMut.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="neu-chat-bubble-ai rounded-2xl p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
                <span className="text-sm text-zinc-400">Cognitive engine processing...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/[0.04] bg-[#0a0a0e]">
          <div className="flex gap-3">
            <input
              className="neu-input text-sm rounded-xl px-4 py-3 flex-1"
              placeholder="Enter an utterance to analyze..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={processMut.isPending}
            />
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={processMut.isPending || !input.trim()}
              className="neu-btn-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> Send
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "I can guarantee this plan covers your medications",
              "This is the best plan available in your area",
              "You must enroll today or you'll lose coverage",
              "Based on what you've shared, this plan matches your needs",
            ].map((example) => (
              <motion.button
                key={example}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInput(example)}
                className="text-xs text-zinc-500 hover:text-zinc-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-2.5 py-1.5 rounded-lg transition-all"
              >
                {example.length > 45 ? example.slice(0, 45) + "..." : example}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VoiceTab() {
  const qc = useQueryClient();
  const { data: session, isLoading } = useSovereignVoiceSession();
  const { data: transcriptData } = useSovereignVoiceTranscript(30);
  const { data: segmentsData } = useSovereignVoiceSegments();
  const startMut = useVoiceSessionStart();
  const endMut = useVoiceSessionEnd();
  const addMut = useAddTranscript();
  const [newEntry, setNewEntry] = useState({ speaker: "agent", text: "" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["sovereign", "voice"] });

  const toggleSession = () => {
    if (session?.active) endMut.mutate(); else startMut.mutate();
  };

  const addTranscript = () => {
    if (!newEntry.text.trim()) return;
    addMut.mutate(newEntry, {
      onSuccess: () => setNewEntry((s) => ({ ...s, text: "" })),
    });
  };

  const isActive = session?.active ?? false;
  const callPhase = String(session?.call_phase ?? "idle");
  const sentiment = String(session?.sentiment ?? "neutral");
  const duration = Number(session?.duration_seconds ?? 0);
  const talkRatio = Number(session?.agent_talk_ratio ?? 0);
  const silence = session?.silence || { total_silence_seconds: 0, silence_count: 0, longest_silence_seconds: 0, average_silence_seconds: 0 };
  const transcript = transcriptData?.transcript || [];
  const segments = segmentsData?.segments || [];

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Voice Pipeline</h2>
          <p className="text-sm text-zinc-400">Session management, transcript, segments, and silence detection</p>
        </div>
        <RefreshBtn onClick={refresh} loading={isLoading} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Status</span>
            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" : "bg-zinc-600"}`} />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleSession}
            disabled={startMut.isPending || endMut.isPending}
            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isActive ? "bg-red-500/20 text-red-400 border border-red-500/30" : "neu-btn-primary"
            }`}
          >
            {isActive ? <><Square size={12} /> End</> : <><Play size={12} /> Start</>}
          </motion.button>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <span className="text-xs text-zinc-400">Phase</span>
          <div className="text-lg font-bold text-white mt-1 capitalize">{callPhase}</div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <span className="text-xs text-zinc-400">Sentiment</span>
          <div className="text-lg font-bold text-white mt-1 capitalize">{sentiment}</div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <span className="text-xs text-zinc-400">Duration</span>
          <div className="text-lg font-bold text-white mt-1">
            {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <span className="text-xs text-zinc-400">Agent Talk %</span>
          <div className="text-lg font-bold text-white mt-1">{talkRatio}%</div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-4 neu-card-hover">
          <span className="text-xs text-zinc-400">Segments</span>
          <div className="text-lg font-bold text-white mt-1">{segments.length}</div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <MicOff size={14} className="text-amber-400" /> Silence Detection
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total silence", value: `${silence.total_silence_seconds}s` },
            { label: "Silence events", value: silence.silence_count },
            { label: "Longest gap", value: `${silence.longest_silence_seconds}s` },
            { label: "Avg gap", value: `${silence.average_silence_seconds}s` },
          ].map((m) => (
            <div key={m.label} className="neu-inset rounded-xl p-3 text-center">
              <span className="text-xs text-zinc-400 block">{m.label}</span>
              <span className="text-lg font-bold text-white">{m.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...cardMotion} className="lg:col-span-2 neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Mic size={14} className="text-blue-400" /> Transcript
          </h3>
          <div className="neu-inset rounded-xl p-4 max-h-[400px] overflow-y-auto space-y-3">
            {transcript.length === 0 ? (
              <div className="text-center py-8 text-sm text-zinc-500">
                <MicOff size={24} className="mx-auto mb-3 text-zinc-700" />
                No transcript entries. Start a session and add entries.
              </div>
            ) : (
              transcript.map((entry: Record<string, unknown>, i: number) => {
                const flags = (entry.compliance_flags || []) as string[];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: entry.speaker === "agent" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${entry.speaker === "agent" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-xl p-3 ${
                      entry.speaker === "agent" ? "neu-chat-bubble-user" :
                      entry.speaker === "caller" ? "neu-chat-bubble-ai" :
                      "bg-zinc-800/50 border border-white/5"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase text-zinc-400">{String(entry.speaker)}</span>
                        {flags.length > 0 && <AlertTriangle size={10} className="text-red-400" />}
                      </div>
                      <p className="text-sm text-white">{String(entry.text)}</p>
                      {flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {flags.map((f: string, fi: number) => (
                            <span key={fi} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Add Transcript Entry</h3>
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Speaker</span>
              <select
                className="neu-input text-sm rounded-xl px-3 py-2.5"
                value={newEntry.speaker}
                onChange={(e) => setNewEntry((s) => ({ ...s, speaker: e.target.value }))}
              >
                <option value="agent">Agent</option>
                <option value="caller">Caller</option>
                <option value="system">System</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Text</span>
              <textarea
                className="neu-input text-sm rounded-xl px-3 py-2.5 min-h-[80px] resize-none"
                placeholder="Enter transcript text..."
                value={newEntry.text}
                onChange={(e) => setNewEntry((s) => ({ ...s, text: e.target.value }))}
              />
            </label>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={addTranscript}
              disabled={addMut.isPending}
              className="neu-btn-primary w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {addMut.isPending ? "Adding..." : "Add Entry"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function IngestTab() {
  const qc = useQueryClient();
  const { data: status, isLoading } = useSovereignIngestStatus();

  const refresh = () => qc.invalidateQueries({ queryKey: ["sovereign", "ingest"] });
  const supportedTypes = (status?.supported_types ?? []) as string[];

  return (
    <motion.div {...stagger} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Document Ingest Pipeline</h2>
          <p className="text-sm text-zinc-400">Feed carrier documents, compliance guides, and plan data into the knowledge graph</p>
        </div>
        <RefreshBtn onClick={refresh} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
          <span className="text-xs text-zinc-400">Pipeline Status</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            <span className="text-lg font-bold text-white capitalize">{String(status?.status ?? "unknown")}</span>
          </div>
        </motion.div>
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
          <span className="text-xs text-zinc-400">Queue Size</span>
          <div className="text-3xl font-extrabold text-white mt-1">{Number(status?.queue_size ?? 0)}</div>
        </motion.div>
        <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5 neu-card-hover">
          <span className="text-xs text-zinc-400">Total Processed</span>
          <div className="text-3xl font-extrabold text-white mt-1">{Number(status?.processed_total ?? 0)}</div>
        </motion.div>
      </div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Supported Document Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {supportedTypes.map((type) => (
            <div key={type} className="neu-inset rounded-xl p-4 text-center">
              <FileText size={24} className="text-blue-400 mx-auto mb-2" />
              <span className="text-sm font-semibold text-white uppercase">{type}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div {...cardMotion} className="neu-raised rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Ingest Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Carrier Document Processing", desc: "Parse SBCs, EOBs, formularies, and provider directories into structured knowledge", icon: FileText, color: "text-blue-400" },
            { title: "Compliance Guide Import", desc: "Ingest CMS manuals, TCPA regulations, and state-specific compliance requirements", icon: Shield, color: "text-green-400" },
            { title: "Plan Data Extraction", desc: "Extract benefits, premiums, copays, and network details from plan documents", icon: BarChart3, color: "text-purple-400" },
            { title: "Training Material Processing", desc: "Process scripts, rebuttals, and coaching materials for agent knowledge base", icon: Brain, color: "text-amber-400" },
          ].map((cap) => (
            <div key={cap.title} className="neu-inset rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center shrink-0 ${cap.color}`}>
                  <cap.icon size={14} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">{cap.title}</span>
                  <p className="text-xs text-zinc-400 mt-1">{cap.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SovereignPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabComponents: Record<TabKey, React.ReactNode> = {
    overview: <OverviewTab />,
    memory: <MemoryTab />,
    compliance: <ComplianceTab />,
    interact: <InteractTab />,
    voice: <VoiceTab />,
    ingest: <IngestTab />,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center">
              <Brain size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Sovereign Agent</h1>
              <p className="text-sm text-zinc-400">v3 Command Center</p>
            </div>
          </div>
          <Badge label="v3.0.0" tone="purple" />
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                key === activeTab
                  ? "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "text-zinc-400 bg-white/[0.03] border-white/5 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {tabComponents[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
