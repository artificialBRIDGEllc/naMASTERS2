import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { useLeads } from "@/hooks/use-leads";
import { Upload, Search, Phone, Filter, ChevronLeft, ChevronRight, MoreHorizontal, UserPlus, Users } from "lucide-react";
import { formatPhone, formatRelativeTime, cn } from "@/lib/utils";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  READY: "text-emerald-400",
  IN_PROGRESS: "text-blue-400",
  CALLBACK: "text-amber-400",
  COMPLETED: "text-zinc-500",
  DNC: "text-red-400",
  EXHAUSTED: "text-orange-400",
  PAUSED: "text-purple-400",
};

const statusBg: Record<string, object> = {
  READY: { background: 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))', border: '1px solid rgba(16,185,129,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  IN_PROGRESS: { background: 'linear-gradient(145deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))', border: '1px solid rgba(59,130,246,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  CALLBACK: { background: 'linear-gradient(145deg, rgba(245,158,11,0.1), rgba(245,158,11,0.03))', border: '1px solid rgba(245,158,11,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  COMPLETED: { background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  DNC: { background: 'linear-gradient(145deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))', border: '1px solid rgba(239,68,68,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  EXHAUSTED: { background: 'linear-gradient(145deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))', border: '1px solid rgba(249,115,22,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
  PAUSED: { background: 'linear-gradient(145deg, rgba(168,85,247,0.1), rgba(168,85,247,0.03))', border: '1px solid rgba(168,85,247,0.15)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)' },
};

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { leads, total, stats, isLoading, importLeads, isImporting } = useLeads(page, statusFilter);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importLeads({ data: { csv: text } });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filtered = search
    ? leads.filter(l => `${l.firstName} ${l.lastName} ${l.phone}`.toLowerCase().includes(search.toLowerCase()))
    : leads;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Lead Management</h1>
            <p className="text-zinc-500 text-sm mt-1">Import and organize your call queue</p>
          </div>
          <div className="flex gap-2">
            <input type="file" accept=".csv" className="hidden" ref={fileRef} onChange={handleFileUpload} />
            <motion.button 
              onClick={() => fileRef.current?.click()} 
              disabled={isImporting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn flex items-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={16} />
              {isImporting ? "Processing..." : "Import CSV"}
            </motion.button>
            <motion.button
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus size={16} /> Add Lead
            </motion.button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(stats).map(([key, val], i) => (
              <motion.div
                key={key}
                className="neu-raised-sm p-3 rounded-2xl flex flex-col justify-center items-center neu-card-hover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <span className="text-xl font-bold font-display text-white">{val as number}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">{key}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 neu-inset p-2.5 rounded-2xl">
          <div className="relative w-full sm:w-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-xl text-sm text-white appearance-none neu-input focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CALLBACK">Callback</option>
              <option value="COMPLETED">Completed</option>
              <option value="DNC">DNC</option>
            </select>
          </div>
        </div>

        <div className="neu-raised rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/[0.04]" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)' }}>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Lead Info</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Location</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Activity</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-600">
                      <div className="w-8 h-8 mx-auto mb-3 rounded-full neu-inset flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      Loading leads...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="w-14 h-14 neu-inset rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users size={20} className="text-zinc-600" />
                      </div>
                      <p className="text-zinc-500">No leads found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="neu-table-row group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200 mb-1">{lead.firstName} {lead.lastName}</div>
                        <div className="text-zinc-600 font-mono text-xs flex items-center gap-1.5">
                          <Phone size={10} /> {formatPhone(lead.phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusColors[lead.queueStatus] || "text-zinc-500")}
                          style={statusBg[lead.queueStatus] || statusBg.COMPLETED}
                        >
                          {lead.queueStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {lead.state || '—'} {lead.zipCode ? <span className="text-zinc-600">({lead.zipCode})</span> : ''}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300">{lead.dialAttempts} calls</div>
                        <div className="text-zinc-600 text-xs mt-0.5">{formatRelativeTime(lead.lastDialedAt)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button
                          className="p-2 text-zinc-600 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 neu-btn"
                          whileTap={{ scale: 0.9 }}
                        >
                          <MoreHorizontal size={16} />
                        </motion.button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-white/[0.04] flex items-center justify-between" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)' }}>
            <span className="text-sm text-zinc-600">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} leads
            </span>
            <div className="flex gap-2">
              <motion.button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed neu-btn"
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button 
                disabled={page * 50 >= total} 
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed neu-btn"
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
