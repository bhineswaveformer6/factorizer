import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Settings, CreditCard, Camera, Layers,
  Search, ChevronDown, ChevronRight, ArrowLeft, Menu, X,
  Target, Cpu, Factory, DollarSign, Globe, Shield, Zap, TrendingUp,
  Users, Package, AlertTriangle, CheckCircle2, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from "recharts";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

/* ─────── Logo ─────── */
function FactorizerLogo({ className = "h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 32" className={className} aria-label="Factorizer" fill="none">
      <rect x="2" y="4" width="24" height="24" rx="3" stroke="#BFA46A" strokeWidth="1.5" fill="none" />
      <path d="M9 10h10M9 16h7M9 22" stroke="#BFA46A" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="22" stroke="#BFA46A" strokeWidth="2" strokeLinecap="round" />
      <text x="34" y="22" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600" fill="#BFA46A" letterSpacing="0.05em">
        FACTORIZER
      </text>
    </svg>
  );
}

/* ─────── Mock Data: Apple AirPods Pro 2 ─────── */
const DEMO_DATA = {
  productName: "Apple AirPods Pro 2",
  identity: {
    company: "Apple Inc.",
    category: "True Wireless Stereo (TWS) Earbuds",
    launchDate: "September 2023 (USB-C revision)",
    priceRange: "$249 MSRP",
    positioning: "Premium active noise-cancelling true wireless earbuds positioned at the intersection of audio quality, seamless ecosystem integration, and health-tech innovation.",
    targetCustomer: "Tech-forward professionals aged 22–45 who prioritize convenience, audio quality, and deep Apple ecosystem integration. Willing to pay premium for polish.",
    brandPerception: 9
  },
  anatomy: {
    techStack: [
      { name: "Apple H2 Chip", role: "Custom SoC for audio processing, ANC, and spatial audio" },
      { name: "Custom High-Excursion Driver", role: "Low-distortion audio driver with amplifier" },
      { name: "Adaptive Transparency", role: "Real-time environmental sound processing" },
      { name: "U1 Chip (Case)", role: "Ultra-wideband for Precision Finding" },
      { name: "Bluetooth 5.3", role: "Wireless connectivity with AAC/LC3 codecs" },
      { name: "6-Microphone Array", role: "3 per bud for ANC, transparency, and voice" }
    ],
    bomEstimate: [
      { component: "H2 SoC", cost: 8.50 },
      { component: "MEMS Microphones (x6)", cost: 4.20 },
      { component: "Custom Drivers (x2)", cost: 6.00 },
      { component: "Battery Cells (buds + case)", cost: 3.80 },
      { component: "Charging Case + MagSafe coil", cost: 9.50 },
      { component: "Silicone Tips + Mesh", cost: 1.20 },
      { component: "PCB + Flex Circuits", cost: 5.00 },
      { component: "Packaging + Accessories", cost: 3.50 }
    ],
    patents: [
      "US11,350,208 — Adaptive transparency processing",
      "US10,979,817 — In-ear fit detection with vented acoustics",
      "US11,523,230 — Personalized spatial audio with head tracking"
    ],
    manufacturingComplexity: 8
  },
  process: {
    overview: "Contract manufacturing through Foxconn, Luxshare Precision, and Inventec. Assembly involves precision pick-and-place SMT for H2 SoC, acoustic chamber sealing, and automated pairing/testing. Final assembly in Vietnam and China.",
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
      "Bluetooth pairing stress test — 1000 connect/disconnect cycles"
    ],
    timeToMarket: "18-24 months from concept to mass production"
  },
  economics: {
    unitEconomics: {
      cogs: 41.70,
      margin: 83.3,
      msrp: 249.00,
      grossProfit: 207.30
    },
    revenueModel: "Hardware sales with high-margin consumables (ear tips) and ecosystem lock-in driving repeat purchases. AppleCare+ adds recurring revenue at $29/2yr per unit.",
    market: {
      tam: "$42.8B — Global TWS market (2025)",
      sam: "$18.2B — Premium TWS segment ($150+)",
      som: "$7.8B — Apple's estimated TWS revenue (2025)"
    },
    competitivePricing: [
      { product: "AirPods Pro 2", price: 249, company: "Apple" },
      { product: "WF-1000XM5", price: 298, company: "Sony" },
      { product: "QuietComfort Ultra", price: 299, company: "Bose" },
      { product: "Galaxy Buds3 Pro", price: 249, company: "Samsung" },
      { product: "Pixel Buds Pro 2", price: 229, company: "Google" }
    ]
  },
  ecosystem: {
    competitiveData: [
      { metric: "ANC Quality", apple: 90, sony: 95, bose: 92, samsung: 78 },
      { metric: "Sound Quality", apple: 88, sony: 93, bose: 85, samsung: 82 },
      { metric: "Ecosystem", apple: 98, sony: 60, bose: 55, samsung: 75 },
      { metric: "Battery Life", apple: 75, sony: 85, bose: 80, samsung: 82 },
      { metric: "Comfort/Fit", apple: 90, sony: 80, bose: 88, samsung: 78 },
      { metric: "Value", apple: 72, sony: 70, bose: 65, samsung: 80 }
    ],
    partnerships: [
      "Spatial Audio partnerships with Dolby Atmos music providers",
      "Health-tech integration — hearing test, hearing aid mode (FDA cleared)",
      "Find My network integration for Precision Finding via U1 chip",
      "Lossless Audio support roadmap via upcoming LE Audio standard"
    ],
    threats: [
      "Sony WF-1000XM5 leads in raw audio quality benchmarks",
      "Samsung Galaxy Buds3 Pro at same price with competitive ANC",
      "Open-ear / bone conduction alternatives growing at 34% CAGR",
      "EU regulation on interoperability could weaken ecosystem lock-in"
    ],
    growth: [
      "Hearing health features — FDA-cleared hearing aid mode expansion",
      "Spatial computing — Vision Pro integration for immersive audio",
      "Fitness biometrics — heart rate, temperature sensing in future gen",
      "Enterprise — hearing protection + communication in industrial settings"
    ]
  },
  verdict: {
    recommended: "PARTNER" as const,
    options: [
      {
        action: "BUILD" as const,
        confidence: 18,
        rationale: "Building a competing TWS product requires 3+ years and $200M+ to match Apple's vertical integration and ecosystem — only viable for companies already in consumer electronics at scale."
      },
      {
        action: "ACQUIRE" as const,
        confidence: 12,
        rationale: "Apple's TWS dominance is deeply tied to its ecosystem; acquiring a competitor like Bose or Jabra would not replicate the H2 chip + iOS integration advantage."
      },
      {
        action: "PARTNER" as const,
        confidence: 58,
        rationale: "Partner with the Apple ecosystem via MFi accessories, spatial audio content, or hearing health integrations — the highest-ROI path to capture adjacent value."
      },
      {
        action: "REMIX" as const,
        confidence: 12,
        rationale: "Remix the concept for underserved verticals: industrial hearing protection with ANC, pediatric audio limiting, or open-ear spatial audio for AR glasses."
      }
    ]
  }
};

/* ─────── Accordion Section ─────── */
function LayerSection({
  number, title, subtitle, icon: Icon, isOpen, onToggle, children, color = "#BFA46A"
}: {
  number: number; title: string; subtitle: string; icon: any; isOpen: boolean; onToggle: () => void; children: React.ReactNode; color?: string;
}) {
  return (
    <div className="rounded-xl bg-[#111]/60 border border-white/5 overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
        data-testid={`layer-${number}-toggle`}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#555]">LAYER {number}</span>
            <span className="text-xs text-[#555]">—</span>
            <span className="text-xs text-[#666] uppercase tracking-wider">{subtitle}</span>
          </div>
          <h3 className="text-base font-semibold mt-0.5">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#555] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 border-t border-white/5 pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─────── Score Bar ─────── */
function ScoreBar({ score, max = 10, color = "#BFA46A" }: { score: number; max?: number; color?: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-mono font-semibold" style={{ color }}>{score}/{max}</span>
    </div>
  );
}

/* ─────── Custom Tooltip ─────── */
function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
        <p className="text-[#ccc] font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: ${p.value}</p>
        ))}
      </div>
    );
  }
  return null;
}

/* ─────── Reality Lens Page ─────── */
export default function RealityLensPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof DEMO_DATA | null>(null);
  const [openLayers, setOpenLayers] = useState<Set<number>>(new Set([1]));
  const [sonarIntel, setSonarIntel] = useState<{content: string; citations: string[]} | null>(null);
  const [sonarLoading, setSonarLoading] = useState(false);
  const [, setLocation] = useLocation();

  const toggleLayer = (n: number) => {
    setOpenLayers(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const enrichWithSonar = useCallback(async (subject: string, context: any) => {
    setSonarLoading(true);
    setSonarIntel(null);
    try {
      const response = await fetch('/api/perplexity/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Latest market data, pricing, and news for: ${subject}`,
          context: { subject, economics: context?.economics, ecosystem: context?.ecosystem, verdict: context?.verdict },
        }),
      });
      if (!response.ok) throw new Error('Sonar unavailable');
      const data = await response.json();
      if (data.success) setSonarIntel({ content: data.content, citations: data.citations || [] });
    } catch (err) {
      setSonarIntel({ content: 'Live intel temporarily unavailable. Core analysis is complete.', citations: [] });
    }
    setSonarLoading(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setResult(null);
    
    const searchQuery = query.trim() || "Apple AirPods Pro 2";
    
    try {
      const response = await fetch('/api/reality-lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        // Transform AI result to match display format
        const ai = data.analysis;
        const transformed = {
          subject: ai.subject || searchQuery,
          type: ai.type || "Product",
          identity: ai.identity || DEMO_DATA.identity,
          anatomy: ai.anatomy || DEMO_DATA.anatomy,
          process: ai.process || DEMO_DATA.process,
          economics: ai.economics || DEMO_DATA.economics,
          ecosystem: ai.ecosystem || DEMO_DATA.ecosystem,
          verdict: ai.verdict || DEMO_DATA.verdict,
          summary: ai.summary || "Analysis complete.",
        };
        setResult(transformed as any);
        enrichWithSonar(ai.subject || searchQuery, transformed);
      } else {
        // Fallback to demo data
        setResult(DEMO_DATA);
      }
    } catch (error) {
      console.error('Reality Lens error:', error);
      // Fallback to demo data on error
      setResult(DEMO_DATA);
    }
    
    setAnalyzing(false);
    setOpenLayers(new Set([1]));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setQuery("Apple AirPods Pro 2");
    }
    handleAnalyze();
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", active: false },
    { icon: Camera, label: "Factorizer", href: "/analyze", active: false },
    { icon: Layers, label: "Reality Lens", href: "/reality-lens", active: true },
    { icon: FileText, label: "My Reports", href: "/reports", active: false },
    { icon: CreditCard, label: "Pricing", href: "/", active: false, gold: true },
    { icon: Settings, label: "Settings", href: "/settings", active: false }
  ];

  const resetAnalysis = () => {
    setResult(null);
    setQuery("");
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E2D4] flex">
      {/* ═══ Sidebar ═══ */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-white/5">
          <Link href="/">
            <FactorizerLogo className="h-6 cursor-pointer" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <span
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-white/5 text-[#E8E2D4]'
                    : item.gold
                      ? 'text-[#BFA46A] hover:bg-[#BFA46A]/5'
                      : 'text-[#666] hover:bg-white/5 hover:text-[#999]'
                }`}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#BFA46A]/20 flex items-center justify-center text-xs font-semibold text-[#BFA46A]">W</div>
            <div>
              <div className="text-sm font-medium">Waveform</div>
              <div className="text-xs text-[#555]">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 text-[#666] hover:text-[#999]" onClick={() => setSidebarOpen(true)} data-testid="mobile-menu-rl">
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/">
                <span className="flex items-center gap-2 text-sm text-[#555] hover:text-[#BFA46A] transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to site
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium">
                <Layers className="w-3 h-3" />
                Reality Lens
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          {/* ═══ Input Section ═══ */}
          {!result && !analyzing && (
            <div className="mb-8">
              <div className="mb-8">
                <h1 className="text-xl font-bold mb-1">Reality Lens</h1>
                <p className="text-sm text-[#666]">Enter any product, company, or technology for a 5-layer strategic deep dive</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='e.g. "Apple AirPods Pro 2" or "Tesla Model 3"'
                    className="w-full pl-12 pr-4 py-4 bg-[#111] border border-white/10 rounded-xl text-[#E8E2D4] placeholder-[#555] focus:outline-none focus:border-[#BFA46A]/40 focus:ring-1 focus:ring-[#BFA46A]/20 transition-all text-base"
                    data-testid="input-query"
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFA46A] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4BE8A] transition-all"
                    data-testid="btn-analyze"
                  >
                    <Zap className="w-4 h-4" />
                    Analyze
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuery("Apple AirPods Pro 2"); handleAnalyze(); }}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#BFA46A] border border-[#BFA46A]/20 rounded-lg hover:bg-[#BFA46A]/5 transition-colors"
                    data-testid="btn-demo-rl"
                  >
                    <Target className="w-4 h-4" />
                    Run Demo — AirPods Pro 2
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Feature preview */}
              <div className="grid sm:grid-cols-5 gap-3 mt-12">
                {[
                  { num: "01", name: "Identity", desc: "Who / What", icon: Target },
                  { num: "02", name: "Anatomy", desc: "What's Inside", icon: Cpu },
                  { num: "03", name: "Process", desc: "How It's Made", icon: Factory },
                  { num: "04", name: "Economics", desc: "What It Costs", icon: DollarSign },
                  { num: "05", name: "Ecosystem", desc: "Where It Fits", icon: Globe }
                ].map((l) => (
                  <div key={l.num} className="p-4 rounded-xl bg-[#111]/40 border border-white/5 text-center">
                    <l.icon className="w-5 h-5 mx-auto mb-2 text-[#BFA46A]" />
                    <p className="text-xs font-mono text-[#555] mb-1">Layer {l.num}</p>
                    <p className="text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-[#666] mt-0.5">{l.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Analyzing State ═══ */}
          {analyzing && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-[#BFA46A]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#BFA46A] animate-spin" />
                <div className="absolute inset-3 rounded-full border-2 border-t-[#0EA5E9] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#BFA46A]" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Analyzing {query || "Apple AirPods Pro 2"}</h2>
              <p className="text-sm text-[#666]">Running 5-layer strategic factorization...</p>
              <div className="flex gap-2 mt-6">
                {["Identity", "Anatomy", "Process", "Economics", "Ecosystem"].map((l, i) => (
                  <div
                    key={l}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/5 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Results ═══ */}
          {result && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Product Header */}
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold">{result.productName}</h1>
                    <button onClick={resetAnalysis} className="p-1 text-[#555] hover:text-[#999]" data-testid="btn-reset-rl">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium">
                      <Layers className="w-3 h-3" /> 5-Layer Analysis
                    </span>
                    <span className="text-xs text-[#555]">Strategic factorization complete</span>
                  </div>
                </div>
              </div>

              {/* ═══ Layer 1 — Identity ═══ */}
              <LayerSection
                number={1} title="Identity" subtitle="Who / What"
                icon={Target} isOpen={openLayers.has(1)} onToggle={() => toggleLayer(1)}
                color="#BFA46A"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Company</label>
                      <p className="text-sm font-medium mt-1">{result.identity.company}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Category</label>
                      <p className="text-sm font-medium mt-1">{result.identity.category}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Launch Date</label>
                      <p className="text-sm font-medium mt-1">{result.identity.launchDate}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Price Range</label>
                      <p className="text-sm font-medium mt-1 text-[#BFA46A]">{result.identity.priceRange}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Market Positioning</label>
                      <p className="text-sm text-[#999] mt-1 leading-relaxed">{result.identity.positioning}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Target Customer</label>
                      <p className="text-sm text-[#999] mt-1 leading-relaxed">{result.identity.targetCustomer}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[#555] uppercase tracking-wider">Brand Perception Score</label>
                      <div className="mt-2">
                        <ScoreBar score={result.identity.brandPerception} color="#BFA46A" />
                      </div>
                    </div>
                  </div>
                </div>
              </LayerSection>

              {/* ═══ Layer 2 — Anatomy ═══ */}
              <LayerSection
                number={2} title="Anatomy" subtitle="What's Inside"
                icon={Cpu} isOpen={openLayers.has(2)} onToggle={() => toggleLayer(2)}
                color="#0EA5E9"
              >
                <div className="space-y-6">
                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Core Technology Stack</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {result.anatomy.techStack.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                          <Cpu className="w-4 h-4 text-[#0EA5E9] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{t.name}</p>
                            <p className="text-xs text-[#666] mt-0.5">{t.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOM */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Bill of Materials Estimate</h4>
                    <div className="overflow-x-auto rounded-lg border border-white/5">
                      <table className="w-full text-sm" data-testid="table-rl-bom">
                        <thead>
                          <tr className="border-b border-white/5 text-[#555] text-xs uppercase tracking-wider">
                            <th className="text-left px-4 py-2.5 font-medium">Component</th>
                            <th className="text-right px-4 py-2.5 font-medium">Est. Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.anatomy.bomEstimate.map((b, i) => (
                            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                              <td className="px-4 py-2.5 font-medium">{b.component}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-[#0EA5E9]">${b.cost.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-white/10">
                            <td className="px-4 py-2.5 font-semibold">Total Estimated BOM</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-[#BFA46A]">
                              ${result.anatomy.bomEstimate.reduce((s, b) => s + b.cost, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Patents */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Key Patents & IP</h4>
                    <ul className="space-y-2">
                      {result.anatomy.patents.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                          <Shield className="w-4 h-4 text-[#0EA5E9] mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mfg Complexity */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-2">Manufacturing Complexity</h4>
                    <ScoreBar score={result.anatomy.manufacturingComplexity} color="#0EA5E9" />
                  </div>
                </div>
              </LayerSection>

              {/* ═══ Layer 3 — Process ═══ */}
              <LayerSection
                number={3} title="Process" subtitle="How It's Made"
                icon={Factory} isOpen={openLayers.has(3)} onToggle={() => toggleLayer(3)}
                color="#BFA46A"
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-2">Manufacturing Overview</h4>
                    <p className="text-sm text-[#999] leading-relaxed">{result.process.overview}</p>
                  </div>

                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Supply Chain Dependencies</h4>
                    <div className="space-y-2">
                      {result.process.supplyChain.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                          <span className="text-sm">{s.dependency}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            s.risk === "High" ? "bg-red-500/10 text-red-400" :
                            s.risk === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-green-500/10 text-green-400"
                          }`}>{s.risk} Risk</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Quality Control Checkpoints</h4>
                    <ul className="space-y-2">
                      {result.process.qualityCheckpoints.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-1">Time to Market</h4>
                    <p className="text-sm font-medium text-[#BFA46A]">{result.process.timeToMarket}</p>
                  </div>
                </div>
              </LayerSection>

              {/* ═══ Layer 4 — Economics ═══ */}
              <LayerSection
                number={4} title="Economics" subtitle="What It Costs / Makes"
                icon={DollarSign} isOpen={openLayers.has(4)} onToggle={() => toggleLayer(4)}
                color="#0EA5E9"
              >
                <div className="space-y-6">
                  {/* Unit Economics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                      <p className="text-xs text-[#555] uppercase tracking-wider mb-1">COGS</p>
                      <p className="text-xl font-bold text-[#E8E2D4]">${result.economics.unitEconomics.cogs}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                      <p className="text-xs text-[#555] uppercase tracking-wider mb-1">MSRP</p>
                      <p className="text-xl font-bold text-[#BFA46A]">${result.economics.unitEconomics.msrp}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                      <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Gross Profit</p>
                      <p className="text-xl font-bold text-green-500">${result.economics.unitEconomics.grossProfit}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/[0.03]">
                      <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Margin</p>
                      <p className="text-xl font-bold text-[#0EA5E9]">{result.economics.unitEconomics.margin}%</p>
                    </div>
                  </div>

                  {/* Revenue Model */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-2">Revenue Model</h4>
                    <p className="text-sm text-[#999] leading-relaxed">{result.economics.revenueModel}</p>
                  </div>

                  {/* TAM/SAM/SOM */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Market Size</h4>
                    <div className="space-y-2">
                      {[
                        { label: "TAM", value: result.economics.market.tam, color: "#BFA46A", width: "100%" },
                        { label: "SAM", value: result.economics.market.sam, color: "#0EA5E9", width: "42%" },
                        { label: "SOM", value: result.economics.market.som, color: "#22c55e", width: "18%" }
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-4">
                          <span className="text-xs font-mono text-[#555] w-8">{m.label}</span>
                          <div className="flex-1 h-8 bg-[#0A0A0A] rounded-lg overflow-hidden relative">
                            <div className="h-full rounded-lg flex items-center px-3" style={{ width: m.width, backgroundColor: `${m.color}20` }}>
                              <span className="text-xs font-medium" style={{ color: m.color }}>{m.value}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitive Pricing */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Competitive Pricing Comparison</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.economics.competitivePricing} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                          <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} domain={[0, 350]} tickFormatter={(v) => `$${v}`} />
                          <YAxis dataKey="product" type="category" tick={{ fill: '#888', fontSize: 11 }} width={140} />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="price" name="Price" radius={[0, 4, 4, 0]}>
                            {result.economics.competitivePricing.map((entry, i) => (
                              <Cell key={i} fill={entry.company === "Apple" ? "#BFA46A" : "#333"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </LayerSection>

              {/* ═══ Layer 5 — Ecosystem ═══ */}
              <LayerSection
                number={5} title="Ecosystem" subtitle="Where It Fits"
                icon={Globe} isOpen={openLayers.has(5)} onToggle={() => toggleLayer(5)}
                color="#BFA46A"
              >
                <div className="space-y-6">
                  {/* Competitive Landscape Radar */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Competitive Landscape</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={result.ecosystem.competitiveData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="#222" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: '#666', fontSize: 11 }} />
                          <PolarRadiusAxis tick={false} axisLine={false} />
                          <Radar name="Apple" dataKey="apple" stroke="#BFA46A" fill="#BFA46A" fillOpacity={0.15} strokeWidth={2} />
                          <Radar name="Sony" dataKey="sony" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.05} strokeWidth={1} />
                          <Radar name="Bose" dataKey="bose" stroke="#6366F1" fill="#6366F1" fillOpacity={0.05} strokeWidth={1} />
                          <Radar name="Samsung" dataKey="samsung" stroke="#555" fill="#555" fillOpacity={0.05} strokeWidth={1} />
                          <Legend wrapperStyle={{ fontSize: '11px', color: '#888' }} iconType="line" />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Partnerships */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Partnership & Integration Opportunities</h4>
                    <ul className="space-y-2">
                      {result.ecosystem.partnerships.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                          <TrendingUp className="w-4 h-4 text-[#BFA46A] mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Threat Analysis</h4>
                    <ul className="space-y-2">
                      {result.ecosystem.threats.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Growth Vectors */}
                  <div>
                    <h4 className="text-xs text-[#555] uppercase tracking-wider mb-3">Growth Vectors & Expansion</h4>
                    <ul className="space-y-2">
                      {result.ecosystem.growth.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                          <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </LayerSection>

              {/* Perplexity Sonar Live Intel Panel */}
              <div className="p-5 rounded-xl bg-[#0f0f0f] border border-[#0EA5E9]/20 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
                    <span className="text-xs font-semibold text-[#0EA5E9] tracking-wider uppercase">Perplexity Sonar · Live Intel</span>
                  </div>
                  {!sonarIntel && !sonarLoading && (
                    <button onClick={() => enrichWithSonar(result.subject, result)}
                      className="text-xs px-3 py-1 border border-[#0EA5E9]/30 text-[#0EA5E9] rounded hover:bg-[#0EA5E9]/5 transition-colors">
                      Fetch Live Intel
                    </button>
                  )}
                </div>
                {sonarLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#555]">
                    <div className="w-3 h-3 border border-[#0EA5E9]/40 border-t-[#0EA5E9] rounded-full animate-spin" />
                    Querying live market data via Perplexity Sonar...
                  </div>
                )}
                {sonarIntel && (
                  <div>
                    <p className="text-sm text-[#999] leading-relaxed whitespace-pre-wrap">{sonarIntel.content}</p>
                    {sonarIntel.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sonarIntel.citations.slice(0, 4).map((cite, i) => (
                          <a key={i} href={cite} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-[#0EA5E9]/5 border border-[#0EA5E9]/20 text-[#0EA5E9] rounded hover:bg-[#0EA5E9]/10 transition-colors">
                            [{i+1}] Source
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!sonarIntel && !sonarLoading && (
                  <p className="text-xs text-[#555]">Live pricing, news, and competitor intel via Perplexity Sonar.</p>
                )}
              </div>

              {/* Verdict Panel */}
              <div className="rounded-xl bg-[#111]/80 border border-[#BFA46A]/20 p-6 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#BFA46A]/15 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#BFA46A]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Strategic Verdict</h3>
                    <p className="text-xs text-[#666]">Recommended action based on 5-layer analysis</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 mb-6">
                  {result.verdict.options.map((opt) => {
                    const isRecommended = opt.action === result.verdict.recommended;
                    return (
                      <div
                        key={opt.action}
                        className={`relative p-4 rounded-xl border transition-all ${
                          isRecommended
                            ? 'border-[#BFA46A]/40 bg-[#BFA46A]/5 glow-gold'
                            : 'border-white/5 bg-[#0A0A0A]/60'
                        }`}
                        data-testid={`verdict-${opt.action.toLowerCase()}`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#BFA46A] text-[#0A0A0A] text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Recommended
                          </span>
                        )}
                        <p className={`text-sm font-bold tracking-wider mb-1 ${isRecommended ? 'text-[#BFA46A]' : 'text-[#888]'}`}>
                          {opt.action}
                        </p>
                        <p className={`text-2xl font-bold font-mono mb-2 ${isRecommended ? 'text-[#BFA46A]' : 'text-[#666]'}`}>
                          {opt.confidence}%
                        </p>
                        <p className="text-xs text-[#777] leading-relaxed">{opt.rationale}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#444]">&copy; 2026 Waveform Tech. All rights reserved.</p>
                <PerplexityAttribution />
              </div>
            </div>
          )}

          {/* Footer when no analysis */}
          {!result && !analyzing && (
            <div className="mt-auto pt-24">
              <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#444]">&copy; 2026 Waveform Tech. All rights reserved.</p>
                <PerplexityAttribution />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


