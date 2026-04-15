import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function sovereignFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useSovereignHealth() {
  return useQuery({
    queryKey: ["sovereign", "health"],
    queryFn: () => sovereignFetch("/sovereign/health"),
    refetchInterval: 30000,
  });
}

export function useSovereignMemoryStats() {
  return useQuery({
    queryKey: ["sovereign", "memory", "stats"],
    queryFn: () => sovereignFetch("/sovereign/memory/stats"),
  });
}

export function useSovereignEntities(limit = 30) {
  return useQuery({
    queryKey: ["sovereign", "memory", "entities", limit],
    queryFn: () => sovereignFetch(`/sovereign/memory/entities?limit=${limit}`),
  });
}

export function useSovereignGraphStats() {
  return useQuery({
    queryKey: ["sovereign", "memory", "graph"],
    queryFn: () => sovereignFetch("/sovereign/memory/graph/stats"),
  });
}

export function useSovereignRelationships(limit = 50) {
  return useQuery({
    queryKey: ["sovereign", "memory", "relationships", limit],
    queryFn: () => sovereignFetch(`/sovereign/memory/relationships?limit=${limit}`),
  });
}

export function useSovereignComplianceReport() {
  return useQuery({
    queryKey: ["sovereign", "compliance", "report"],
    queryFn: () => sovereignFetch("/sovereign/compliance/report"),
  });
}

export function useSovereignAudit(limit = 10) {
  return useQuery({
    queryKey: ["sovereign", "audit", limit],
    queryFn: () => sovereignFetch(`/sovereign/audit?limit=${limit}`),
  });
}

export function useSovereignVoiceSession() {
  return useQuery({
    queryKey: ["sovereign", "voice", "session"],
    queryFn: () => sovereignFetch("/sovereign/voice/session"),
  });
}

export function useSovereignVoiceTranscript(limit = 30) {
  return useQuery({
    queryKey: ["sovereign", "voice", "transcript", limit],
    queryFn: () => sovereignFetch(`/sovereign/voice/transcript?limit=${limit}`),
  });
}

export function useSovereignVoiceSegments() {
  return useQuery({
    queryKey: ["sovereign", "voice", "segments"],
    queryFn: () => sovereignFetch("/sovereign/voice/segments"),
  });
}

export function useSovereignIngestStatus() {
  return useQuery({
    queryKey: ["sovereign", "ingest", "status"],
    queryFn: () => sovereignFetch("/sovereign/ingest/status"),
  });
}

export function useProcessUtterance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { input: string; context?: string }) =>
      sovereignFetch("/sovereign/process", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "memory"] });
      qc.invalidateQueries({ queryKey: ["sovereign", "compliance"] });
      qc.invalidateQueries({ queryKey: ["sovereign", "audit"] });
    },
  });
}

export function useComplianceCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      sovereignFetch("/sovereign/compliance/check", { method: "POST", body: JSON.stringify({ text }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "compliance"] });
    },
  });
}

export function useComplianceReset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sovereignFetch("/sovereign/compliance/reset", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "compliance"] });
    },
  });
}

export function useAddEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; value: string; confidence?: number; source?: string }) =>
      sovereignFetch("/sovereign/memory/entities", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "memory"] });
    },
  });
}

export function useVoiceSessionStart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sovereignFetch("/sovereign/voice/session/start", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "voice"] });
      qc.invalidateQueries({ queryKey: ["sovereign", "audit"] });
    },
  });
}

export function useVoiceSessionEnd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sovereignFetch("/sovereign/voice/session/end", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "voice"] });
      qc.invalidateQueries({ queryKey: ["sovereign", "audit"] });
    },
  });
}

export function useAddTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { speaker: string; text: string }) =>
      sovereignFetch("/sovereign/voice/transcript", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereign", "voice"] });
      qc.invalidateQueries({ queryKey: ["sovereign", "compliance"] });
    },
  });
}
