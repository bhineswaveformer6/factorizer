import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface WaitlistEntry {
  email: string;
  first_name?: string;
  use_case?: string;
  created_at: string;
  status: string;
}

const ADMIN_KEY = "archon-psi-001";

export default function AdminWaitlistPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const authenticate = useCallback(() => {
    const key = window.prompt("Enter admin key:");
    if (key === ADMIN_KEY) {
      setAuthenticated(true);
    } else if (key !== null) {
      window.alert("Invalid admin key.");
    }
  }, []);

  useEffect(() => {
    if (!authenticated) {
      authenticate();
    }
  }, [authenticated, authenticate]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("./api/waitlist/count");
      const data = await res.json();
      // We need to get the full list — use a dedicated endpoint or rely on count
      // For now, fetch from the list endpoint
      const listRes = await fetch("./api/waitlist/list");
      const listData = await listRes.json();
      if (listData.success) {
        setEntries(listData.entries);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchEntries();
    }
  }, [authenticated, fetchEntries]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#E8E2D4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#666] mb-4">Authentication required</p>
          <button
            onClick={authenticate}
            className="px-4 py-2 bg-[#BFA46A] text-[#0A0A0A] rounded-lg text-sm font-semibold"
          >
            Enter Admin Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E2D4]">
      <header className="border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="flex items-center gap-2 text-sm text-[#555] hover:text-[#BFA46A] transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back
            </span>
          </Link>
          <h1 className="text-sm font-semibold text-[#BFA46A]">Waitlist Admin</h1>
        </div>
        <button
          onClick={fetchEntries}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="rounded-xl bg-[#111] border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Waitlist Entries</h2>
            <span className="text-xs text-[#666]">{entries.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[#555] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Use Case</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#555]">
                      No waitlist entries yet.
                    </td>
                  </tr>
                )}
                {entries.map((entry, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium">{entry.first_name || "—"}</td>
                    <td className="px-5 py-3 text-[#999]">{entry.email}</td>
                    <td className="px-5 py-3 text-[#777]">{entry.use_case || "—"}</td>
                    <td className="px-5 py-3 text-[#666]">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#BFA46A]/10 text-[#BFA46A]">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
