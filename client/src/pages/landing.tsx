import { Link } from "wouter";
import { 
  Cpu, Layers, DollarSign, Shield, BarChart3, Box, 
  Upload, Zap, FileText, ArrowRight, Check, ChevronRight,
  Camera, Sparkles
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { useState, useEffect, useRef } from "react";
import { STRIPE_CONFIG } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import { StripeBuyButton } from "@/components/StripeBuyButton";
import AgentCopilot from "@/components/AgentCopilot";

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

/* ──────────────────────── Hero Mockup SVG ──────────────────────── */
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
        <text x="20" y="304" fill="#666" fontSize="8" fontFamily="Inter, sans-serif">Analyzing 847M neural patterns...</text>
        <text x="408" y="304" fill="#BFA46A" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">86%</text>
      </svg>
      <div className="absolute -inset-4 bg-gradient-to-r from-[#BFA46A]/5 via-transparent to-[#0EA5E9]/5 rounded-2xl blur-xl -z-10" />
    </div>
  );
}

/* ──────────────────────── Animated Section ──────────────────────── */
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────── Landing Page ──────────────────────── */
export default function LandingPage() {
  const { toast } = useToast();

  const [showCheckout, setShowCheckout] = useState<'SINGLE_REPORT' | 'PRO_MONTHLY' | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E2D4] overflow-x-hidden">
      
      {/* ═══ Navigation ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <FactorizerLogo className="h-7" />
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-[#888] hover:text-[#BFA46A] transition-colors"
              data-testid="nav-how-it-works"
            >
              How It Works
            </button>
            <button 
              onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-[#888] hover:text-[#BFA46A] transition-colors"
              data-testid="nav-capabilities"
            >
              Capabilities
            </button>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-[#888] hover:text-[#BFA46A] transition-colors"
              data-testid="nav-pricing"
            >
              Pricing
            </button>
          </div>
          <Link href="/analyze">
            <span className="px-4 py-2 text-sm font-medium bg-[#BFA46A] text-[#0A0A0A] rounded-lg hover:bg-[#D4BE8A] transition-colors cursor-pointer" data-testid="nav-cta">
              Open App
            </span>
          </Link>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#BFA46A]/20 bg-[#BFA46A]/5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BFA46A] animate-pulse" />
                <span className="text-xs text-[#BFA46A] font-medium tracking-wide uppercase">AI-Powered Product Intelligence</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Upload a photo.{" "}
                <span className="text-gold-gradient">Get the blueprint.</span>
              </h1>
              
              <p className="text-lg text-[#888] leading-relaxed mb-10 max-w-xl">
                Two intelligence engines. One platform. Upload a photo, factorize any product — from components to competitive strategy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/analyze">
                  <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#BFA46A] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4BE8A] transition-all cursor-pointer group" data-testid="hero-cta">
                    Analyze Your First Product — Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/10 text-[#ccc] rounded-lg hover:border-[#BFA46A]/30 hover:text-[#BFA46A] transition-all"
                  data-testid="hero-learn-more"
                >
                  See How It Works
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Two Product Cards ═══ */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">Two Engines</p>
            <h2 className="text-3xl md:text-4xl font-bold">One platform. Two ways to decode.</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Factorizer */}
            <AnimatedSection delay={0}>
              <div className="group relative p-8 rounded-2xl bg-[#111]/60 border border-white/5 hover:border-[#BFA46A]/20 transition-all duration-500 h-full flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-[#BFA46A]/10 flex items-center justify-center mb-6 group-hover:bg-[#BFA46A]/15 transition-colors">
                  <Camera className="w-7 h-7 text-[#BFA46A]" />
                </div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold">Factorizer Engine</h3>
                </div>
                <p className="text-sm font-semibold text-[#BFA46A] mb-3">Photo → Blueprint</p>
                <p className="text-sm text-[#777] leading-relaxed flex-1 mb-8">
                  Upload a photo of any product. Get component identification, BOM estimation, manufacturing costs at scale, IP vulnerability scan, and competitive positioning.
                </p>
                <Link href="/analyze">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#BFA46A] text-[#0A0A0A] rounded-lg hover:bg-[#D4BE8A] transition-colors cursor-pointer group/btn" data-testid="card-factorizer-cta">
                    Try Factorizer
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </AnimatedSection>

            {/* Card 2: Reality Lens */}
            <AnimatedSection delay={150}>
              <div className="group relative p-8 rounded-2xl bg-[#111]/60 border border-white/5 hover:border-[#0EA5E9]/20 transition-all duration-500 h-full flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center mb-6 group-hover:bg-[#0EA5E9]/15 transition-colors">
                  <Layers className="w-7 h-7 text-[#0EA5E9]" />
                </div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold">Reality Lens</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-full">New</span>
                </div>
                <p className="text-sm font-semibold text-[#0EA5E9] mb-3">Product → Strategy</p>
                <p className="text-sm text-[#777] leading-relaxed flex-1 mb-8">
                  Enter any product, company, or technology. Get a 5-layer strategic deep dive: Identity, Anatomy, Process, Economics, and Ecosystem — with Build/Acquire/Partner verdicts.
                </p>
                <Link href="/reality-lens">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0EA5E9] text-[#0A0A0A] rounded-lg hover:bg-[#38BDF8] transition-colors cursor-pointer group/btn" data-testid="card-reality-lens-cta">
                    Try Reality Lens
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold">Three steps. Full intelligence.</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Upload or Enter",
                description: "Drop a photo for Factorizer, or type a product name for Reality Lens. Two paths to the same deep intelligence.",
                color: "#BFA46A"
              },
              {
                icon: Zap,
                step: "02",
                title: "Analyze",
                description: "AI identifies components, materials, costs, IP risks, and runs 5-layer strategic factorization in seconds.",
                color: "#0EA5E9"
              },
              {
                icon: FileText,
                step: "03",
                title: "Report",
                description: "Get a full intelligence brief: BOM, cost estimates, IP risks, competitive positioning, and strategic verdicts.",
                color: "#BFA46A"
              }
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <div className="relative group p-8 rounded-xl bg-[#111]/60 border border-white/5 hover:border-white/10 transition-all duration-500 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-mono text-[#555]">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#777] leading-relaxed">{item.description}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ What You Get — Capabilities ═══ */}
      <section id="capabilities" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#0EA5E9] mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to decode hardware.</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: "Component Identification",
                description: "Resistors, ICs, motors, sensors, connectors — identified and cataloged with confidence scores.",
                accent: "#BFA46A"
              },
              {
                icon: Layers,
                title: "5-Layer Strategic Analysis",
                description: "Identity, Anatomy, Process, Economics, Ecosystem — Reality Lens breaks down any product into actionable intelligence.",
                accent: "#0EA5E9"
              },
              {
                icon: DollarSign,
                title: "Manufacturing Cost Estimation",
                description: "Full BOM + labor + tooling costs at 1, 100, 1K, and 10K unit volumes.",
                accent: "#BFA46A"
              },
              {
                icon: Shield,
                title: "IP Vulnerability Scan",
                description: "Patent search and design-around recommendations. Know your risk before you ship.",
                accent: "#0EA5E9"
              },
              {
                icon: BarChart3,
                title: "Competitive Intelligence",
                description: "Feature comparison, differentiation gaps, and market positioning across verified competitors.",
                accent: "#BFA46A"
              },
              {
                icon: Box,
                title: "3D Blueprint Export",
                description: "CAD files, technical drawings, and assembly views. From photo to prototype in minutes.",
                accent: "#0EA5E9"
              }
            ].map((item, i) => (
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

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#BFA46A] mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing.</h2>
            <p className="text-[#666] mt-3">Start free. Scale when you're ready.</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <AnimatedSection delay={0}>
              <div className="p-6 rounded-xl bg-[#111]/60 border border-white/5 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-base font-semibold mb-1">Free</h3>
                  <p className="text-xs text-[#666]">Try both engines</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-[#666] ml-1">/forever</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["1 Factorizer report", "1 Reality Lens analysis", "Basic component ID", "No credit card required"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#999]">
                      <Check className="w-4 h-4 text-[#555] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/analyze">
                  <span className="block w-full text-center px-4 py-2.5 text-sm font-medium border border-white/10 rounded-lg hover:border-white/20 transition-colors cursor-pointer" data-testid="pricing-free">
                    Get Started
                  </span>
                </Link>
              </div>
            </AnimatedSection>

            {/* Pay-As-You-Go */}
            <AnimatedSection delay={100}>
              <div className="p-6 rounded-xl bg-[#111]/60 border border-white/5 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-base font-semibold mb-1">Pay-As-You-Go</h3>
                  <p className="text-xs text-[#666]">Buy credits as needed</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-sm text-[#666] ml-1">/report</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Either mode — Factorizer or Reality Lens", "Full component analysis", "5-layer strategic reports", "Manufacturing cost estimates", "IP vulnerability scan"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#999]">
                      <Check className="w-4 h-4 text-[#555] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <StripeBuyButton buttonId="SINGLE_REPORT" />
              </div>
            </AnimatedSection>

            {/* Pro — Recommended */}
            <AnimatedSection delay={200}>
              <div className="relative p-6 rounded-xl bg-[#111]/80 border border-[#BFA46A]/30 flex flex-col h-full glow-gold">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#BFA46A] text-[#0A0A0A] text-xs font-semibold rounded-full">
                  Recommended
                </div>
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#BFA46A] mb-1">Pro</h3>
                  <p className="text-xs text-[#666]">For hardware teams</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#BFA46A]">$99</span>
                  <span className="text-sm text-[#666] ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["10 reports/month — both modes", "Priority processing", "Export to CAD", "API access", "IP vulnerability scan", "Competitive intel"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                      <Check className="w-4 h-4 text-[#BFA46A] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <StripeBuyButton buttonId="PRO_MONTHLY" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.15em] uppercase text-[#555] mb-8">Used by hardware teams at</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {["ACME Robotics", "NovaTech", "Helix Bio", "Aperture Labs", "Quantum Dynamics"].map((name, i) => (
                <div 
                  key={i} 
                  className="px-6 py-3 rounded-lg bg-white/[0.02] border border-white/5 text-[#444] text-sm font-medium tracking-wide"
                >
                  {name}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { value: "2,400+", label: "Products Analyzed" },
              { value: "847M", label: "Neural Patterns Processed" },
              { value: "91.7%", label: "Accuracy Rate" }
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 100} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-[#666]">{stat.label}</div>
              </AnimatedSection>
            ))}
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
            <p className="text-[#777] mb-8">
              Join 2,400+ hardware teams already using Factorizer to accelerate product development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#BFA46A] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4BE8A] transition-all cursor-pointer text-lg group" data-testid="cta-final">
                  Try Factorizer — Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link href="/reality-lens">
                <span className="inline-flex items-center gap-2 px-8 py-4 border border-[#0EA5E9]/30 text-[#0EA5E9] font-semibold rounded-lg hover:bg-[#0EA5E9]/5 transition-all cursor-pointer text-lg group" data-testid="cta-reality-lens">
                  Try Reality Lens
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
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
                AI-powered product intelligence — reverse-engineer any hardware in seconds. Built by Waveform Tech.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#555] mb-4">Product</h4>
              <ul className="space-y-2">
                {["Factorizer", "Reality Lens", "Pricing", "API Docs"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-[#666] hover:text-[#BFA46A] transition-colors cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#555] mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-[#666] hover:text-[#BFA46A] transition-colors cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#444]">&copy; 2026 Waveform Tech. All rights reserved.</p>
            <PerplexityAttribution />
          </div>
        </div>
      </footer>
      <AgentCopilot />
    </div>
  );
}
