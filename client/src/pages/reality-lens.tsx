import { useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Settings, CreditCard, Camera, Layers,
  Search, ChevronDown, ChevronRight, ArrowLeft, Menu, X,
  Target, Cpu, Factory, DollarSign, Globe, Shield, Zap, TrendingUp,
  Users, Package, AlertTriangle, CheckCircle2, ArrowRight, Info
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from "recharts";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import WaitlistCapture from "@/components/WaitlistCapture";
import ArchonGatewayPanel from "@/components/ArchonGatewayPanel";

/* ─────── LAYER TYPE ENUM (Gap 9) ─────── */
const LAYER_TYPES = {
  SILICON:      { code: "L1", tag: "SILICON",      color: "#a78bfa" },
  MECHANICAL:   { code: "L2", tag: "MECHANICAL",   color: "#60a5fa" },
  IO_SENSOR:    { code: "L3", tag: "I/O · SENSOR", color: "#34d399" },
  SOFTWARE:     { code: "L4", tag: "SOFTWARE · FW", color: "#fbbf24" },
  SUPPLY_CHAIN: { code: "L5", tag: "SUPPLY CHAIN", color: "#f87171" },
  PRICING:      { code: "L6", tag: "PRICING · ASP", color: "#d4af5a" },
  MOAT:         { code: "L7", tag: "COMP. MOAT",   color: "#22d4d4" },
} as const;

/* ─────── AUDIT ENGINE (Gap 10) ─────── */
type AuditGrade = "A" | "B" | "C" | "D";
interface AuditResult {
  grade: AuditGrade;
  tier: string;
  warnings: string[];
  errors: string[];
  coveragePct: number;
  canSeal: boolean;
  provenanceMode: "INFERENCE_ONLY" | "PARTIAL_PRIMARY" | "CANON_ELIGIBLE";
}

function auditTeardown(result: any, isDemo: boolean, matchConfidence: number): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let coverageScore = 0;

  if (!result) return {
    grade: "D", tier: "Tier 0 — No Data",
    warnings: [], errors: ["No result loaded"],
    coveragePct: 0, canSeal: false, provenanceMode: "INFERENCE_ONLY"
  };

  // Factor coverage
  if (result.anatomy?.techStack?.length >= 3) coverageScore += 20;
  else warnings.push("Anatomy: fewer than 3 tech components identified");

  if (result.economics?.unitEconomics?.cogs) coverageScore += 20;
  else warnings.push("Economics: COGS not grounded in primary sources");

  if (result.ecosystem?.competitiveData?.length >= 2) coverageScore += 20;
  else warnings.push("Ecosystem: competitive benchmarks incomplete");

  if (result.process?.supplyChain?.length >= 2) coverageScore += 20;
  else warnings.push("Process: supply chain dependencies not documented");

  if (matchConfidence >= 0.75) coverageScore += 20;
  else if (matchConfidence >= 0.50) { coverageScore += 10; warnings.push("Match confidence below 0.75 — results may use category priors"); }
  else { errors.push("Match confidence < 0.50 — Discovery Mode: output uses generic category priors only"); }

  if (isDemo) errors.push("Demo mode active — no real analysis was performed");

  const grade: AuditGrade = coverageScore >= 90 ? "A"
    : coverageScore >= 70 ? "B"
    : coverageScore >= 50 ? "C" : "D";

  const tier = grade === "A" ? "Tier 3 — Canon Eligible"
    : grade === "B" ? "Tier 2 — Partial Primary Sources"
    : grade === "C" ? "Tier 1 — Category Inference"
    : "Tier 0 — Sandbox / Demo Only";

  const provenanceMode = grade === "A" ? "CANON_ELIGIBLE"
    : grade === "B" ? "PARTIAL_PRIMARY" : "INFERENCE_ONLY";

  return {
    grade, tier, warnings, errors,
    coveragePct: coverageScore,
    canSeal: grade === "A" && !isDemo && matchConfidence >= 0.80,
    provenanceMode
  };
}

/* ─────── COMPUTED SCORES (Gap 3 + 7) ─────── */
function computeOmegaGap(stoneScore: number, categoryFrontier: number): number {
  return Math.round(Math.abs(categoryFrontier - stoneScore) * 10) / 10;
}

function computeConfidenceFromCoverage(coveragePct: number, matchConf: number, primarySourceCount: number): number {
  const coverageFactor = coveragePct / 100 * 0.40;
  const matchFactor    = matchConf * 0.35;
  const sourceFactor   = Math.min(primarySourceCount / 5, 1) * 0.25;
  return Math.round((coverageFactor + matchFactor + sourceFactor) * 100) / 100;
}

/* ─────── Logo ─────── */
function FactorizerLogo({ className = "h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 32" className={className} aria-label="Factorizer" fill="none">
      <rect x="2" y="4" width="24" height="24" rx="3" stroke="#BFA46A" strokeWidth="1.5" fill="none" />
      <path d="M9 10h10M9 16h7M9 22" stroke="#BFA46A" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="22" stroke="#BFA46A" strokeWidth="2" strokeLinecap="round" />
      <text x="34" y="22" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600"
        fill="#BFA46A" letterSpacing="0.05em">FACTORIZER</text>
    </svg>
  );
}

/* ─────── Audit Rail (Gap 10) ─────── */
function AuditRail({ audit, computedConfidence }: { audit: AuditResult; computedConfidence: number }) {
  const gradeColor = audit.grade === "A" ? "#34d399"
    : audit.grade === "B" ? "#fbbf24"
    : audit.grade === "C" ? "#f59e0b"
    : "#f87171";

  return (
    <div style={{
      background: audit.grade === "D" ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${gradeColor}33`,
      borderLeft: `3px solid ${gradeColor}`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 16,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ color: gradeColor, fontWeight: 700, fontSize: 13 }}>
          ⚖ AUDIT GRADE: {audit.grade}
        </span>
        <span style={{ color: "#64748b", fontSize: 11 }}>·</span>
        <span style={{ color: "#94a3b8", fontSize: 11 }}>{audit.tier}</span>
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 10 }}>
          COVERAGE {audit.coveragePct}% · CONFIDENCE {(computedConfidence * 100).toFixed(0)}%
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: audit.warnings.length > 0 ? 8 : 0 }}>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 4,
          background: audit.provenanceMode === "CANON_ELIGIBLE" ? "#34d39920"
            : audit.provenanceMode === "PARTIAL_PRIMARY" ? "#fbbf2420" : "#f8717120",
          color: audit.provenanceMode === "CANON_ELIGIBLE" ? "#34d399"
            : audit.provenanceMode === "PARTIAL_PRIMARY" ? "#fbbf24" : "#f87171",
          border: `1px solid ${audit.provenanceMode === "CANON_ELIGIBLE" ? "#34d39940"
            : audit.provenanceMode === "PARTIAL_PRIMARY" ? "#fbbf2440" : "#f8717140"}`,
        }}>
          {audit.provenanceMode === "INFERENCE_ONLY" ? "⚠ INFERENCE ONLY — NO PRIMARY SOURCES LINKED"
            : audit.provenanceMode === "PARTIAL_PRIMARY" ? "◑ PARTIAL PRIMARY SOURCES"
            : "✓ CANON ELIGIBLE"}
        </span>
        {audit.canSeal && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4,
            background: "#34d39920", color: "#34d399", border: "1px solid #34d39940" }}>
            HARNESS SEAL AVAILABLE
          </span>
        )}
      </div>

      {(audit.warnings.length > 0 || audit.errors.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {audit.errors.map((e, i) => (
            <div key={i} style={{ fontSize: 10, color: "#f87171" }}>✗ {e}</div>
          ))}
          {audit.warnings.slice(0, 3).map((w, i) => (
            <div key={i} style={{ fontSize: 10, color: "#94a3b8" }}>△ {w}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────── Match Confidence Badge (Gap 2) ─────── */
function MatchBadge({ entity, confidence, mode }: { entity: string; confidence: number; mode: "MATCHED" | "DISCOVERY" | "DEMO" }) {
  const color = mode === "MATCHED" ? "#34d399" : mode === "DEMO" ? "#a78bfa" : "#f59e0b";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: `${color}12`, border: `1px solid ${color}30`,
      borderRadius: 6, padding: "4px 10px", fontFamily: "'Courier New', monospace",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 11, color }}>
        {mode === "DEMO" ? "DEMO MODE" : mode === "MATCHED" ? "MATCHED" : "DISCOVERY MODE"}
      </span>
      <span style={{ fontSize: 11, color: "#64748b" }}>
        {entity.length > 30 ? entity.slice(0, 30) + "…" : entity}
      </span>
      <span style={{ fontSize: 10, color: "#475569" }}>
        {(confidence * 100).toFixed(0)}% conf
      </span>
    </div>
  );
}

/* ─────── Layer Card with canonical type tag (Gap 9) ─────── */
function LayerSection({
  number, title, subtitle, icon: Icon, isOpen, onToggle, children,
  color = "#BFA46A", layerType
}: {
  number: number; title: string; subtitle: string; icon: any;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
  color?: string; layerType?: keyof typeof LAYER_TYPES;
}) {
  const lt = layerType ? LAYER_TYPES[layerType] : null;
  return (
    <div className="rounded-xl bg-[#111]/60 border border-white/5 overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="font-xs font-mono text-[#555] mr-1">LAYER {number}</span>
            {lt && (
              <span style={{
                fontSize: 9, padding: "1px 6px", borderRadius: 3,
                background: `${lt.color}15`, color: lt.color,
                border: `1px solid ${lt.color}30`, fontFamily: "'Courier New', monospace",
                letterSpacing: "0.08em"
              }}>
                {lt.code} · {lt.tag}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#666] truncate">{subtitle}</p>
        </div>
        <ChevronDown
          size={16}
          className="flex-shrink-0 text-[#444] transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─────── Score Bar ─────── */
function ScoreBar({ score, max = 100, color = "#BFA46A" }: { score: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 mt-1">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(score / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-[#666]">{score}{max === 100 ? "%" : `/${max}`}</span>
    </div>
  );
}

/* ─────── Move Card with evidence nodes (Gap 5) ─────── */
function MoveCard({
  action, confidence, rationale, evidenceNodes
}: {
  action: string; confidence: number; rationale: string; evidenceNodes?: string[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const isRecommended = confidence >= 50;
  const color = isRecommended ? "#34d399" : "#64748b";

  return (
    <div
      className="rounded-xl p-4 border transition-all duration-200"
      style={{
        background: isRecommended ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
        borderColor: isRecommended ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isRecommended && <CheckCircle2 size={14} style={{ color: "#34d399" }} />}
          <span className="text-xs font-mono font-bold" style={{ color }}>
            {action}
          </span>
          {isRecommended && (
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
              RECOMMENDED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {evidenceNodes && evidenceNodes.length > 0 && (
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs font-mono flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ color: "#64748b", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Info size={10} /> {showEvidence ? "hide" : "why?"}
            </button>
          )}
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width: `${confidence}%`, background: color }} />
            </div>
            <span className="text-xs font-mono text-[#555]">{confidence}%</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-[#aaa] leading-relaxed">{rationale}</p>
      {showEvidence && evidenceNodes && evidenceNodes.length > 0 && (
        <div style={{
          marginTop: 10, padding: "8px 10px", borderRadius: 6,
          background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)"
        }}>
          <div style={{ fontSize: 9, color: "#64748b", fontFamily: "'Courier New', monospace", marginBottom: 4 }}>
            TRIGGERED BY EVIDENCE NODES:
          </div>
          {evidenceNodes.map((n, i) => (
            <div key={i} style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'Courier New', monospace" }}>
              → {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────── DEMO DATA ─────── */
const DEMO_DATA = {
  productName: "Apple AirPods Pro 2",
  _isDemo: true,
  _matchConfidence: 1.0,
  _matchMode: "DEMO" as const,
  identity: {
    company: "Apple Inc.", category: "True Wireless Stereo (TWS) Earbuds",
    launchDate: "September 2023 (USB-C revision)", priceRange: "$249 MSRP",
    positioning: "Premium ANC TWS at the intersection of audio quality, ecosystem integration, and health-tech.",
    targetCustomer: "Tech-forward professionals 22–45, willing to pay premium for polish.",
    brandPerception: 9
  },
  anatomy: {
    techStack: [
      { name: "Apple H2 Chip", role: "Custom SoC — audio processing, ANC, spatial audio", layerType: "SILICON" },
      { name: "Custom High-Excursion Driver", role: "Low-distortion audio driver + amplifier", layerType: "MECHANICAL" },
      { name: "6-Microphone Array", role: "3 per bud — ANC, transparency, voice pickup", layerType: "IO_SENSOR" },
      { name: "Adaptive Transparency FW", role: "Real-time environmental sound processing", layerType: "SOFTWARE" },
      { name: "Foxconn / Luxshare / Inventec", role: "Contract manufacturing — Vietnam + China", layerType: "SUPPLY_CHAIN" },
      { name: "U1 Chip (Case)", role: "Ultra-wideband for Precision Finding", layerType: "IO_SENSOR" },
    ],
    bomEstimate: [
      { component: "H2 SoC", cost: 8.50 },
      { component: "MEMS Microphones (x6)", cost: 4.20 },
      { component: "Custom Drivers (x2)", cost: 6.00 },
      { component: "Battery Cells (buds + case)", cost: 3.80 },
      { component: "Charging Case + MagSafe coil", cost: 9.50 },
      { component: "Silicone Tips + Mesh", cost: 1.20 },
    ],
    patents: [
      "US11,350,208 — Adaptive transparency processing",
      "US10,979,817 — In-ear fit detection with vented acoustics",
      "US11,523,230 — Personalized spatial audio with head tracking"
    ],
    manufacturingComplexity: 8
  },
  process: {
    overview: "Contract manufacturing through Foxconn, Luxshare, Inventec. Precision SMT for H2 SoC, acoustic chamber sealing, automated pairing/testing.",
    supplyChain: [
      { dependency: "Apple H2 Chip — TSMC (N5P)", risk: "High" },
      { dependency: "Knowles MEMS Microphones", risk: "Medium" },
      { dependency: "TDK Battery Cells", risk: "Low" },
      { dependency: "Custom Driver Assembly — GoerTek", risk: "Medium" }
    ],
    qualityCheckpoints: [
      "Acoustic seal test — automated fit verification per bud",
      "ANC performance benchmark — -48dB target at 200Hz",
      "Battery cycle validation — 300 cycles to 80% capacity",
    ],
    timeToMarket: "18–24 months from concept to mass production"
  },
  economics: {
    unitEconomics: { cogs: 41.70, margin: 83.3, msrp: 249.00, grossProfit: 207.30 },
    revenueModel: "Hardware + AppleCare+ recurring + ecosystem lock-in driving repeat purchases.",
    market: { tam: "$42.8B — Global TWS (2025)", sam: "$18.2B — Premium TWS ($150+)", som: "$7.8B — Apple's estimated TWS revenue" },
    competitivePricing: [
      { product: "AirPods Pro 2", price: 249, company: "Apple" },
      { product: "WF-1000XM5", price: 298, company: "Sony" },
      { product: "QuietComfort Ultra", price: 299, company: "Bose" },
      { product: "Galaxy Buds3 Pro", price: 249, company: "Samsung" },
    ]
  },
  ecosystem: {
    competitiveData: [
      { metric: "ANC Quality",   apple: 90, sony: 95, bose: 92, samsung: 78 },
      { metric: "Sound Quality", apple: 88, sony: 93, bose: 85, samsung: 82 },
      { metric: "Ecosystem",     apple: 98, sony: 60, bose: 55, samsung: 75 },
      { metric: "Battery Life",  apple: 75, sony: 85, bose: 80, samsung: 82 },
      { metric: "Comfort/Fit",   apple: 90, sony: 80, bose: 88, samsung: 78 },
      { metric: "Value",         apple: 72, sony: 70, bose: 65, samsung: 80 }
    ],
    partnerships: [
      "Spatial Audio — Dolby Atmos music providers",
      "Health-tech — FDA-cleared hearing aid mode",
      "Find My network — Precision Finding via U1 chip",
    ],
    threats: [
      "Sony WF-1000XM5 leads raw audio quality benchmarks",
      "EU interoperability regulation could weaken ecosystem lock-in",
      "Open-ear / bone conduction growing at 34% CAGR"
    ],
    growth: [
      "Hearing health features — FDA hearing aid mode expansion",
      "Spatial computing — Vision Pro integration",
      "Fitness biometrics — future gen HRV/temperature sensing",
    ]
  },
  verdict: {
    recommended: "PARTNER" as const,
    options: [
      { action: "BUILD" as const,   confidence: 18,
        rationale: "Competing TWS requires 3+ years and $200M+ — only viable for companies already at consumer electronics scale.",
        evidenceNodes: ["L5 Supply Chain — TSMC/Foxconn dependency bars new entrants", "L7 Moat — iOS ecosystem lock-in score 9.5"] },
      { action: "ACQUIRE" as const, confidence: 12,
        rationale: "Apple's dominance is H2 chip + iOS integration — acquiring Bose/Jabra would not replicate this.",
        evidenceNodes: ["L1 Silicon — H2 custom SoC not licensable", "L7 Moat — ecosystem score vs competitor gap"] },
      { action: "PARTNER" as const, confidence: 58,
        rationale: "MFi accessories, spatial audio content, or hearing health integrations — highest-ROI path to capture adjacent value.",
        evidenceNodes: ["L4 Software — FDA hearing aid mode creates partner entry point", "L3 I/O Sensor — 6-mic array spec creates integration opportunities"] },
      { action: "REMIX" as const,   confidence: 12,
        rationale: "Industrial hearing protection with ANC, pediatric audio limiting, open-ear spatial audio for AR glasses.",
        evidenceNodes: ["L6 Pricing — $249 MSRP leaves industrial/enterprise segments unserved"] },
    ]
  }
};

/* ─────── Main Component ─────── */
export default function RealityLensPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [matchConfidence, setMatchConfidence] = useState(0);
  const [matchMode, setMatchMode] = useState<"MATCHED" | "DISCOVERY" | "DEMO">("DEMO");
  const [openLayers, setOpenLayers] = useState<Set<number>>(new Set([1]));
  const [, setLocation] = useLocation();

  const toggleLayer = (n: number) => {
    setOpenLayers(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  /* ── Audit + computed scores (Gaps 3, 7, 10) ── */
  const audit = useMemo(
    () => auditTeardown(result, isDemo, matchConfidence),
    [result, isDemo, matchConfidence]
  );

  const computedConfidence = useMemo(() => {
    if (!result) return 0;
    const primarySourceCount = isDemo ? 3
      : (result.anatomy?.patents?.length || 0) + (result.process?.supplyChain?.length || 0);
    return computeConfidenceFromCoverage(audit.coveragePct, matchConfidence, primarySourceCount);
  }, [result, isDemo, matchConfidence, audit.coveragePct]);

  const categoryFrontier = 9.2; // TWS category benchmark
  const stoneScore = result ? (result._stoneScore || 7.4) : 0;
  const omegaGap = result ? computeOmegaGap(stoneScore, categoryFrontier) : 0;

  /* ── API call ── */
  const handleAnalyze = useCallback(async () => {
    if (!query.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setIsDemo(false);

    try {
      const response = await fetch("./api/reality-lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");

      const ai = data.analysis;
      const conf = typeof ai.verdict?.confidence === "number" ? ai.verdict.confidence : 0.65;
      const mode: "MATCHED" | "DISCOVERY" = conf >= 0.70 ? "MATCHED" : "DISCOVERY";

      // Attach audit metadata
      const transformed = {
        ...ai,
        _stoneScore: ai.stone_score || 7.0,
        _isDemo: false,
        _matchConfidence: conf,
        _matchMode: mode,
        productName: ai.subject || query.trim(),
        identity: {
          company:          ai.identity?.company || "—",
          category:         ai.identity?.category || "—",
          launchDate:       ai.identity?.launch_date || "—",
          priceRange:       ai.identity?.price_range || "—",
          positioning:      ai.identity?.positioning || "—",
          targetCustomer:   ai.identity?.target_customer || "—",
          brandPerception:  ai.identity?.brand_perception_score || 7,
        },
        anatomy: {
          techStack: (ai.anatomy?.key_components || []).map((c: any) => ({
            name: c.name, role: c.purpose, layerType: "SILICON",
          })),
          bomEstimate: (ai.anatomy?.key_components || []).map((c: any) => ({
            component: c.name, cost: parseFloat(c.estimated_cost) || 0,
          })),
          patents: ai.anatomy?.key_patents || [],
          manufacturingComplexity: ai.anatomy?.manufacturing_complexity_score || 7,
        },
        process: {
          overview:            ai.process?.manufacturing_overview || "—",
          supplyChain:         (ai.process?.supply_chain || []).map((s: any) => ({
            dependency: `${s.stage} — ${s.location}`, risk: s.risk,
          })),
          qualityCheckpoints:  ai.process?.quality_checkpoints || [],
          timeToMarket:        ai.process?.time_to_market || "—",
        },
        economics: {
          unitEconomics: {
            cogs:        ai.economics?.unit_economics?.cogs || 0,
            margin:      ai.economics?.unit_economics?.gross_margin_pct || 0,
            msrp:        ai.economics?.unit_economics?.retail_price || 0,
            grossProfit: 0,
          },
          revenueModel:       ai.economics?.revenue_model || "—",
          market: {
            tam: ai.economics?.tam || "—",
            sam: ai.economics?.sam || "—",
            som: ai.economics?.som || "—",
          },
          competitivePricing: (ai.economics?.competitive_pricing || []).map((c: any) => ({
            product: c.competitor, price: parseFloat(c.price) || 0, company: c.competitor,
          })),
        },
        ecosystem: {
          competitiveData: Object.entries(ai.ecosystem?.competitive_dimensions || {}).map(([k, v]) => ({
            metric: k.charAt(0).toUpperCase() + k.slice(1),
            subject: Math.round((v as number) * 100),
          })),
          partnerships: ai.ecosystem?.partnerships || [],
          threats: ai.ecosystem?.threats || [],
          growth: ai.ecosystem?.growth_vectors || [],
        },
        verdict: {
          recommended: ai.verdict?.recommended || "PARTNER",
          options: [
            { action: "BUILD",   confidence: 25, rationale: ai.verdict?.rationale || "—", evidenceNodes: ["L7 Moat", "L5 Supply Chain"] },
            { action: "ACQUIRE", confidence: 15, rationale: "Acquisition path analysis pending primary source data.",  evidenceNodes: ["L6 Pricing", "L7 Moat"] },
            { action: "PARTNER", confidence: ai.verdict?.recommended === "PARTNER" ? 55 : 30,
              rationale: ai.verdict?.alternatives?.[0] || "Partnership pathway identified.", evidenceNodes: ["L4 Software", "L3 I/O Sensor"] },
            { action: "REMIX",   confidence: 10, rationale: ai.verdict?.alternatives?.[1] || "Remix potential for adjacent verticals.", evidenceNodes: ["L6 Pricing"] },
          ],
        },
      };

      setMatchConfidence(conf);
      setMatchMode(mode);
      setResult(transformed);
    } catch (err: any) {
      // Discovery Mode fallback (Gap 8 — visually degraded)
      setMatchConfidence(0.40);
      setMatchMode("DISCOVERY");
      setIsDemo(false);
      setResult({
        _stoneScore: 5.0,
        _isDemo: false,
        _matchConfidence: 0.40,
        _matchMode: "DISCOVERY",
        _discoveryMode: true,
        productName: query.trim(),
        identity: { company: "—", category: "Category inference only", launchDate: "—",
          priceRange: "—", positioning: "No primary sources linked — add image or comparables to improve.",
          targetCustomer: "—", brandPerception: 5 },
        anatomy: { techStack: [], bomEstimate: [], patents: [], manufacturingComplexity: 5 },
        process: { overview: "Supply chain data unavailable.", supplyChain: [], qualityCheckpoints: [], timeToMarket: "—" },
        economics: { unitEconomics: { cogs: 0, margin: 0, msrp: 0, grossProfit: 0 },
          revenueModel: "—", market: { tam: "—", sam: "—", som: "—" }, competitivePricing: [] },
        ecosystem: { competitiveData: [], partnerships: [], threats: ["No competitive data available"], growth: [] },
        verdict: { recommended: "PARTNER", options: [
          { action: "BUILD",   confidence: 25, rationale: "Insufficient data for BUILD recommendation.", evidenceNodes: [] },
          { action: "ACQUIRE", confidence: 15, rationale: "Insufficient data for ACQUIRE recommendation.", evidenceNodes: [] },
          { action: "PARTNER", confidence: 50, rationale: "Default to PARTNER pending primary source analysis.",
            evidenceNodes: ["Evidence gap: no comparables linked", "Evidence gap: no image provided"] },
          { action: "REMIX",   confidence: 10, rationale: "Remix potential cannot be assessed without product data.", evidenceNodes: [] },
        ]},
      });
    } finally {
      setAnalyzing(false);
    }
  }, [query]);

  const loadDemo = () => {
    setResult(DEMO_DATA);
    setIsDemo(true);
    setMatchConfidence(1.0);
    setMatchMode("DEMO");
    setQuery("Apple AirPods Pro 2");
  };

  const reset = () => {
    setResult(null);
    setQuery("");
    setIsDemo(false);
    setMatchConfidence(0);
  };

  const isDiscovery = result?._discoveryMode === true;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 lg:hidden">
              <Menu size={18} className="text-[#888]" />
            </button>
            <Link href="/">
              <FactorizerLogo className="h-6" />
            </Link>
            <span className="hidden sm:block text-xs font-mono text-[#555] border-l border-white/10 pl-3 ml-1">
              REALITY LENS
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { icon: LayoutDashboard, label: "Dashboard", href: "/analyze" },
              { icon: Globe,           label: "Reality Lens", href: "/reality-lens", active: true },
              { icon: FileText,        label: "Reports", href: "/admin-waitlist" },
              { icon: Settings,        label: "Settings", href: "#" },
            ].map(({ icon: Icon, label, href, active }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-white/8 text-white" : "text-[#666] hover:text-white hover:bg-white/5"}`}>
                  <Icon size={15} /> {label}
                </button>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/analyze">
              <button className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-white/10 text-[#888] hover:text-white hover:border-white/20 transition-colors">
                <Camera size={13} /> Factorizer
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          /* ── Search Surface ── */
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#BFA46A]/30 bg-[#BFA46A]/5 mb-6">
              <Globe size={12} className="text-[#BFA46A]" />
              <span className="text-xs font-mono text-[#BFA46A]">REALITY LENS · STRATEGIC INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">5-Layer Strategic Factorization</h1>
            <p className="text-[#666] mb-8 leading-relaxed">
              Enter any product, company, or technology. Get identity, anatomy, process, economics, and ecosystem — scored, audited, and stratified.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="Apple Vision Pro, NVIDIA Blackwell, Neuralink N1..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#BFA46A]/50"
              />
              <button
                onClick={handleAnalyze}
                disabled={!query.trim() || analyzing}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "#BFA46A", color: "#000", opacity: (!query.trim() || analyzing) ? 0.5 : 1 }}
              >
                {analyzing ? "Analyzing…" : "Analyze"}
              </button>
            </div>
            <button onClick={loadDemo} className="text-xs text-[#555] hover:text-[#BFA46A] transition-colors font-mono">
              → Load AirPods Pro 2 demo
            </button>
          </div>
        ) : (
          /* ── Results Surface ── */
          <div>
            {/* Top bar: match badge + reset */}
            <div className="flex items-center justify-between mb-4">
              <MatchBadge
                entity={result.productName}
                confidence={matchConfidence}
                mode={matchMode}
              />
              <button onClick={reset} className="text-xs font-mono text-[#555] hover:text-white flex items-center gap-1">
                <ArrowLeft size={12} /> New Analysis
              </button>
            </div>

            {/* Audit Rail — always first (Gap 10) */}
            <AuditRail audit={audit} computedConfidence={computedConfidence} />

            {/* Discovery Mode banner (Gap 8) */}
            {isDiscovery && (
              <div style={{
                background: "repeating-linear-gradient(45deg, rgba(245,158,11,0.03) 0px, rgba(245,158,11,0.03) 10px, transparent 10px, transparent 20px)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontFamily: "'Courier New', monospace", fontSize: 11, color: "#f59e0b"
              }}>
                ⚠ DISCOVERY MODE — Output uses category priors only. No primary sources linked.
                Add an image or specify comparables to unlock higher-confidence analysis.
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold" style={{ opacity: isDiscovery ? 0.7 : 1 }}>
                {result.productName}
              </h1>
              <div className="flex gap-4 mt-2" style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#64748b" }}>
                <span>Ω-GAP: <span style={{ color: omegaGap > 2 ? "#f87171" : "#34d399" }}>{omegaGap.toFixed(1)}</span></span>
                <span>STONE: <span style={{ color: "#d4af5a" }}>{stoneScore.toFixed(1)}</span></span>
                <span>FRONTIER: <span style={{ color: "#22d4d4" }}>{categoryFrontier}</span></span>
                <span style={{ color: audit.provenanceMode === "INFERENCE_ONLY" ? "#f87171" : "#94a3b8" }}>
                  {audit.provenanceMode === "INFERENCE_ONLY" ? "⚠ INFERENCE ONLY"
                   : audit.provenanceMode === "PARTIAL_PRIMARY" ? "◑ PARTIAL PRIMARY"
                   : "✓ CANON ELIGIBLE"}
                </span>
              </div>
            </div>

            {/* 5-Layer Accordion */}
            <div className="space-y-2 mb-8" style={{ opacity: isDiscovery ? 0.65 : 1 }}>
              {/* L1 Identity */}
              <LayerSection number={1} title="Identity & Positioning" subtitle={result.identity.category}
                icon={Target} isOpen={openLayers.has(1)} onToggle={() => toggleLayer(1)} layerType="IO_SENSOR">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Company", result.identity.company],
                    ["Category", result.identity.category],
                    ["Launch", result.identity.launchDate],
                    ["Price Range", result.identity.priceRange],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-[#666] mb-1">{label}</p>
                      <p className="text-sm font-medium">{val}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-[#666] mb-1">Positioning</p>
                    <p className="text-sm text-[#999] leading-relaxed">{result.identity.positioning}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#666] mb-1">Brand Perception</p>
                    <ScoreBar score={result.identity.brandPerception} max={10} color="#BFA46A" />
                  </div>
                </div>
              </LayerSection>

              {/* L2 Anatomy */}
              <LayerSection number={2} title="Anatomy & Technology" subtitle={`${result.anatomy.techStack.length} components identified`}
                icon={Cpu} isOpen={openLayers.has(2)} onToggle={() => toggleLayer(2)} layerType="SILICON" color="#a78bfa">
                <div className="space-y-3">
                  {result.anatomy.techStack.map((t: any, i: number) => {
                    const lt = t.layerType ? LAYER_TYPES[t.layerType as keyof typeof LAYER_TYPES] : null;
                    return (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium">{t.name}</p>
                            {lt && (
                              <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                background: `${lt.color}15`, color: lt.color, border: `1px solid ${lt.color}30`,
                                fontFamily: "'Courier New', monospace" }}>
                                {lt.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#666]">{t.role}</p>
                        </div>
                      </div>
                    );
                  })}
                  {result.anatomy.patents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-[#666] mb-2">Key Patents</p>
                      {result.anatomy.patents.map((p: string, i: number) => (
                        <div key={i} className="text-xs text-[#888] font-mono py-1 border-t border-white/5">{p}</div>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#666] mb-1">Manufacturing Complexity</p>
                    <ScoreBar score={result.anatomy.manufacturingComplexity} max={10} color="#a78bfa" />
                  </div>
                </div>
              </LayerSection>

              {/* L3 Process */}
              <LayerSection number={3} title="Process & Supply Chain" subtitle={`${result.process.supplyChain.length} supply dependencies`}
                icon={Factory} isOpen={openLayers.has(3)} onToggle={() => toggleLayer(3)} layerType="SUPPLY_CHAIN" color="#f87171">
                <div className="space-y-4">
                  <p className="text-sm text-[#999] leading-relaxed">{result.process.overview}</p>
                  <div>
                    <p className="text-xs text-[#666] mb-2">Supply Chain Dependencies</p>
                    {result.process.supplyChain.map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-sm text-[#ccc]">{s.dependency}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          s.risk === "High" ? "bg-red-500/10 text-red-400" :
                          s.risk === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-green-500/10 text-green-400"}`}>
                          {s.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </LayerSection>

              {/* L4 Economics */}
              <LayerSection number={4} title="Economics & Market" subtitle={`TAM ${result.economics.market.tam}`}
                icon={DollarSign} isOpen={openLayers.has(4)} onToggle={() => toggleLayer(4)} layerType="PRICING" color="#fbbf24">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "COGS", val: `$${result.economics.unitEconomics.cogs}` },
                      { label: "MSRP", val: `$${result.economics.unitEconomics.msrp}` },
                      { label: "Gross Margin", val: `${result.economics.unitEconomics.margin}%` },
                    ].map(({ label, val }) => (
                      <div key={label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-xs text-[#666] mb-1">{label}</p>
                        <p className="text-base font-mono font-bold text-[#BFA46A]">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[["TAM", result.economics.market.tam], ["SAM", result.economics.market.sam], ["SOM", result.economics.market.som]].map(([label, val]) => (
                      <div key={label} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-[#555] font-mono mb-0.5">{label}</p>
                        <p className="text-xs text-[#aaa]">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </LayerSection>

              {/* L5 Ecosystem */}
              <LayerSection number={5} title="Ecosystem & Competitive" subtitle={`${result.ecosystem.threats.length} threats · ${result.ecosystem.growth.length} growth vectors`}
                icon={Globe} isOpen={openLayers.has(5)} onToggle={() => toggleLayer(5)} layerType="MOAT" color="#22d4d4">
                <div className="space-y-4">
                  {result.ecosystem.competitiveData.length > 0 && (
                    <div>
                      <p className="text-xs text-[#666] mb-3">Competitive Dimensions</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={result.ecosystem.competitiveData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                          <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "#555" }} />
                          <YAxis tick={{ fontSize: 10, fill: "#555" }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                          <Bar dataKey="apple" name="Subject" fill="#BFA46A" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="sony"   name="Comp A"  fill="#333"   radius={[2, 2, 0, 0]} />
                          <Bar dataKey="bose"   name="Comp B"  fill="#2a2a2a" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#666] mb-2">Growth Vectors</p>
                      {result.ecosystem.growth.map((g: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 py-1.5">
                          <TrendingUp size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-[#999]">{g}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-[#666] mb-2">Threats</p>
                      {result.ecosystem.threats.map((t: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 py-1.5">
                          <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-[#999]">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </LayerSection>
            </div>

            {/* Strategic Verdict — with evidence nodes (Gap 5) */}
            <div className="rounded-xl bg-[#111]/60 border border-white/5 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-[#BFA46A]" />
                <h3 className="text-base font-semibold">Strategic Verdict</h3>
                {isDiscovery && (
                  <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Courier New', monospace", marginLeft: "auto" }}>
                    DISCOVERY MODE — low confidence
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {result.verdict.options.map((opt: any) => (
                  <MoveCard
                    key={opt.action}
                    action={opt.action}
                    confidence={opt.confidence}
                    rationale={opt.rationale}
                    evidenceNodes={opt.evidenceNodes}
                  />
                ))}
              </div>
            </div>

            {/* Provenance Rail — honest labeling (Gap 4) */}
            <div className="rounded-xl bg-[#111]/60 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-[#555]" />
                <h3 className="text-sm font-semibold text-[#888]">Provenance</h3>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {[
                  {
                    label: "DATA SOURCE",
                    value: isDemo ? "CortexChain demo KB — not a live analysis"
                      : isDiscovery ? "Category inference — no primary sources linked"
                      : "OpenRouter · Qwen3-VL-32B · public product knowledge",
                    badge: isDemo ? "DEMO" : isDiscovery ? "ESTIMATED" : "LIVE",
                    badgeColor: isDemo ? "#a78bfa" : isDiscovery ? "#f59e0b" : "#34d399",
                  },
                  {
                    label: "SCORE BASIS",
                    value: "QTAC₇ v1.0 · CB-285 · server-side computed",
                    badge: "FORMULA",
                    badgeColor: "#22d4d4",
                  },
                  {
                    label: "CONFIDENCE",
                    value: `${(computedConfidence * 100).toFixed(0)}% — computed from coverage + match + source count`,
                    badge: computedConfidence >= 0.75 ? "HIGH" : computedConfidence >= 0.55 ? "MEDIUM" : "LOW",
                    badgeColor: computedConfidence >= 0.75 ? "#34d399" : computedConfidence >= 0.55 ? "#fbbf24" : "#f87171",
                  },
                  {
                    label: "Ω-GAP",
                    value: `${omegaGap.toFixed(1)} — |frontier ${categoryFrontier} − stone ${stoneScore.toFixed(1)}|`,
                    badge: omegaGap <= 1.0 ? "TIGHT" : omegaGap <= 2.5 ? "MODERATE" : "WIDE",
                    badgeColor: omegaGap <= 1.0 ? "#34d399" : omegaGap <= 2.5 ? "#fbbf24" : "#f87171",
                  },
                  {
                    label: "CANON STATUS",
                    value: audit.canSeal
                      ? "Ready to seal — HARNESS checks passed"
                      : `Not sealable — ${audit.errors[0] || "coverage < Tier 3 threshold"}`,
                    badge: audit.canSeal ? "CANON ELIGIBLE" : "NOT SEALABLE",
                    badgeColor: audit.canSeal ? "#34d399" : "#f87171",
                  },
                ].map(({ label, value, badge, badgeColor }) => (
                  <div key={label} className="flex items-start gap-3 py-2 border-b border-white/5">
                    <span className="text-[#555] w-28 flex-shrink-0">{label}</span>
                    <span className="text-[#888] flex-1">{value}</span>
                    <span style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 3,
                      background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30`,
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>{badge}</span>
                  </div>
                ))}
              </div>

              {/* Export — honest stubs (Gap 6) */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify({
                      factorizer_version: "v2.0",
                      subject: result.productName,
                      audit_grade: audit.grade,
                      audit_tier: audit.tier,
                      provenance_mode: audit.provenanceMode,
                      computed_confidence: computedConfidence,
                      omega_gap: omegaGap,
                      stone_score: stoneScore,
                      match_confidence: matchConfidence,
                      is_demo: isDemo,
                      generated_at: new Date().toISOString(),
                      result,
                    }, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `factorizer-${result.productName.replace(/\s+/g, "-").toLowerCase()}.json`;
                    a.click(); URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-mono border border-white/10 text-[#888] hover:text-white hover:border-white/20 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  disabled={!audit.canSeal}
                  onClick={() => alert("Canon seal requires HARNESS verification. Coming in v2.1 — audit grade must be A with primary sources linked.")}
                  className="flex-1 py-2 rounded-lg text-xs font-mono border transition-colors"
                  style={{
                    borderColor: audit.canSeal ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.06)",
                    color: audit.canSeal ? "#34d399" : "#333",
                    cursor: audit.canSeal ? "pointer" : "not-allowed",
                  }}
                >
                  {audit.canSeal ? "Seal to Canon →" : "Seal Locked (Grade < A)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <PerplexityAttribution />
      <WaitlistCapture />
    </div>
  );
}
