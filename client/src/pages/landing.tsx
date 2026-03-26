import { Link } from "wouter";
import { 
  Cpu, Layers, DollarSign, Shield, BarChart3, 
  Upload, Zap, FileText, ArrowRight, Check,
  Camera, Sparkles, Globe, Lock, TrendingUp, Search
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { useState, useEffect, useRef } from "react";
import { STRIPE_CONFIG } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import { StripeBuyButton } from "@/components/StripeBuyButton";

/* ──────────────────────── SVG Logo ──────────────────────── */
function FactorizerLogo({ className = "h-8" }: { className?: string }) {
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

/* ──────────────────────── Animated Section ──────────────────────── */
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ──────────────────────── Hero Mockup ──────────────────────── */
function HeroMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 480 320" className="w-full" fill="none">
        <rect x="0" y="0" width="480" height="320" rx="12" fill="#111111" stroke="#BFA46A" strokeWidth="0.5" opacity="0.6" />
        <rect x="0" y="0" width="480" height="36" rx="12" fill="#161616" />
        <rect x="0" y="24" width="480" height="12" fill="#161616" />
        <circle cx="20" cy="18" r="4" fill="#3a3a3a" />
        <circle cx="34" cy="18" r="4" fill="#3a3a3a" />
        <circle cx="48" cy="18" r="4" fill="#3a3a3a" />
        <rect x="20" y="52" width="200" height="140" rx="8" fill="#0A0A0A" stroke="#BFA46A" strokeWidth="0.5" strokeDasharray="4 4" />
        <path d="M100 100 l20 0 l0 -15 l15 0 l-25 -25 l-25 25 l15 0 z" fill="#BFA46A" opacity="0.4" />
        <text x="120" y="135" textAnchor="middle" fill="#BFA46A" opacity="0.5" fontSize="9" fontFamily="Inter, sans-serif">Drop product image</text>
        <rect x="240" y="52" width="220" height="24" rx="4" fill="#BFA46A" opacity="0.15" />
        <text x="254" y="68" fill="#BFA46A" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">Component Analysis</text>
        {[0,1,2,3,4].map((i) => (
          <g key={i}>
            <rect x="240" y={86 + i * 22} width="220" height="18" rx="2" fill={i % 2 === 0 ? "#141414" : "#0f0f0f"} />
            <rect x="248" y={90 + i * 22} width={70 + i * 8} height="10" rx="2" fill="#2a2a2a" />
            <rect x="380" y={90 + i * 22} width={35 + i * 3} height="10" rx="2" fill="#BFA46A" opacity="0.2" />
          </g>
        ))}
        <rect x="20" y="210" width="95" height="50" rx="6" fill="#0f0f0f" stroke="#1a1a1a" strokeWidth="1" />
        <text x="30" y="228" fill="#666" fontSize="7" fontFamily="Inter, sans-serif">TOTAL BOM</text>
        <text x="30" y="248" fill="#BFA46A" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="700">$47.82</text>
        <rect x="125" y="210" width="95" height="50" rx="6" fill="#0f0f0f" stroke="#1a1a1a" strokeWidth="1" />
        <text x="135" y="228" fill="#666" fontSize="7" fontFamily="Inter, sans-serif">CONFIDENCE</text>
        <text x="135" y="248" fill="#0EA5E9" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="700">94%</text>
        <rect x="240" y="210" width="220" height="50" rx="6" fill="#0f0f0f" stroke="#1a1a1a" strokeWidth="1" />
        <text x="254" y="228" fill="#666" fontSize="7" fontFamily="Inter, sans-serif">IP RISK SCORE</text>
        <text x="254" y="248" fill="#22c55e" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="700">3/10 — Low</text>
        <rect x="20" y="280" width="440" height="4" rx="2" fill="#1a1a1a" />
        <rect x="20" y="280" width="380" height="4" rx="2" fill="#BFA46A" opacity="0.7" />
      </svg>
    </div>
  );
}

const USE_CASES = [
  {
    icon: Cpu,
    accent: "#BFA46A",
    title: "Hardware Founders",
    description: "Reverse-engineer competitor products. Know their BOM cost before you price yours. Find the IP gaps they left open.",
  },
  {
    icon: Shield,
    accent: "#0EA5E9",
    title: "VC Due Diligence",
    description: "Validate hardware startup claims in minutes. BOM cross-check, IP risk scan, manufacturing feasibility — before the term sheet.",
  },
  {
    icon: TrendingUp,
    accent: "#6366F1",
    title: "Defense & Gov Procurement",
    description: "Rapid component-level assessment of supplier hardware. ITAR-relevant IP flags, supply chain risk, and cost benchmarking.",
  },
  {
    icon: Search,
    accent: "#22c55e",
    title: "Competitive Intelligence",
    description: "Track what competitors are shipping. Understand their cost structure, moat depth, and where you can undercut or outmaneuver.",
  },
  {
    icon: FileText,
    accent: "#f59e0b",
    title: "Patent Strategy",
    description: "IP vulnerability maps from real product scans. Design-around suggestions, freedom-to-operate signals, and claim conflict alerts.",
  },
  {
    icon: BarChart3,
    accent: "#ec4899",
    title: "M&A Tech Assessment",
    description: "Hardware asset valuation support. Understand true manufacturing costs, hidden IP liabilities, and replication difficulty.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload or Query", desc: "Drop a product photo into Factorizer, or type any product/company name into Reality Lens." },
  { step: "02", title: "AI X-Ray", desc: "GPT-4o Vision identifies components, materials, suppliers. Perplexity Sonar enriches with live market data." },
  { step: "03", title: "PINK Score", desc: "Every analysis generates a PINK failure probability score — the probability this product is a market failure." },
  { step: "04", title: "Export Intel", desc: "Download your full report: BOM, IP risk map, competitive radar, and strategic verdict." },
];

export default function Landing() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased">
      <style>{`
        .text-gold-gradient { background: linear-gradient(135deg, #BFA46A, #D4BE8A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow-gold { box-shadow: 0 0 40px rgba(191,164,106,0.08); }
        .glow-blue { box-shadow: 0 0 40px rgba(14,165,233,0.08); }
      `}</style>

      {/* ═══ Nav ═══ */}
      <nav className="sticky top-0 z-50 px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <FactorizerLogo />
          <div className="hidden md:flex items-center gap-8">
            {["How It Works", "Use Cases", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-[#666] hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/reality-lens">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0EA5E9] border border-[#0EA5E9]/20 rounded-lg hover:bg-[#0EA5E9]/5 transition-colors cursor-pointer">
                <Globe className="w-3 h-3" /> Reality Lens
              </span>
            </Link>
            <Link href="/analyze">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BFA46A] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4BE8A] transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5" /> Try Free
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#76B900]/10 border border-[#76B900]/20 rounded-full text-xs text-[#76B900] font-medium">
              ⚡ NVIDIA Inception Member
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#BFA46A]/10 border border-[#BFA46A]/20 rounded-full text-xs text-[#BFA46A] font-medium">
              🔬 QTAC₇ Rated · 9.51
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#999] font-medium">
              🏛️ 19 Patents Pending
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                X-ray any product<br />
                <span className="text-gold-gradient">in 60 seconds.</span>
              </h1>
              <p className="text-lg text-[#777] leading-relaxed mb-8 max-w-lg">
                AI-powered reverse engineering. Drop a photo → get full BOM, manufacturing costs, IP risk map, and competitive landscape. Institutional-grade intel in under a minute.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/analyze">
                  <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#BFA46A] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4BE8A] transition-all cursor-pointer group" data-testid="hero-cta-primary">
                    <Camera className="w-4 h-4" />
                    Factorizer — Upload Photo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link href="/reality-lens">
                  <span className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#0EA5E9]/30 text-[#0EA5E9] font-semibold rounded-lg hover:bg-[#0EA5E9]/5 transition-all cursor-pointer group" data-testid="hero-cta-secondary">
                    <Sparkles className="w-4 h-4" />
                    Reality Lens — Type a Name
                  </span>
                </Link>
              </div>
              <p className="text-xs text-[#555]">Free tier included. No credit card required.</p>
            </div>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "60s", label: "Avg. analysis time" },
            { value: "94%", label: "Component ID accuracy" },
            { value: "1/100th", label: "vs. manual assessment cost" },
            { value: "19", label: "Foundational patents filed" },
          ].map((s, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="text-2xl md:text-3xl font-bold text-gold-gradient mb-1">{s.value}</div>
              <div className="text-xs text-[#555]">{s.label}</div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold">From photo to intelligence in 4 steps.</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="p-6 rounded-xl bg-[#111]/40 border border-white/5 h-full">
                  <div className="text-3xl font-bold text-[#222] mb-3">{step.step}</div>
                  <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                  <p className="text-xs text-[#666] leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Use Cases ═══ */}
      <section id="use-cases" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for the people who build things.</h2>
            <p className="text-[#666] mt-3 max-w-xl mx-auto">Hardware founders, VC analysts, defense procurement, IP attorneys — anyone who needs to know what's inside a product and what it actually costs.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5">
            {USE_CASES.map((item, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="group p-6 rounded-xl bg-[#111]/40 border border-white/5 hover:border-white/10 transition-all duration-300 h-full">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${item.accent}10` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Dual Engine Callout ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <AnimatedSection>
            <div className="p-8 rounded-2xl bg-[#111]/60 border border-[#BFA46A]/20 glow-gold h-full">
              <div className="w-12 h-12 rounded-xl bg-[#BFA46A]/10 flex items-center justify-center mb-5">
                <Camera className="w-6 h-6 text-[#BFA46A]" />
              </div>
              <h3 className="text-xl font-bold text-[#BFA46A] mb-2">Factorizer Engine</h3>
              <p className="text-sm text-[#777] mb-5 leading-relaxed">Upload any product photo. GPT-4o Vision identifies every component, estimates BOM costs at 4 production scales, maps IP risk, and benchmarks against competitors.</p>
              <ul className="space-y-2 mb-6">
                {["Component-level ID (ICs, sensors, MCUs)", "BOM cost at 1 / 100 / 1K / 10K units", "IP risk score + design-around suggestions", "PINK failure probability score"].map((f,i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#999]">
                    <Check className="w-3.5 h-3.5 text-[#BFA46A] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/analyze">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#BFA46A] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4BE8A] transition-colors cursor-pointer">
                  Try Factorizer <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="p-8 rounded-2xl bg-[#111]/60 border border-[#0EA5E9]/20 glow-blue h-full">
              <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-bold text-[#0EA5E9] mb-2">Reality Lens</h3>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0EA5E9]/10 rounded text-xs text-[#0EA5E9] mb-4">
                <Zap className="w-3 h-3" /> Perplexity Sonar · Live Market Intel
              </div>
              <p className="text-sm text-[#777] mb-5 leading-relaxed">Type any product, company, or technology. Get a full 5-layer strategic factorization: Identity, Anatomy, Process, Economics, Ecosystem — with a BUILD/ACQUIRE/PARTNER/REMIX verdict.</p>
              <ul className="space-y-2 mb-6">
                {["5-layer strategic framework", "Live market data via Perplexity Sonar", "TAM/SAM/SOM estimates", "Strategic verdict with confidence score"].map((f,i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#999]">
                    <Check className="w-3.5 h-3.5 text-[#0EA5E9] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/reality-lens">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0EA5E9]/30 text-[#0EA5E9] text-sm font-semibold rounded-lg hover:bg-[#0EA5E9]/5 transition-colors cursor-pointer">
                  Try Reality Lens <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing.</h2>
            <p className="text-[#666] mt-3">Start free. Scale when you're ready.</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {/* Free */}
            <AnimatedSection delay={0}>
              <div className="p-6 rounded-xl bg-[#111]/60 border border-white/5 flex flex-col h-full">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold mb-1">Free</h3>
                  <p className="text-xs text-[#666]">Try both engines</p>
                </div>
                <div className="mb-5">
                  <span className="text-2xl font-bold">$0</span>
                  <span className="text-xs text-[#666] ml-1">/forever</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["1 Factorizer report", "1 Reality Lens analysis", "Basic component ID", "No credit card"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#999]">
                      <Check className="w-3.5 h-3.5 text-[#555] mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/analyze">
                  <span className="block w-full text-center px-4 py-2 text-xs font-medium border border-white/10 rounded-lg hover:border-white/20 transition-colors cursor-pointer">
                    Get Started
                  </span>
                </Link>
              </div>
            </AnimatedSection>

            {/* PAYG */}
            <AnimatedSection delay={80}>
              <div className="p-6 rounded-xl bg-[#111]/60 border border-white/5 flex flex-col h-full">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold mb-1">Pay-As-You-Go</h3>
                  <p className="text-xs text-[#666]">Credits when you need them</p>
                </div>
                <div className="mb-5">
                  <span className="text-2xl font-bold">$29</span>
                  <span className="text-xs text-[#666] ml-1">/report</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Both engines", "Full component analysis", "5-layer strategic report", "Manufacturing cost table", "IP vulnerability scan"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#999]">
                      <Check className="w-3.5 h-3.5 text-[#555] mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <StripeBuyButton buttonId="SINGLE_REPORT" />
              </div>
            </AnimatedSection>

            {/* Pro — Recommended */}
            <AnimatedSection delay={160}>
              <div className="relative p-6 rounded-xl bg-[#111]/80 border border-[#BFA46A]/30 flex flex-col h-full glow-gold">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#BFA46A] text-[#0A0A0A] text-xs font-semibold rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#BFA46A] mb-1">Pro</h3>
                  <p className="text-xs text-[#666]">For hardware teams</p>
                </div>
                <div className="mb-5">
                  <span className="text-2xl font-bold text-[#BFA46A]">$99</span>
                  <span className="text-xs text-[#666] ml-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["10 reports/month", "Priority processing", "API access", "Export to CSV/JSON", "IP vulnerability scan", "Competitive intel radar"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#ccc]">
                      <Check className="w-3.5 h-3.5 text-[#BFA46A] mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <StripeBuyButton buttonId="PRO_MONTHLY" />
              </div>
            </AnimatedSection>

            {/* Enterprise */}
            <AnimatedSection delay={240}>
              <div className="p-6 rounded-xl bg-[#111]/60 border border-[#6366F1]/20 flex flex-col h-full">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#6366F1] mb-1">Enterprise</h3>
                  <p className="text-xs text-[#666]">VC / Defense / Legal</p>
                </div>
                <div className="mb-5">
                  <span className="text-2xl font-bold">Custom</span>
                  <span className="text-xs text-[#666] ml-1">/contract</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Unlimited reports", "White-label reports", "Custom PINK thresholds", "ITAR-aware IP flags", "Dedicated support", "SOC 2 on roadmap"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#999]">
                      <Check className="w-3.5 h-3.5 text-[#6366F1] mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:bhines@waveform-tech.us?subject=Factorizer Enterprise">
                  <span className="block w-full text-center px-4 py-2 text-xs font-medium border border-[#6366F1]/30 text-[#6366F1] rounded-lg hover:bg-[#6366F1]/5 transition-colors cursor-pointer">
                    Contact Us
                  </span>
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to decode your next product?
            </h2>
            <p className="text-[#777] mb-8 max-w-xl mx-auto">
              Hardware founders, VC analysts, and defense teams use Factorizer to get institutional-grade product intelligence in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#BFA46A] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4BE8A] transition-all cursor-pointer text-base group" data-testid="cta-final">
                  Try Factorizer — Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <a href="mailto:bhines@waveform-tech.us?subject=Factorizer Enterprise Inquiry">
                <span className="inline-flex items-center gap-2 px-8 py-4 border border-[#6366F1]/30 text-[#6366F1] font-semibold rounded-lg hover:bg-[#6366F1]/5 transition-all cursor-pointer text-base">
                  <Lock className="w-4 h-4" /> Enterprise Access
                </span>
              </a>
            </div>
            <p className="text-xs text-[#444] mt-6">Built by Waveform Tech · bhines@waveform-tech.us · NVIDIA Inception · 19 Patents Pending</p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <FactorizerLogo className="h-6 mb-4" />
              <p className="text-sm text-[#555] max-w-sm leading-relaxed">
                AI-powered product intelligence. X-ray any hardware in 60 seconds. Built by Waveform Tech / CortexChain, Inc.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="https://github.com/bhineswaveformer6" target="_blank" rel="noopener noreferrer" className="text-[#555] hover:text-[#BFA46A] transition-colors text-xs">GitHub</a>
                <a href="https://www.linkedin.com/in/brandon-hines6" target="_blank" rel="noopener noreferrer" className="text-[#555] hover:text-[#BFA46A] transition-colors text-xs">LinkedIn</a>
                <a href="mailto:bhines@waveform-tech.us" className="text-[#555] hover:text-[#BFA46A] transition-colors text-xs">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#555] mb-4">Product</h4>
              <ul className="space-y-2">
                {["Factorizer", "Reality Lens", "Pricing", "API"].map((item, i) => (
                  <li key={i}><span className="text-sm text-[#666] hover:text-[#BFA46A] transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#555] mb-4">Company</h4>
              <ul className="space-y-2">
                {["Waveform Tech", "CortexChain, Inc.", "NVIDIA Inception", "Patents"].map((item, i) => (
                  <li key={i}><span className="text-sm text-[#666] hover:text-[#BFA46A] transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
            <p className="text-xs text-[#444]">© 2025 Waveform Tech LLC / CortexChain, Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <PerplexityAttribution />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
