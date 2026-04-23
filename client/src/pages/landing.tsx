import { useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowRight, Upload, Zap, Eye, Shield, Target, Globe, Cpu } from "lucide-react";
import WaitlistCapture from "@/components/WaitlistCapture";

const GOLD  = "#d4af5a";
const CYAN  = "#22d4d4";
const RED   = "#f87171";
const GRN   = "#34d399";
const NAVY  = "#06080f";
const font  = "'Courier New', monospace";
const serif = "Georgia, serif";

// ── Demo teardown: Ring Doorbell (from blog post content)
const DEMO_TEARDOWN = {
  subject: "Ring Video Doorbell Pro",
  system_type: "hardware",
  one_line: "A $22 component stack sold for $229 — the hardware is the hook; the subscription is the business.",
  intelligence_brief: {
    what_it_is: "A battery or wired smart doorbell with HD video, two-way audio, motion detection, and cloud recording.",
    what_it_does: "Converts physical proximity events into push notifications, video clips, and home security alerts — then upsells cloud storage subscriptions.",
    how_it_works: "PIR sensor triggers image capture. SoC processes video, compresses it, and pushes to AWS via Wi-Fi. Companion app notifies owner. All analytics run cloud-side; the device is a sensor node.",
    where_it_fails: [
      { mode: "Wi-Fi dependency failure", probability: 7, severity: 9 },
      { mode: "Cloud outage — no local fallback", probability: 5, severity: 10 },
      { mode: "PIR false-positive rate at high heat", probability: 6, severity: 4 },
    ],
    what_to_watch: [
      "AWS us-east-1 latency spikes → 3× increase in missed event notifications",
      "PIR trigger rate >40/day → motion sensitivity calibration drift",
      "App store rating drops below 3.8 → subscription churn leading indicator",
    ],
  },
  pink: {
    critical_node: "Cloud Dependency / AWS Backend",
    score: 420,
    band: "CRITICAL",
    components: [
      { name: "Cloud Dependency / AWS Backend", p: 5, i: 10, n: 9, k: 7, pink: 420 },
      { name: "Wi-Fi Module (2.4GHz only)", p: 7, i: 9, n: 6, k: 4, pink: 378 },
      { name: "SoC / MCU (ESP32-class)", p: 3, i: 8, n: 8, k: 5, pink: 192 },
      { name: "PIR Motion Sensor", p: 6, i: 4, n: 3, k: 3, pink: 72 },
      { name: "LiPo Battery (battery models)", p: 4, i: 6, n: 2, k: 4, pink: 68 },
    ],
  },
  layers: {
    L1_anatomy: {
      components: [
        { name: "ESP32-class SoC", role: "Core compute — firmware, video encode, network", layer_type: "SILICON", cost_est: "$3.50" },
        { name: "1080p CMOS Image Sensor", role: "Video capture", layer_type: "IO_SENSOR", cost_est: "$4.00" },
        { name: "Wi-Fi 2.4GHz Module", role: "AWS push, app sync", layer_type: "SILICON", cost_est: "$2.00" },
        { name: "PIR Motion Sensor", role: "Proximity trigger — event initiation", layer_type: "IO_SENSOR", cost_est: "$0.50" },
        { name: "AWS Cloud Backend", role: "Video storage, push notifications, analytics", layer_type: "SOFTWARE", cost_est: "$0 upfront / $5–20/mo subscription" },
      ],
      total_bom_est: "~$22 component cost vs $229 MSRP",
      complexity_score: 5,
    },
    L4_reality_lens: {
      buyer_profile: "Homeowners 30–55, Amazon Prime subscribers, motivated by package theft anxiety",
      purchase_trigger: "Porch piracy incident or neighbor recommendation",
      growth_vector: "Ring Protect subscription penetration — from free to $9.99/mo converts $229 sale into $800+ LTV",
      moat_analysis: "Ecosystem lock-in (Neighbors app + Alexa + video history) not hardware. Moat is data and habit.",
      trajectory: "STABLE",
      trajectory_reason: "Market leader in US but margin compression from Eufy (no-sub competitors) and Google Nest AI features.",
    },
  },
  stone_score: 7.2,
  stone_band: "BUY",
  volts_earned: 3,
};

/* ── PINK Gauge SVG ── */
function PINKGauge({ score, band, criticalNode }: { score: number; band: string; criticalNode: string }) {
  const max = 500;
  const pct = Math.min(score / max, 1);
  const color = band === "CRITICAL" ? RED : band === "HIGH" ? "#f59e0b" : band === "MEDIUM" ? GOLD : GRN;
  const r = 54, cx = 64, cy = 64;
  const arc = 2 * Math.PI * r;
  const dashOffset = arc * (1 - pct);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={arc} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
          style={{ fontFamily: font, fontSize: 22, fontWeight: 700 }}>{score}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b"
          style={{ fontFamily: font, fontSize: 9 }}>PINK</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fill={color}
          style={{ fontFamily: font, fontSize: 8 }}>{band}</text>
      </svg>
      <div style={{ fontFamily: font, fontSize: 10, color: "#64748b", marginTop: 4 }}>CRITICAL NODE</div>
      <div style={{ fontFamily: font, fontSize: 11, color: RED, fontWeight: 700 }}>{criticalNode}</div>
    </div>
  );
}

/* ── Discovery Widget ── */
function DiscoveryWidget() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof DEMO_TEARDOWN | null>(null);
  const [gated, setGated] = useState(false);

  const runDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(DEMO_TEARDOWN);
      setGated(true);
      setLoading(false);
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    runDemo(); // In production: call /api/factorize with layer=anatomy only
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,90,0.2)",
      borderRadius: 16, padding: "28px 32px", maxWidth: 680, margin: "0 auto",
    }}>
      <div style={{ fontFamily: font, fontSize: 10, color: GOLD, letterSpacing: "0.15em", marginBottom: 12 }}>
        ⬡ DISCOVERY WIDGET · LAYER 1 FREE · 10 SECONDS
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="DeepEX, Apple Vision Pro, Ring Doorbell, NVIDIA H100..."
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#e2e8f0", fontSize: 14, fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button type="submit" disabled={loading}
          style={{
            padding: "12px 20px", borderRadius: 10, fontFamily: font, fontSize: 12,
            fontWeight: 700, background: GOLD, color: "#000", border: "none",
            cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap",
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? "X-RAYING..." : "X-RAY IT →"}
        </button>
      </form>

      {!result && !loading && (
        <button onClick={runDemo}
          style={{ fontFamily: font, fontSize: 11, color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
          → Try Ring Doorbell Pro (demo)
        </button>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontFamily: font, fontSize: 12, color: GOLD }}>
            ⬡ Identifying components...
          </div>
          <div style={{ fontFamily: font, fontSize: 10, color: "#475569", marginTop: 8 }}>
            LAYER 1 — ANATOMY · FREE
          </div>
        </div>
      )}

      {result && (
        <div>
          {/* Subject + one line */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
              {result.subject}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{result.one_line}</div>
          </div>

          {/* Intelligence Brief — free fields */}
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)", padding: "16px 18px", marginBottom: 16,
          }}>
            <div style={{ fontFamily: font, fontSize: 9, color: "#475569", marginBottom: 10, letterSpacing: "0.12em" }}>
              INTELLIGENCE BRIEF · LAYER 1 ANATOMY (FREE)
            </div>
            {[
              ["WHAT IT IS", result.intelligence_brief.what_it_is],
              ["WHAT IT DOES", result.intelligence_brief.what_it_does],
              ["HOW IT WORKS", result.intelligence_brief.how_it_works],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: font, fontSize: 9, color: GOLD, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{val}</div>
              </div>
            ))}

            {/* Gated fields */}
            <div style={{ position: "relative" }}>
              {[
                ["WHERE IT FAILS", "Failure modes ranked by probability × severity"],
                ["WHAT TO WATCH", "3 early warning signals before failure occurs"],
              ].map(([label, hint]) => (
                <div key={label} style={{ marginBottom: 10, filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
                  <div style={{ fontFamily: font, fontSize: 9, color: RED, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{hint} · {hint} · {hint}</div>
                </div>
              ))}
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(6,8,15,0.7)", borderRadius: 8, flexDirection: "column", gap: 8,
              }}>
                <div style={{ fontFamily: font, fontSize: 10, color: RED }}>⚠ CRITICAL NODE DETECTED</div>
                <div style={{ fontFamily: font, fontSize: 9, color: "#64748b" }}>
                  WHERE IT FAILS + WHAT TO WATCH + PINK Score → unlock with free account
                </div>
              </div>
            </div>
          </div>

          {/* PINK teaser */}
          <div style={{
            display: "flex", gap: 16, alignItems: "center",
            background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, padding: "14px 18px", marginBottom: 16,
          }}>
            <div style={{ filter: "blur(6px)", pointerEvents: "none" }}>
              <PINKGauge score={result.pink.score} band={result.pink.band} criticalNode={result.pink.critical_node} />
            </div>
            <div>
              <div style={{ fontFamily: font, fontSize: 10, color: RED, marginBottom: 6 }}>
                🔴 CRITICAL NODE IDENTIFIED
              </div>
              <div style={{ fontFamily: font, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                PINK Score + Critical Node analysis<br/>
                WHERE IT FAILS · WHAT TO WATCH<br/>
                Layers 2–5: Mechanics, SWOT, Reality Lens, Blueprint<br/>
                <span style={{ color: RED }}>→ requires free account</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/analyze">
              <button style={{
                flex: 1, padding: "13px 0", borderRadius: 10, fontFamily: font, fontSize: 12,
                fontWeight: 700, background: GOLD, color: "#000", border: "none", cursor: "pointer",
              }}>
                UNLOCK FULL X-RAY →
              </button>
            </Link>
            <Link href="/reality-lens">
              <button style={{
                padding: "13px 20px", borderRadius: 10, fontFamily: font, fontSize: 12,
                background: "none", color: CYAN, border: `1px solid ${CYAN}40`, cursor: "pointer",
              }}>
                REALITY LENS
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Landing Page ── */
export default function LandingPage() {
  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: "#e2e8f0" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${NAVY}f0`, backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: GOLD, letterSpacing: "0.1em" }}>
          ⬡ FACTORIZER
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[
            { label: "Analyze", href: "/analyze" },
            { label: "Reality Lens", href: "/reality-lens" },
          ].map(({ label, href }) => (
            <Link key={label} href={href}>
              <span style={{ fontFamily: font, fontSize: 11, color: "#64748b", cursor: "pointer",
                letterSpacing: "0.08em" }}>{label}</span>
            </Link>
          ))}
          <Link href="/analyze">
            <button style={{
              fontFamily: font, fontSize: 11, padding: "7px 16px", borderRadius: 8,
              background: GOLD, color: "#000", border: "none", cursor: "pointer", fontWeight: 700,
            }}>
              X-RAY ANYTHING →
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 32px 60px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 24,
          border: `1px solid ${GOLD}30`, background: `${GOLD}08`, marginBottom: 32,
        }}>
          <span style={{ fontFamily: font, fontSize: 10, color: GOLD, letterSpacing: "0.15em" }}>
            UNIVERSAL SYSTEM COMPREHENSION ENGINE
          </span>
        </div>

        <h1 style={{
          fontFamily: serif, fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 700,
          lineHeight: 1.15, marginBottom: 20, color: "#f1f5f9",
        }}>
          Point it at anything.<br />
          <span style={{ color: GOLD }}>Get the X-ray.</span>
        </h1>

        <p style={{
          fontSize: 17, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 16px",
        }}>
          Factorizer tears down any product, system, or technology — hardware, software, infrastructure, geotechnical — into five layers of truth.
          Anatomy → Mechanics → SWOT → Reality Lens → Blueprint.
        </p>

        <p style={{ fontFamily: font, fontSize: 12, color: "#475569", marginBottom: 48 }}>
          The PINK metric surfaces the single component most likely to kill the system.
        </p>

        {/* ── DISCOVERY WIDGET ── */}
        <DiscoveryWidget />
      </section>

      {/* ── 5 LAYERS ── */}
      <section style={{ padding: "60px 32px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: font, fontSize: 10, color: "#475569", letterSpacing: "0.15em", marginBottom: 12 }}>
            THE FIVE-LAYER TEARDOWN ENGINE
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: "#f1f5f9" }}>
            Every session runs deeper than the last
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { num: "L1", label: "Anatomy", desc: "Components, modules, integrations. Delivered free in 10 seconds — the discovery layer.", color: "#a78bfa", icon: Cpu, free: true },
            { num: "L2", label: "Mechanics", desc: "Data flow, energy paths, load paths. Rendered as an isometric X-ray schematic.", color: CYAN, icon: Eye },
            { num: "L3", label: "SWOT & Competitive Intel", desc: "Deep competitive landscape. Who else does this? What is the gap?", color: GRN, icon: Target },
            { num: "L4", label: "Reality Lens", desc: "Market simulation. Buyer profile, purchase trigger, growth vector, moat analysis.", color: GOLD, icon: Globe },
            { num: "L5", label: "Blueprint", desc: "Full compiled intelligence report. PINK score + Critical Node + X-ray schematic. Shareable, exportable.", color: RED, icon: Shield },
          ].map(({ num, label, desc, color, icon: Icon, free }) => (
            <div key={num} style={{
              background: "rgba(255,255,255,0.02)", border: `1px solid ${color}25`,
              borderRadius: 12, padding: "20px 22px", position: "relative",
            }}>
              {free && (
                <span style={{
                  position: "absolute", top: 12, right: 12,
                  fontFamily: font, fontSize: 9, color: GRN,
                  background: `${GRN}15`, border: `1px solid ${GRN}30`,
                  padding: "2px 8px", borderRadius: 4,
                }}>FREE</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontFamily: font, fontSize: 10, color, letterSpacing: "0.1em" }}>{num}</span>
              </div>
              <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PINK METRIC ── */}
      <section style={{
        padding: "60px 32px", maxWidth: 800, margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: font, fontSize: 10, color: RED, letterSpacing: "0.15em", marginBottom: 12 }}>
              THE PINK METRIC · PROPRIETARY IP
            </div>
            <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
              The single component most likely to <span style={{ color: RED }}>kill the system</span>
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
              PINK diverges from standard FMECA in two critical ways. The dependency multiplier (N) amplifies risk for highly connected nodes. The knowledge gap factor (K) penalizes opacity — an unknown failure mode scores higher than a well-understood one of equal severity.
            </p>
            <div style={{
              fontFamily: font, fontSize: 13, color: GOLD, letterSpacing: "0.05em",
              background: "rgba(212,175,90,0.08)", border: `1px solid ${GOLD}30`,
              borderRadius: 8, padding: "12px 16px",
            }}>
              PINK = P × I × √(N × K)
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PINKGauge
              score={DEMO_TEARDOWN.pink.score}
              band={DEMO_TEARDOWN.pink.band}
              criticalNode={DEMO_TEARDOWN.pink.critical_node}
            />
          </div>
        </div>
      </section>

      {/* ── INTELLIGENCE BRIEF FORMAT ── */}
      <section style={{
        padding: "60px 32px", maxWidth: 800, margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: font, fontSize: 10, color: "#475569", letterSpacing: "0.15em", marginBottom: 12 }}>
            THE INTELLIGENCE BRIEF · LAYER 2 OUTPUT
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 700 }}>
            Structured like a military intelligence report
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Not a manual. Not a dashboard. Five fixed fields, every time.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { num: "01", label: "WHAT IT IS", desc: "One sentence. No jargon. Canonical identity.", color: "#a78bfa" },
            { num: "02", label: "WHAT IT DOES", desc: "The specific job it performs.", color: CYAN },
            { num: "03", label: "HOW IT WORKS", desc: "Mechanics in plain language — the actual operating principle.", color: GRN },
            { num: "04", label: "WHERE IT FAILS", desc: "Failure modes ranked by probability × severity.", color: RED, gated: true },
            { num: "05", label: "WHAT TO WATCH", desc: "Three early warning signals before failure occurs.", color: RED, gated: true },
          ].map(({ num, label, desc, color, gated }) => (
            <div key={num} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 18px",
              background: gated ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${color}20`, borderRadius: 10,
              opacity: gated ? 0.7 : 1,
            }}>
              <span style={{ fontFamily: font, fontSize: 10, color, minWidth: 24 }}>{num}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: font, fontSize: 11, color, marginRight: 12 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{desc}</span>
              </div>
              {gated && (
                <span style={{ fontFamily: font, fontSize: 9, color: RED,
                  background: `${RED}15`, border: `1px solid ${RED}30`,
                  padding: "2px 8px", borderRadius: 4 }}>GATED</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT IT WORKS ON ── */}
      <section style={{
        padding: "60px 32px", maxWidth: 800, margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: font, fontSize: 10, color: "#475569", letterSpacing: "0.15em", marginBottom: 24 }}>
          UNIVERSAL INPUT · ANY SYSTEM
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 24 }}>
          {[
            "Software products", "Hardware devices", "AI models + agents",
            "Physical infrastructure", "Industrial machinery",
            "Geotechnical systems", "Biological systems", "Financial instruments",
          ].map(tag => (
            <span key={tag} style={{
              fontFamily: font, fontSize: 10, padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
            }}>{tag}</span>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
          Point Factorizer at anything. Text, URL, or photo. The X-ray works universally — from a Ring doorbell to a PLAXIS geotechnical FEM model.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "60px 32px 80px", textAlign: "center" }}>
        <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Start with the doorbell.
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
          Layer 1 is free. Always. The X-ray starts in 10 seconds.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/analyze">
            <button style={{
              padding: "14px 32px", borderRadius: 12, fontFamily: font, fontSize: 13,
              fontWeight: 700, background: GOLD, color: "#000", border: "none", cursor: "pointer",
            }}>
              UPLOAD A PHOTO → GET THE BLUEPRINT
            </button>
          </Link>
          <Link href="/reality-lens">
            <button style={{
              padding: "14px 24px", borderRadius: 12, fontFamily: font, fontSize: 13,
              background: "none", color: CYAN, border: `1px solid ${CYAN}40`, cursor: "pointer",
            }}>
              REALITY LENS →
            </button>
          </Link>
        </div>
      </section>

      <WaitlistCapture />
    </div>
  );
}
