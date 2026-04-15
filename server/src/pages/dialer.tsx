import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useDialer } from "@/hooks/use-dialer";
import { Phone, PhoneOff, SkipForward, Play, Pause, AlertTriangle, Clock, Activity, ShieldAlert, CheckCircle2, FileText, Settings } from "lucide-react";
import { formatPhone, formatDuration, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getTwilioConfig } from "@workspace/api-client-react";
import type { CallActionResponse } from "@workspace/api-client-react";
import { LiveTranscript } from "@/components/live-transcript";
import { CrmReview } from "@/components/crm-review";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface ActiveCall extends CallActionResponse {
  status: string;
  startTime: number;
}

interface QueueStatsData {
  ready: number;
  inProgress: number;
  callback: number;
  completed: number;
  dnc: number;
  exhausted: number;
  total: number;
}

interface AgentStatsData {
  totalCalls: number;
  answered: number;
  answerRate: number;
  totalTalkTime: number;
  sales: number;
  conversionRate: number;
}

export default function DialerPage() {
  const [mode, setMode] = useState<'idle' | 'active' | 'paused'>('idle');
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showDisposition, setShowDisposition] = useState(false);
  const [showCrmReview, setShowCrmReview] = useState(false);
  const [selectedDisp, setSelectedDisp] = useState("");
  const [dispNotes, setDispNotes] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const { user } = useAuth();
  
  const { dispositions, callAction, isActionPending } = useDialer();

  const { data: twilioConfig } = useQuery({
    queryKey: ["/api/twilio/config"],
    queryFn: () => getTwilioConfig(),
    staleTime: 60000,
  });

  const { data: rawQueueStats } = useQuery({
    queryKey: ["/api/analytics", { type: "queue" }],
    queryFn: () => getAnalytics({ type: "queue" }),
    refetchInterval: 10000,
  });

  const { data: rawAgentStats } = useQuery({
    queryKey: ["/api/analytics", { type: "agent" }],
    queryFn: () => getAnalytics({ type: "agent" }),
    refetchInterval: 10000,
  });

  const queueStats = rawQueueStats as QueueStatsData | undefined;
  const agentStats = rawAgentStats as AgentStatsData | undefined;

  useEffect(() => {
    if (!call || call.status === 'ended') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [call]);

  const dialNext = useCallback(async () => {
    try {
      const result = await callAction({ data: { action: "dial" } });
      if (result.success) {
        setCall({
          ...result,
          status: 'dialing',
          startTime: Date.now()
        });
        setMode('active');
      } else {
        setMode('paused');
      }
    } catch (_e) {
      setMode('paused');
    }
  }, [callAction]);

  const hangUp = useCallback(async () => {
    if (!call) return;
    try {
      await callAction({ data: { action: "hangup", callId: call.callId } });
    } catch (_e) {
    } finally {
      setCall((prev) => prev ? { ...prev, status: 'ended' } : null);
      setShowDisposition(true);
    }
  }, [call, callAction]);

  const submitDisposition = async (autoDialNext: boolean) => {
    if (!call || !selectedDisp) return;
    try {
      await callAction({
        data: {
          action: "disposition",
          callId: call.callId,
          code: selectedDisp,
          notes: dispNotes,
          callbackDate: callbackDate || undefined,
        }
      });

      setShowDisposition(false);
      setShowCrmReview(true);
    } catch (_e) {
    }
  };

  const finishCrmReview = (autoDialNext?: boolean) => {
    setShowCrmReview(false);
    setCall(null);
    setSelectedDisp("");
    setDispNotes("");
    setCallbackDate("");
    setElapsed(0);

    if (autoDialNext && mode === 'active') {
      setTimeout(dialNext, 1500);
    } else {
      setMode('paused');
    }
  };

  const categories = ["POSITIVE", "NEUTRAL", "NEGATIVE", "COMPLIANCE"];

  const statItems = [
    { label: "In Queue", value: queueStats?.ready ?? 0, color: "text-blue-400", icon: Activity, glow: "shadow-blue-500/10" },
    { label: "Calls Today", value: agentStats?.totalCalls ?? 0, color: "text-emerald-400", icon: Phone, glow: "shadow-emerald-500/10" },
    { label: "Answer Rate", value: `${agentStats?.answerRate ?? 0}%`, color: "text-purple-400", icon: Activity, glow: "shadow-purple-500/10" },
    { label: "Sales", value: agentStats?.sales ?? 0, color: "text-amber-400", icon: CheckCircle2, glow: "shadow-amber-500/10" },
    { label: "Conversion", value: `${agentStats?.conversionRate ?? 0}%`, color: "text-cyan-400", icon: Activity, glow: "shadow-cyan-500/10" },
  ];

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {twilioConfig && !twilioConfig.isConfigured && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-raised rounded-2xl p-5 flex items-start gap-4"
            style={{
              background: 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
              border: '1px solid rgba(245,158,11,0.15)',
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(145deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' }}>
              <Phone size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Twilio Setup Required</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {user?.role === "ADMIN"
                  ? "To start making calls, configure your Twilio credentials and provision a phone number in Settings."
                  : "Twilio is not configured yet. Please ask an admin to set up phone credentials in Settings."}
              </p>
              {user?.role === "ADMIN" && (
                <Link href="/settings">
                  <motion.span
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    style={{
                      background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '4px 4px 12px rgba(217,119,6,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings size={14} /> Go to Settings
                  </motion.span>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-tour="dialer-controls">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Power Dialer</h1>
            <p className="text-zinc-500 text-sm mt-1">Make consecutive calls seamlessly</p>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'idle' && (
              <motion.button
                onClick={() => { setMode('active'); dialNext(); }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #34d399 0%, #059669 100%)',
                  boxShadow: '4px 4px 12px rgba(5,150,105,0.3), -4px -4px 12px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} className="fill-current" /> Start Dialing
              </motion.button>
            )}
            {mode === 'active' && !call && !showDisposition && (
              <motion.button
                onClick={() => setMode('paused')}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #fbbf24 0%, #d97706 100%)',
                  boxShadow: '4px 4px 12px rgba(217,119,6,0.3), -4px -4px 12px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Pause size={18} className="fill-current" /> Pause
              </motion.button>
            )}
            {mode === 'paused' && (
              <motion.button
                onClick={() => { setMode('active'); dialNext(); }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #34d399 0%, #059669 100%)',
                  boxShadow: '4px 4px 12px rgba(5,150,105,0.3), -4px -4px 12px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} className="fill-current" /> Resume
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" data-tour="queue-stats">
          {statItems.map((stat, i) => (
            <motion.div
              key={i}
              className={cn("neu-raised-sm rounded-2xl p-4 flex flex-col relative overflow-hidden neu-card-hover", stat.glow)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <div className="absolute top-0 right-0 p-3 opacity-[0.06]">
                <stat.icon size={32} />
              </div>
              <span className={cn("text-2xl font-bold font-display tracking-tight mb-1", stat.color)}>{stat.value}</span>
              <span className="text-[10px] text-zinc-600 uppercase font-semibold tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {call?.warnings && call.warnings.length > 0 && !showDisposition && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="neu-raised rounded-xl p-4 flex items-start gap-3 mt-4" style={{ boxShadow: '4px 4px 12px rgba(217,119,6,0.15), -4px -4px 12px rgba(255,255,255,0.01), inset 0 0 20px rgba(245,158,11,0.05)' }}>
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-amber-500 mb-1">Compliance Warnings</h4>
                  <ul className="text-sm text-amber-400/80 list-disc list-inside pl-1">
                    {call.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="neu-raised rounded-3xl p-1 overflow-hidden relative min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none rounded-3xl" />
          
          <AnimatePresence mode="wait">
            {showCrmReview && call ? (
              <motion.div
                key="crm-review"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-6 z-10 relative"
              >
                <CrmReview
                  callId={call.callId!}
                  onClose={() => finishCrmReview(mode === 'active')}
                />
              </motion.div>
            ) : !call && !showDisposition ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10"
              >
                <div className="w-24 h-24 rounded-full neu-inset flex items-center justify-center mb-6 relative">
                  <Phone size={40} className="opacity-30" />
                  {mode === 'active' && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                      className="absolute inset-0 border-2 border-primary rounded-full"
                    />
                  )}
                </div>
                <h3 className="text-xl font-display font-medium text-zinc-300">
                  {mode === 'idle' ? 'Ready to dial' : mode === 'paused' ? 'Paused' : 'Fetching next lead...'}
                </h3>
                <p className="text-sm mt-2 max-w-xs text-center text-zinc-600">
                  {mode === 'idle' ? 'Click "Start Dialing" to connect to the queue.' : mode === 'paused' ? 'Resume when ready.' : 'Connecting...'}
                </p>
              </motion.div>
            ) : showDisposition ? (
              <motion.div 
                key="disposition"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-6 md:p-8 z-10 relative neu-flat rounded-[22px]"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.04]">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white mb-1">
                      Disposition <span className="text-zinc-600">— {call?.lead?.firstName} {call?.lead?.lastName}</span>
                    </h2>
                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                      <Clock size={14} /> Total Duration: {formatDuration(elapsed)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {categories.map(cat => {
                    const items = dispositions.filter(d => d.category === cat);
                    if (!items.length) return null;
                    const catLabel = cat.charAt(0) + cat.slice(1).toLowerCase();
                    return (
                      <div key={cat} className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-wider">{catLabel}</h4>
                        <div className="flex flex-col gap-2">
                          {items.map(d => (
                            <motion.button
                              key={d.code}
                              onClick={() => setSelectedDisp(d.code)}
                              whileTap={{ scale: 0.97 }}
                              className={cn(
                                "px-4 py-2.5 text-sm font-medium rounded-xl text-left transition-all duration-300",
                                selectedDisp === d.code
                                  ? cat === 'POSITIVE' ? "neu-nav-active text-emerald-400" 
                                  : cat === 'NEGATIVE' ? "text-red-400" 
                                  : cat === 'COMPLIANCE' ? "text-orange-400"
                                  : "text-blue-400"
                                  : "neu-btn text-zinc-400 hover:text-white"
                              )}
                              style={selectedDisp === d.code ? {
                                background: cat === 'POSITIVE' ? 'linear-gradient(145deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))' :
                                  cat === 'NEGATIVE' ? 'linear-gradient(145deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))' :
                                  cat === 'COMPLIANCE' ? 'linear-gradient(145deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))' :
                                  'linear-gradient(145deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))',
                                boxShadow: `inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px ${
                                  cat === 'POSITIVE' ? 'rgba(16,185,129,0.05)' :
                                  cat === 'NEGATIVE' ? 'rgba(239,68,68,0.05)' :
                                  cat === 'COMPLIANCE' ? 'rgba(249,115,22,0.05)' :
                                  'rgba(59,130,246,0.05)'
                                }`,
                                border: `1px solid ${
                                  cat === 'POSITIVE' ? 'rgba(16,185,129,0.2)' :
                                  cat === 'NEGATIVE' ? 'rgba(239,68,68,0.2)' :
                                  cat === 'COMPLIANCE' ? 'rgba(249,115,22,0.2)' :
                                  'rgba(59,130,246,0.2)'
                                }`
                              } : undefined}
                            >
                              {d.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-500">Call Notes</label>
                    <textarea
                      value={dispNotes}
                      onChange={(e) => setDispNotes(e.target.value)}
                      placeholder="Add details about the conversation..."
                      className="w-full h-32 px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none resize-none"
                    />
                  </div>
                  {dispositions.find(d => d.code === selectedDisp)?.requiresCallback && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500">Schedule Callback</label>
                      <input
                        type="datetime-local"
                        value={callbackDate}
                        onChange={(e) => setCallbackDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white neu-input focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/[0.04]">
                  <motion.button
                    disabled={!selectedDisp || isActionPending}
                    onClick={() => submitDisposition(false)}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white neu-btn disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save & Pause
                  </motion.button>
                  <motion.button
                    disabled={!selectedDisp || isActionPending}
                    onClick={() => submitDisposition(true)}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white neu-btn-primary disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save & Next Lead
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col lg:flex-row h-full rounded-[22px] overflow-hidden neu-flat relative z-10"
              >
                <div className="flex-1 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.04]">
                  <div className="flex items-center gap-4 mb-8">
                    <motion.div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-500",
                        call?.status === 'connected' ? "text-emerald-400" :
                        call?.status === 'ended' ? "text-zinc-600" :
                        "text-blue-400"
                      )}
                      style={{
                        background: call?.status === 'connected' 
                          ? 'linear-gradient(145deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                          : call?.status === 'ended'
                          ? 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.1))'
                          : 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
                        boxShadow: call?.status === 'connected'
                          ? 'inset 2px 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(16,185,129,0.15)'
                          : 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.01)',
                        border: call?.status === 'connected' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.04)',
                      }}
                      animate={call?.status === 'dialing' || call?.status === 'ringing' ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Phone size={28} className={call?.status === 'connected' ? "" : call?.status === 'ended' ? "" : "animate-bounce"} />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold font-display text-white tracking-tight mb-1">
                        {call?.lead?.firstName} {call?.lead?.lastName}
                      </h2>
                      <p className="text-lg text-zinc-500 font-mono tracking-wider">{formatPhone(call?.lead?.phone)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { label: "Location", value: `${call?.lead?.state || '—'} ${call?.lead?.zipCode ? `(${call.lead.zipCode})` : ''}` },
                      { label: "Current Carrier", value: call?.lead?.currentCarrier || 'Unknown' },
                      { label: "Dial Attempts", value: `${call?.lead?.dialAttempts || 0} / 5` },
                    ].map((item, i) => (
                      <div key={i} className="neu-inset rounded-xl p-4">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">{item.label}</p>
                        <p className="font-medium text-zinc-300 text-sm">{item.value}</p>
                      </div>
                    ))}
                    <div className="neu-inset rounded-xl p-4">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">Compliance</p>
                      {call?.lead?.soaSigned ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium"><CheckCircle2 size={14}/> SOA Signed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-medium"><ShieldAlert size={14}/> SOA Pending</span>
                      )}
                    </div>
                  </div>

                  {call?.lead?.notes && (
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 pl-1">Lead Notes</p>
                      <div className="neu-inset rounded-xl p-4 text-sm text-zinc-400 leading-relaxed max-h-32 overflow-y-auto">
                        {call.lead.notes}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <LiveTranscript
                      callSid={call?.callSid || undefined}
                      isCallActive={call?.status !== 'ended'}
                    />
                  </div>
                </div>

                <div className="w-full lg:w-80 p-6 lg:p-10 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)' }}>
                  <motion.div
                    className={cn(
                      "text-6xl font-mono font-light tracking-tighter tabular-nums mb-4 transition-colors duration-500",
                      call?.status === 'connected' ? "text-emerald-400" : "text-zinc-600"
                    )}
                    style={call?.status === 'connected' ? { textShadow: '0 0 20px rgba(16,185,129,0.4)' } : undefined}
                    animate={call?.status === 'connected' ? { opacity: [0.9, 1, 0.9] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {formatDuration(elapsed)}
                  </motion.div>
                  
                  <div className="mb-10 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                      call?.status === 'dialing' ? "text-amber-400" :
                      call?.status === 'ringing' ? "text-blue-400" :
                      call?.status === 'connected' ? "text-emerald-400" :
                      "text-zinc-500"
                    )}
                    style={{
                      background: call?.status === 'connected' ? 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))'
                        : call?.status === 'ringing' ? 'linear-gradient(145deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))',
                      boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                    >
                      {call?.status === 'ringing' || call?.status === 'dialing' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                        </span>
                      ) : <span className="w-2 h-2 rounded-full bg-current" />}
                      {call?.status}
                    </span>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <motion.button
                      onClick={hangUp}
                      className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-red-400 text-sm"
                      style={{
                        background: 'linear-gradient(145deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))',
                        boxShadow: '4px 4px 10px rgba(0,0,0,0.4), -4px -4px 10px rgba(255,255,255,0.015), inset 0 1px 0 rgba(255,255,255,0.03)',
                        border: '1px solid rgba(239,68,68,0.15)',
                      }}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PhoneOff size={20} /> End Call
                    </motion.button>
                    <motion.button
                      onClick={hangUp}
                      className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-zinc-500 hover:text-white text-sm neu-btn"
                      whileTap={{ scale: 0.98 }}
                    >
                      <SkipForward size={16} /> Skip Lead
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
