import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight } from "lucide-react";

const USE_CASE_OPTIONS = ["Founder", "Investor", "Engineer", "Operator", "Other"] as const;

export default function WaitlistCapture() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Auto-trigger after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed && position === null) {
        setVisible(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [dismissed, position]);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("./api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim() || undefined,
          use_case: useCase || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosition(data.position);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [email, firstName, useCase]);

  // Expose open function via a global-ish approach for the button trigger
  useEffect(() => {
    (window as any).__openWaitlist = open;
    return () => { delete (window as any).__openWaitlist; };
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-[#f5c842]/20 shadow-2xl"
      style={{ backgroundColor: "#06080e" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold tracking-wide" style={{ color: "#f5c842" }}>
          Join the Waitlist
        </h3>
        <button
          onClick={dismiss}
          className="p-1 rounded-md hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" style={{ color: "#eef2f8" }} />
        </button>
      </div>

      <div className="px-5 pb-5">
        {position !== null ? (
          <div className="py-4 text-center">
            <p className="text-sm leading-relaxed" style={{ color: "#eef2f8" }}>
              You're <span className="font-bold" style={{ color: "#f5c842" }}>#{position}</span> on the list.
              <br />
              We'll reach out within 48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                required
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-white/10 focus:border-[#f5c842]/40 focus:outline-none focus:ring-1 focus:ring-[#f5c842]/20 transition-all"
                style={{ backgroundColor: "#0c0e14", color: "#eef2f8" }}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-white/10 focus:border-[#f5c842]/40 focus:outline-none focus:ring-1 focus:ring-[#f5c842]/20 transition-all"
                style={{ backgroundColor: "#0c0e14", color: "#eef2f8" }}
              />
            </div>
            <div>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-white/10 focus:border-[#f5c842]/40 focus:outline-none focus:ring-1 focus:ring-[#f5c842]/20 transition-all appearance-none"
                style={{ backgroundColor: "#0c0e14", color: useCase ? "#eef2f8" : "#555" }}
              >
                <option value="" disabled>Use case (optional)</option>
                {USE_CASE_OPTIONS.map((uc) => (
                  <option key={uc} value={uc}>{uc}</option>
                ))}
              </select>
            </div>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: "#f5c842", color: "#06080e" }}
            >
              {submitting ? "Submitting..." : "Get Early Access"}
              {!submitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
