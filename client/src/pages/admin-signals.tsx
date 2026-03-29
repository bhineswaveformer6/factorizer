import { useState, useEffect, useCallback } from "react";

interface Signal {
  id: string;
  text: string;
  email: string;
  page: string;
  priority: "critical" | "strategic" | "iteration";
  intent: string;
  urgency_score: number;
  status: "new" | "reviewed" | "actioned" | "archived";
  created_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  strategic: "#f5c842",
  iteration: "#6b7280",
};

const STATUS_OPTIONS = ["new", "reviewed", "actioned", "archived"] as const;

export default function AdminSignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("./api/signals");
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals);
      }
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/signals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setSignals((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: data.signal.status } : s))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filtered =
    filterPriority === "all"
      ? signals
      : signals.filter((s) => s.priority === filterPriority);

  return (
    <div className="min-h-screen" style={{ background: "#06080e", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Signal Box — Admin
            </h1>
            <p className="text-white/40 text-xs font-mono mt-0.5">
              Priority queue · {signals.length} total signals
            </p>
          </div>
          <button
            onClick={fetchSignals}
            className="px-3 py-1.5 text-xs font-mono border border-white/20 rounded hover:bg-white/5 transition-colors text-white/60"
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          {["all", "critical", "strategic", "iteration"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                filterPriority === p
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
              }`}
            >
              {p.toUpperCase()}
              {p !== "all" && (
                <span className="ml-1 opacity-50">
                  ({signals.filter((s) => s.priority === p).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm">
            Loading signals...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm">
            No signals found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    URGENCY
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    PRIORITY
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    SIGNAL
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    INTENT
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    EMAIL
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    STATUS
                  </th>
                  <th className="py-3 px-3 text-xs font-mono text-white/40 font-normal">
                    TIME
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((signal) => (
                  <tr
                    key={signal.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Urgency Score */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold font-mono"
                          style={{
                            background:
                              signal.urgency_score >= 80
                                ? "rgba(239,68,68,0.15)"
                                : signal.urgency_score >= 50
                                ? "rgba(245,200,66,0.15)"
                                : "rgba(107,114,128,0.15)",
                            color:
                              signal.urgency_score >= 80
                                ? "#ef4444"
                                : signal.urgency_score >= 50
                                ? "#f5c842"
                                : "#6b7280",
                          }}
                        >
                          {signal.urgency_score}
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                        style={{
                          background: `${PRIORITY_COLORS[signal.priority]}20`,
                          color: PRIORITY_COLORS[signal.priority],
                        }}
                      >
                        {signal.priority.toUpperCase()}
                      </span>
                    </td>

                    {/* Signal text */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-white/80 truncate" title={signal.text}>
                        {signal.text}
                      </div>
                      <div className="text-white/30 text-xs font-mono mt-0.5">
                        {signal.page}
                      </div>
                    </td>

                    {/* Intent */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-white/60 text-xs truncate" title={signal.intent}>
                        {signal.intent}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3">
                      <span className="text-white/50 text-xs font-mono">
                        {signal.email}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3">
                      <select
                        value={signal.status}
                        onChange={(e) => updateStatus(signal.id, e.target.value)}
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs font-mono text-white/60 focus:outline-none focus:border-white/30"
                        style={{ background: "#06080e" }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3">
                      <span className="text-white/30 text-xs font-mono">
                        {new Date(signal.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
