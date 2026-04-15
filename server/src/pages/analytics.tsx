import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@workspace/api-client-react";
import { Phone, PhoneIncoming, Clock, Target, Activity } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface AgentStatsData {
  totalCalls: number;
  answered: number;
  answerRate: number;
  totalTalkTime: number;
  avgTalkTime: number;
  sales: number;
  appointments: number;
  conversionRate: number;
}

interface TeamMember {
  id: string;
  name: string;
  stats: AgentStatsData;
}

interface DispItem {
  disposition: string;
  count: number;
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

export default function AnalyticsPage() {
  const { data: rawAgentStats } = useQuery({
    queryKey: ["/api/analytics", { type: "agent" }],
    queryFn: () => getAnalytics({ type: "agent" })
  });

  const { data: rawTeamStats } = useQuery({
    queryKey: ["/api/analytics", { type: "team" }],
    queryFn: () => getAnalytics({ type: "team" })
  });

  const { data: rawDispositions } = useQuery({
    queryKey: ["/api/analytics", { type: "dispositions" }],
    queryFn: () => getAnalytics({ type: "dispositions" })
  });

  const { data: rawQueueStats } = useQuery({
    queryKey: ["/api/analytics", { type: "queue" }],
    queryFn: () => getAnalytics({ type: "queue" })
  });

  const agentStats = rawAgentStats as AgentStatsData | undefined;
  const teamData = (Array.isArray(rawTeamStats) ? rawTeamStats : []) as TeamMember[];
  const dispData = (Array.isArray(rawDispositions) ? rawDispositions : []) as DispItem[];
  const queueStats = rawQueueStats as QueueStatsData | undefined;

  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];

  const perfCards = [
    { icon: Phone, value: agentStats?.totalCalls ?? 0, label: "Calls Made", color: "text-blue-400", glowColor: "rgba(59,130,246,0.15)" },
    { icon: PhoneIncoming, value: agentStats?.answered ?? 0, label: "Answered", badge: `${agentStats?.answerRate ?? 0}%`, badgeColor: "text-emerald-400", color: "text-emerald-400", glowColor: "rgba(16,185,129,0.15)" },
    { icon: Clock, value: formatDuration(agentStats?.totalTalkTime ?? 0), label: "Talk Time", color: "text-purple-400", glowColor: "rgba(168,85,247,0.15)" },
    { icon: Target, value: agentStats?.sales ?? 0, label: "Sales", badge: `${agentStats?.conversionRate ?? 0}% CV`, badgeColor: "text-amber-400", color: "text-amber-400", glowColor: "rgba(245,158,11,0.15)" },
  ];

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Performance Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">Track your metrics and team performance</p>
        </div>

        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Today's Performance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {perfCards.map((card, i) => (
              <motion.div
                key={i}
                className="neu-raised rounded-2xl p-5 relative overflow-hidden neu-card-hover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <card.icon className="absolute right-4 top-4 opacity-[0.06]" size={40} />
                <p className={`text-3xl font-bold font-display ${card.color} mb-1`}>{card.value}</p>
                <p className="text-sm text-zinc-500 font-medium">
                  {card.label}
                  {card.badge && (
                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${card.badgeColor}`}
                      style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >{card.badge}</span>
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section
            className="neu-raised rounded-3xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6">Dispositions</h2>
            {dispData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...dispData].sort((a,b) => b.count - a.count).slice(0, 7)} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="disposition" type="category" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 12}} width={120} />
                    <Tooltip
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{backgroundColor: '#141418', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', color: '#fff', boxShadow: '4px 4px 12px rgba(0,0,0,0.4)'}}
                      itemStyle={{color: '#3b82f6'}}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {dispData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-600">No disposition data yet.</div>
            )}
          </motion.section>

          <motion.section
            className="neu-raised rounded-3xl p-6 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-blue-400/50" /> Queue Health
            </h2>
            {queueStats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                {(Object.entries(queueStats) as [string, number][]).filter(([k]) => k !== 'total').map(([key, val], i) => (
                  <motion.div
                    key={key}
                    className="neu-inset p-4 rounded-xl flex flex-col items-center justify-center text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                  >
                    <span className="text-2xl font-bold text-white mb-1">{val}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">{key.replace('_', ' ')}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {teamData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Team Leaderboard</h2>
            <div className="neu-raised rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-zinc-600 text-xs uppercase tracking-wider" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)' }}>
                      <th className="text-left px-6 py-4 font-semibold">Agent</th>
                      <th className="text-right px-6 py-4 font-semibold">Calls</th>
                      <th className="text-right px-6 py-4 font-semibold">Answered</th>
                      <th className="text-right px-6 py-4 font-semibold">Answer %</th>
                      <th className="text-right px-6 py-4 font-semibold">Sales</th>
                      <th className="text-right px-6 py-4 font-semibold">Talk Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {[...teamData].sort((a, b) => b.stats.sales - a.stats.sales).map((agent, i) => (
                      <tr key={agent.id} className="neu-table-row">
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                          <span className="w-6 text-center text-zinc-700 font-mono text-xs">{i + 1}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-blue-400 neu-btn-primary" style={{ fontSize: '11px' }}>
                            {agent.name.charAt(0)}
                          </div>
                          <span className="text-zinc-200">{agent.name}</span>
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-zinc-400">{agent.stats.totalCalls}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-zinc-400">{agent.stats.answered}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-zinc-500">{agent.stats.answerRate}%</td>
                        <td className="px-6 py-4 text-right tabular-nums font-bold text-amber-400">{agent.stats.sales}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-zinc-500">{formatDuration(agent.stats.totalTalkTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </Layout>
  );
}
