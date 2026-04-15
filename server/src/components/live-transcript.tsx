import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, Headphones, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptSegment {
  speaker: "agent" | "lead";
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface LiveTranscriptProps {
  callSid: string | undefined;
  isCallActive: boolean;
}

export function LiveTranscript({ callSid, isCallActive }: LiveTranscriptProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWs = useCallback(() => {
    if (!callSid || !isCallActive) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws/transcript/${callSid}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "segment" && msg.data) {
            setSegments((prev) => [...prev, msg.data]);
          } else if (msg.type === "ended") {
            setConnected(false);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
      };

      ws.onerror = () => {
        setConnected(false);
      };
    } catch {}
  }, [callSid, isCallActive]);

  useEffect(() => {
    connectWs();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connectWs]);

  useEffect(() => {
    if (!isCallActive) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
    }
  }, [isCallActive]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  if (!callSid) return null;

  return (
    <div className="neu-raised rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/[0.04]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}
      >
        <FileText size={16} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }} />
        <span className="text-sm font-semibold text-white flex-1">Live Transcript</span>
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
          connected ? "text-emerald-400" : "text-zinc-500"
        )}
        style={{
          background: connected
            ? 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))',
          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3)',
          border: connected ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.04)',
        }}>
          {connected ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              Listening
            </>
          ) : (
            "Waiting"
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px] max-h-[300px]">
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
            {connected ? (
              <>
                <Loader2 size={20} className="text-blue-400 animate-spin" />
                <p className="text-xs text-zinc-600">Waiting for speech...</p>
              </>
            ) : (
              <>
                <FileText size={20} className="text-zinc-600" />
                <p className="text-xs text-zinc-600">
                  Transcript will appear here when the call connects
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {segments.filter(s => s.isFinal).map((seg, i) => (
              <motion.div
                key={`${seg.timestamp}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2.5"
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  seg.speaker === "agent" ? "text-blue-400" : "text-amber-400"
                )}
                style={{
                  background: seg.speaker === "agent"
                    ? 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))'
                    : 'linear-gradient(145deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)',
                  border: seg.speaker === "agent"
                    ? '1px solid rgba(59,130,246,0.1)'
                    : '1px solid rgba(245,158,11,0.1)',
                }}>
                  {seg.speaker === "agent" ? <Headphones size={12} /> : <User size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider mb-0.5",
                    seg.speaker === "agent" ? "text-blue-400/70" : "text-amber-400/70"
                  )}>
                    {seg.speaker === "agent" ? "Agent" : "Lead"}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{seg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
