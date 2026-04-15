import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send, Copy, Loader2, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL || "/";

interface ExtractedField {
  key: string;
  label: string;
  value: string;
}

interface CrmConfig {
  id: string;
  name: string;
  crmType: string;
  mode: string;
  isActive: boolean;
}

interface CrmReviewProps {
  callId: string;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  currentCarrier: "Current Carrier",
  currentPlan: "Current Plan",
  planInterest: "Plan Interest",
  medicareId: "Medicare ID",
  dateOfBirth: "Date of Birth",
  objections: "Objections",
  callbackPreference: "Callback Preference",
  budgetRange: "Budget Range",
  medications: "Medications",
  providers: "Providers",
  healthConditions: "Health Conditions",
  county: "County",
  state: "State",
  zipCode: "ZIP Code",
  spouseInfo: "Spouse Info",
  enrollmentPeriod: "Enrollment Period",
  additionalNotes: "Additional Notes",
};

export function CrmReview({ callId, onClose }: CrmReviewProps) {
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [crmConfigs, setCrmConfigs] = useState<CrmConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [browserPayload, setBrowserPayload] = useState<unknown[] | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [callId]);

  async function loadData() {
    setLoading(true);
    try {
      const [transcriptRes, configsRes] = await Promise.all([
        fetch(`${BASE}api/calls/${callId}/transcript`, { credentials: "include" }),
        fetch(`${BASE}api/crm/configs`, { credentials: "include" }).catch(() => null),
      ]);

      if (transcriptRes.ok) {
        const data = await transcriptRes.json();
        setTranscript(data.transcript || "");
        if (data.extractedData && Object.keys(data.extractedData).length > 0) {
          setExtractedData(data.extractedData);
          populateFields(data.extractedData);
        }
      }

      if (configsRes?.ok) {
        const configs = await configsRes.json();
        setCrmConfigs(configs.filter((c: CrmConfig) => c.isActive));
        if (configs.length > 0) {
          setSelectedConfig(configs[0].id);
        }
      }
    } catch (err) {
      console.error("Load CRM review data error:", err);
    }
    setLoading(false);
  }

  function populateFields(data: Record<string, unknown>) {
    const result: ExtractedField[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        const strValue = Array.isArray(value) ? value.join(", ") : String(value);
        result.push({
          key,
          label: FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim(),
          value: strValue,
        });
      }
    }
    setFields(result);
  }

  async function handleParse() {
    setParsing(true);
    try {
      const res = await fetch(`${BASE}api/calls/${callId}/transcript/parse`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedData(data.extractedData);
        populateFields(data.extractedData);
      }
    } catch (err) {
      console.error("Parse transcript error:", err);
    }
    setParsing(false);
  }

  function updateField(key: string, newValue: string) {
    setFields((prev) => prev.map((f) => f.key === key ? { ...f, value: newValue } : f));
  }

  async function handlePush() {
    if (!selectedConfig) return;
    setPushing(true);
    setPushResult(null);
    setBrowserPayload(null);

    const dataToSend: Record<string, unknown> = {};
    for (const field of fields) {
      dataToSend[field.key] = field.value.includes(", ")
        ? field.value.split(", ").map((s) => s.trim())
        : field.value;
    }

    try {
      const res = await fetch(`${BASE}api/crm/push/${callId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ configId: selectedConfig, data: dataToSend }),
      });
      const result = await res.json();
      if (result.mode === "browser_automation") {
        setBrowserPayload(result.payload);
      } else {
        setPushResult(result);
      }
    } catch (err) {
      setPushResult({ success: false, error: "Network error" });
    }
    setPushing(false);
  }

  async function handleCopyPayload() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(browserPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleSaveAndClose() {
    const dataToSave: Record<string, unknown> = {};
    for (const field of fields) {
      dataToSave[field.key] = field.value.includes(", ")
        ? field.value.split(", ").map((s) => s.trim())
        : field.value;
    }

    try {
      await fetch(`${BASE}api/calls/${callId}/transcript/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ extractedData: dataToSave }),
      });
    } catch {}
    onClose();
  }

  if (loading) {
    return (
      <div className="neu-raised rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
        <p className="text-sm text-zinc-500">Loading call data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-raised rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }} />
          <h3 className="text-base font-bold text-white">CRM Auto-Fill Review</h3>
        </div>
        {!extractedData && transcript && (
          <motion.button
            onClick={handleParse}
            disabled={parsing}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white neu-btn-primary disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {parsing ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Analyzing...</span>
            ) : (
              "Analyze Transcript"
            )}
          </motion.button>
        )}
      </div>

      {transcript && (
        <div className="px-6 py-2 border-b border-white/[0.04]">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full py-1"
          >
            {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showTranscript ? "Hide" : "Show"} Call Transcript
          </button>
          {showTranscript && (
            <div className="mt-2 mb-3 max-h-48 overflow-y-auto neu-inset rounded-xl p-4">
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">{transcript}</pre>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {fields.length === 0 && !extractedData ? (
          <div className="text-center py-8">
            <AlertCircle size={24} className="text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">
              {transcript ? "Click 'Analyze Transcript' to extract CRM data" : "No transcript data available for this call"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{field.label}</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {crmConfigs.length > 0 && (
              <div className="space-y-3 mb-6">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Push to CRM</label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white neu-input focus:outline-none bg-transparent"
                >
                  {crmConfigs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">{c.name} ({c.crmType})</option>
                  ))}
                </select>
              </div>
            )}

            {pushResult && (
              <div className={cn(
                "p-3 rounded-xl mb-4 text-sm flex items-center gap-2",
                pushResult.success ? "text-emerald-400" : "text-red-400"
              )}
              style={{
                background: pushResult.success
                  ? 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))'
                  : 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
                border: pushResult.success
                  ? '1px solid rgba(16,185,129,0.15)'
                  : '1px solid rgba(239,68,68,0.15)',
              }}>
                {pushResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {pushResult.success ? "Data pushed to CRM successfully" : pushResult.error}
              </div>
            )}

            {browserPayload && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Browser Automation Payload</p>
                  <motion.button
                    onClick={handleCopyPayload}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white neu-btn flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy size={12} />
                    {copied ? "Copied!" : "Copy JSON"}
                  </motion.button>
                </div>
                <div className="neu-inset rounded-xl p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(browserPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/[0.04]">
          <motion.button
            onClick={handleSaveAndClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Save & Close
          </motion.button>
          {crmConfigs.length > 0 && fields.length > 0 && (
            <motion.button
              onClick={handlePush}
              disabled={pushing || !selectedConfig}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn-primary disabled:opacity-50 flex items-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {pushing ? (
                <><Loader2 size={14} className="animate-spin" /> Pushing...</>
              ) : (
                <><Send size={14} /> Push to CRM</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
