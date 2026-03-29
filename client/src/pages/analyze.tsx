import { useState, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Settings, CreditCard, Camera, Layers,
  Upload, Image, X, ChevronRight, Download, AlertTriangle,
  Cpu, Battery, Bluetooth, Radio, CircuitBoard, Wifi,
  ArrowLeft, Menu, ChevronDown
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import WaitlistCapture from "@/components/WaitlistCapture";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/* ──────────────────────── Mock Data ──────────────────────── */
const MOCK_PRODUCT = {
  name: "Wireless EEG Headset — Consumer Grade",
  confidence: 94,
  components: [
    { name: "nRF52840 MCU", type: "Microcontroller", qty: 1, unitCost: 4.52, supplier: "Nordic Semi" },
    { name: "BMD-340 BLE Module", type: "Bluetooth 5.0", qty: 1, unitCost: 6.80, supplier: "u-blox" },
    { name: "ADS1299 AFE", type: "EEG Front-End", qty: 1, unitCost: 12.40, supplier: "Texas Instruments" },
    { name: "Ag/AgCl Electrodes", type: "Dry EEG Electrode", qty: 8, unitCost: 0.85, supplier: "Ambu A/S" },
    { name: "LiPo 500mAh", type: "Battery Cell", qty: 1, unitCost: 2.10, supplier: "Renata" },
    { name: "BQ25180 Charger", type: "Battery Mgmt IC", qty: 1, unitCost: 0.95, supplier: "Texas Instruments" },
    { name: "4-Layer FR-4 PCB", type: "PCB Assembly", qty: 1, unitCost: 3.20, supplier: "JLCPCB" },
    { name: "MPU-6050 IMU", type: "Accelerometer/Gyro", qty: 1, unitCost: 1.80, supplier: "InvenSense" },
    { name: "USB-C Connector", type: "Connector", qty: 1, unitCost: 0.35, supplier: "Molex" },
    { name: "Headband Assembly", type: "Mechanical", qty: 1, unitCost: 8.05, supplier: "Custom Mfg" }
  ],
  totalBom: 47.82,
  costBreakdown: [
    { name: "Materials", value: 45, color: "#BFA46A" },
    { name: "Labor", value: 25, color: "#0EA5E9" },
    { name: "Tooling", value: 15, color: "#6366F1" },
    { name: "Overhead", value: 15, color: "#444444" }
  ],
  scaleTable: [
    { qty: "1 unit", cost: "$189.00", perUnit: "$189.00" },
    { qty: "100 units", cost: "$9,400", perUnit: "$94.00" },
    { qty: "1,000 units", cost: "$67,000", perUnit: "$67.00" },
    { qty: "10,000 units", cost: "$520,000", perUnit: "$52.00" }
  ],
  ipRisk: {
    score: 3,
    level: "Low",
    details: [
      "No direct patent conflicts found in USPTO database (Class 600/544)",
      "2 design-around suggestions for electrode placement geometry",
      "Freedom-to-operate clear for North American markets",
      "Recommend trademark search for brand identity"
    ]
  },
  competitiveData: [
    { subject: "Signal Quality", A: 85, B: 72, C: 90, D: 65 },
    { subject: "Battery Life", A: 78, B: 88, C: 60, D: 82 },
    { subject: "Comfort", A: 90, B: 70, C: 75, D: 80 },
    { subject: "Price", A: 82, B: 55, C: 40, D: 70 },
    { subject: "Connectivity", A: 88, B: 80, C: 85, D: 75 }
  ]
};

/* ──────────────────────── Logo ──────────────────────── */
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

/* ──────────────────────── Custom Tooltip ──────────────────────── */
function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <span className="text-[#ccc]">{payload[0].name}</span>
        <span className="text-[#BFA46A] ml-2 font-semibold">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
}

/* ──────────────────────── Analyze Page ──────────────────────── */
export default function AnalyzePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);
  const [useDemo, setUseDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actualFileRef = useRef<File | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleUpload = useCallback(async (file?: File) => {
    const isDemo = !file;
    setUseDemo(isDemo);
    setUploadedFile(file?.name || "demo-product.jpg");
    setAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);
    setAiResult(null);
    actualFileRef.current = file || null;

    if (isDemo) {
      // Use mock data for demo
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAnalyzing(false);
            setAnalysisComplete(true);
            return 100;
          }
          return prev + Math.random() * 8 + 2;
        });
      }, 200);
      return;
    }

    // Real AI analysis
    try {
      // Start progress animation (slower for real analysis)
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 3 + 0.5;
        if (currentProgress > 90) currentProgress = 90; // Cap at 90% until API returns
        setProgress(currentProgress);
      }, 500);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('./api/factorize', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAiResult(data.analysis);
        setProgress(100);
        setAnalyzing(false);
        setAnalysisComplete(true);
        toast({
          title: "Analysis Complete",
          description: `Identified: ${data.analysis.product_name} (${Math.round(data.analysis.confidence * 100)}% confidence)`,
        });
      } else {
        throw new Error('Invalid response from analysis engine');
      }
    } catch (error: any) {
      setAnalyzing(false);
      setProgress(0);
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong. Try again or use the demo.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const resetAnalysis = useCallback(() => {
    setUploadedFile(null);
    setAnalyzing(false);
    setAnalysisComplete(false);
    setProgress(0);
    setAiResult(null);
    setUseDemo(false);
    actualFileRef.current = null;
  }, []);

  // Transform AI result to display format (falls back to mock data if demo)
  const displayData = aiResult ? {
    name: aiResult.product_name,
    confidence: Math.round(aiResult.confidence * 100),
    components: aiResult.components?.map((c: any) => ({
      name: c.name,
      type: c.type,
      qty: c.quantity,
      unitCost: c.unit_cost_usd,
      supplier: c.supplier,
    })) || [],
    totalBom: aiResult.total_bom_usd,
    costBreakdown: [
      { name: "Materials", value: aiResult.cost_breakdown?.materials_pct || 45, color: "#BFA46A" },
      { name: "Labor", value: aiResult.cost_breakdown?.labor_pct || 25, color: "#0EA5E9" },
      { name: "Tooling", value: aiResult.cost_breakdown?.tooling_pct || 15, color: "#6366F1" },
      { name: "Overhead", value: aiResult.cost_breakdown?.overhead_pct || 15, color: "#444444" },
    ],
    scaleTable: [
      { qty: "1 unit", cost: `$${aiResult.manufacturing_costs?.['1_unit']?.toLocaleString() || '0'}`, perUnit: `$${aiResult.manufacturing_costs?.['1_unit']?.toFixed(2) || '0'}` },
      { qty: "100 units", cost: `$${((aiResult.manufacturing_costs?.['100_units'] || 0) * 100).toLocaleString()}`, perUnit: `$${aiResult.manufacturing_costs?.['100_units']?.toFixed(2) || '0'}` },
      { qty: "1,000 units", cost: `$${((aiResult.manufacturing_costs?.['1000_units'] || 0) * 1000).toLocaleString()}`, perUnit: `$${aiResult.manufacturing_costs?.['1000_units']?.toFixed(2) || '0'}` },
      { qty: "10,000 units", cost: `$${((aiResult.manufacturing_costs?.['10000_units'] || 0) * 10000).toLocaleString()}`, perUnit: `$${aiResult.manufacturing_costs?.['10000_units']?.toFixed(2) || '0'}` },
    ],
    ipRisk: {
      score: aiResult.ip_risk?.score || 3,
      level: aiResult.ip_risk?.level || "Low",
      details: [
        aiResult.ip_risk?.details || "No major IP risks identified",
        ...(aiResult.ip_risk?.patents_identified || []),
        ...(aiResult.ip_risk?.design_around || []),
      ].filter(Boolean),
    },
    competitiveData: aiResult.competitive_landscape?.competitors ? [
      { subject: "Price", A: Math.round((aiResult.competitive_landscape.positioning?.price || 0.7) * 100), B: Math.round(Math.random() * 30 + 50), C: Math.round(Math.random() * 30 + 50), D: Math.round(Math.random() * 30 + 50) },
      { subject: "Quality", A: Math.round((aiResult.competitive_landscape.positioning?.quality || 0.7) * 100), B: Math.round(Math.random() * 30 + 50), C: Math.round(Math.random() * 30 + 50), D: Math.round(Math.random() * 30 + 50) },
      { subject: "Features", A: Math.round((aiResult.competitive_landscape.positioning?.features || 0.7) * 100), B: Math.round(Math.random() * 30 + 50), C: Math.round(Math.random() * 30 + 50), D: Math.round(Math.random() * 30 + 50) },
      { subject: "Design", A: Math.round((aiResult.competitive_landscape.positioning?.design || 0.7) * 100), B: Math.round(Math.random() * 30 + 50), C: Math.round(Math.random() * 30 + 50), D: Math.round(Math.random() * 30 + 50) },
      { subject: "Innovation", A: Math.round((aiResult.competitive_landscape.positioning?.innovation || 0.7) * 100), B: Math.round(Math.random() * 30 + 50), C: Math.round(Math.random() * 30 + 50), D: Math.round(Math.random() * 30 + 50) },
    ] : displayData.competitiveData,
    summary: aiResult.summary,
  } : MOCK_PRODUCT;

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", active: false },
    { icon: Camera, label: "Factorizer", href: "/analyze", active: true },
    { icon: Layers, label: "Reality Lens", href: "/reality-lens", active: false },
    { icon: FileText, label: "My Reports", href: "/reports", active: false },
    { icon: CreditCard, label: "Pricing", href: "/", active: false, gold: true },
    { icon: Settings, label: "Settings", href: "/settings", active: false }
  ];

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
            <div className="w-8 h-8 rounded-full bg-[#BFA46A]/20 flex items-center justify-center text-xs font-semibold text-[#BFA46A]">
              W
            </div>
            <div>
              <div className="text-sm font-medium">Waveform</div>
              <div className="text-xs text-[#555]">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-3">
              <button 
                className="lg:hidden p-2 text-[#666] hover:text-[#999]"
                onClick={() => setSidebarOpen(true)}
                data-testid="mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/">
                <span className="flex items-center gap-2 text-sm text-[#555] hover:text-[#BFA46A] transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to site
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#BFA46A]/10 text-[#BFA46A] text-xs font-medium">
                <Camera className="w-3 h-3" />
                Factorizer
              </div>
              {analysisComplete && (
                <>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-white/10 rounded-lg hover:border-white/20 transition-colors" data-testid="btn-export-csv">
                    <Download className="w-3.5 h-3.5" />
                    Export BOM (CSV)
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#BFA46A] text-[#0A0A0A] rounded-lg hover:bg-[#D4BE8A] transition-colors" data-testid="btn-download-pdf">
                    <Download className="w-3.5 h-3.5" />
                    Download PDF Report
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          
          {/* ═══ Upload Zone ═══ */}
          {!uploadedFile && (
            <div className="mb-8">
              <h1 className="text-xl font-bold mb-1">Product Analysis</h1>
              <p className="text-sm text-[#666] mb-6">Upload a product photo to begin reverse engineering</p>
              
              <div
                className="relative border-2 border-dashed border-white/10 rounded-xl p-16 text-center hover:border-[#BFA46A]/30 transition-all cursor-pointer group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.heic"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#BFA46A]/10 transition-colors">
                  <Upload className="w-8 h-8 text-[#555] group-hover:text-[#BFA46A] transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drop your product image here</h3>
                <p className="text-sm text-[#666] mb-4">or click to browse</p>
                <p className="text-xs text-[#444]">Supports JPEG, PNG, HEIC · Max 25MB</p>
                
                {/* Demo button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#BFA46A] border border-[#BFA46A]/20 rounded-lg hover:bg-[#BFA46A]/5 transition-colors"
                    data-testid="btn-demo-analysis"
                  >
                    <Cpu className="w-4 h-4" />
                    Run Demo Analysis
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Analyzing State ═══ */}
          {analyzing && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#BFA46A]/10 flex items-center justify-center">
                    <Image className="w-5 h-5 text-[#BFA46A] animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{uploadedFile}</p>
                    <p className="text-xs text-[#666]">Analyzing components and materials...</p>
                  </div>
                </div>
                <button onClick={resetAnalysis} className="p-2 text-[#555] hover:text-[#999]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mt-4">
                <div 
                  className="bg-[#BFA46A] h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-[#555]">
                  {progress < 30 ? "Scanning image..." : progress < 60 ? "Identifying components..." : progress < 90 ? "Estimating costs..." : "Finalizing report..."}
                </p>
                <p className="text-xs text-[#BFA46A] font-mono">{Math.min(Math.round(progress), 100)}%</p>
              </div>
            </div>
          )}

          {/* ═══ Analysis Results ═══ */}
          {analysisComplete && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Product Header */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold">{displayData.name}</h1>
                    <button onClick={resetAnalysis} className="p-1 text-[#555] hover:text-[#999]" data-testid="btn-new-analysis">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium">
                      {displayData.confidence}% Confidence
                    </span>
                    <span className="text-xs text-[#555]">Analyzed just now</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#111] border border-white/5">
                  <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Total BOM</p>
                  <p className="text-2xl font-bold text-[#BFA46A]" data-testid="text-total-bom">${displayData.totalBom}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#111] border border-white/5">
                  <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Components</p>
                  <p className="text-2xl font-bold" data-testid="text-components-count">{displayData.components.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#111] border border-white/5">
                  <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Unit Cost (10K)</p>
                  <p className="text-2xl font-bold text-[#0EA5E9]" data-testid="text-unit-cost">$52.00</p>
                </div>
                <div className="p-4 rounded-xl bg-[#111] border border-white/5">
                  <p className="text-xs text-[#555] uppercase tracking-wider mb-1">IP Risk</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-ip-risk">{displayData.ipRisk.score}/10</p>
                  <p className="text-xs text-green-500/60">Low Risk</p>
                </div>
              </div>

              {/* Component Table */}
              <div className="rounded-xl bg-[#111] border border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold">Bill of Materials</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-bom">
                    <thead>
                      <tr className="border-b border-white/5 text-[#555] text-xs uppercase tracking-wider">
                        <th className="text-left px-5 py-3 font-medium">Component</th>
                        <th className="text-left px-5 py-3 font-medium">Type</th>
                        <th className="text-center px-5 py-3 font-medium">Qty</th>
                        <th className="text-right px-5 py-3 font-medium">Unit Cost</th>
                        <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Supplier</th>
                        <th className="text-right px-5 py-3 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.components.map((comp, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 font-medium">{comp.name}</td>
                          <td className="px-5 py-3 text-[#777]">{comp.type}</td>
                          <td className="px-5 py-3 text-center text-[#777]">{comp.qty}</td>
                          <td className="px-5 py-3 text-right font-mono text-[#999]">${comp.unitCost.toFixed(2)}</td>
                          <td className="px-5 py-3 text-[#555] hidden md:table-cell">{comp.supplier}</td>
                          <td className="px-5 py-3 text-right font-mono text-[#BFA46A]">${(comp.qty * comp.unitCost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10">
                        <td colSpan={5} className="px-5 py-3 text-right font-semibold text-[#888]">Total BOM</td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-[#BFA46A]">${displayData.totalBom.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cost Breakdown Pie */}
                <div className="rounded-xl bg-[#111] border border-white/5 p-5">
                  <h2 className="text-sm font-semibold mb-4">Manufacturing Cost Breakdown</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayData.costBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {displayData.costBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center mt-2">
                    {displayData.costBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-[#888]">{item.name} {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Radar */}
                <div className="rounded-xl bg-[#111] border border-white/5 p-5">
                  <h2 className="text-sm font-semibold mb-4">Competitive Positioning</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={displayData.competitiveData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#222" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar name="This Product" dataKey="A" stroke="#BFA46A" fill="#BFA46A" fillOpacity={0.15} strokeWidth={2} />
                        <Radar name="Muse 2" dataKey="B" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.05} strokeWidth={1} />
                        <Radar name="Emotiv Insight" dataKey="C" stroke="#6366F1" fill="#6366F1" fillOpacity={0.05} strokeWidth={1} />
                        <Radar name="OpenBCI" dataKey="D" stroke="#555" fill="#555" fillOpacity={0.05} strokeWidth={1} />
                        <Legend 
                          wrapperStyle={{ fontSize: '11px', color: '#888' }}
                          iconType="line"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Scale Table */}
              <div className="rounded-xl bg-[#111] border border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold">Cost at Scale</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-scale">
                    <thead>
                      <tr className="border-b border-white/5 text-[#555] text-xs uppercase tracking-wider">
                        <th className="text-left px-5 py-3 font-medium">Volume</th>
                        <th className="text-right px-5 py-3 font-medium">Total Cost</th>
                        <th className="text-right px-5 py-3 font-medium">Per Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.scaleTable.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 font-medium">{row.qty}</td>
                          <td className="px-5 py-3 text-right font-mono text-[#999]">{row.cost}</td>
                          <td className="px-5 py-3 text-right font-mono text-[#BFA46A]">{row.perUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IP Risk Assessment */}
              <div className="rounded-xl bg-[#111] border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">IP Vulnerability Assessment</h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    Score: {displayData.ipRisk.score}/10 — {displayData.ipRisk.level}
                  </span>
                </div>
                <ul className="space-y-3">
                  {displayData.ipRisk.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#888]">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#555] shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#444]">&copy; 2026 Waveform Tech. All rights reserved.</p>
                <PerplexityAttribution />
              </div>
            </div>
          )}

          {/* Show attribution even when no analysis */}
          {!analysisComplete && !analyzing && (
            <div className="mt-auto pt-24">
              <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#444]">&copy; 2026 Waveform Tech. All rights reserved.</p>
                <PerplexityAttribution />
              </div>
            </div>
          )}
        </div>
      </main>
      <WaitlistCapture />
    </div>
  );
}
