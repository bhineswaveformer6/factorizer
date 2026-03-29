/**
 * DISCOVERY WIDGET — The Snapchat Angle
 * 
 * Embeddable teaser that shows the first 2 of 5 Reality Lens layers
 * (Identity + Anatomy) with a "See Full X-Ray →" CTA that drives 
 * back to Factorizer. Shareable, viral, addictive.
 * 
 * Usage:
 *   <DiscoveryWidget />                    — embedded in Factorizer app
 *   <DiscoveryWidget embedded={true} />    — for iframe/external embed
 */

import { useState, useCallback } from 'react';
import { Layers, Search, ArrowRight, Cpu, DollarSign, Shield, Loader2, Sparkles } from 'lucide-react';

interface WidgetResult {
  subject: string;
  type: string;
  identity: {
    full_name: string;
    company: string;
    category: string;
    price_range: string;
    positioning: string;
    brand_perception_score: number;
  };
  anatomy: {
    core_technology: string[];
    key_components: { name: string; purpose: string; estimated_cost: string }[];
    total_bom_estimate: string;
    manufacturing_complexity_score: number;
  };
}

interface DiscoveryWidgetProps {
  embedded?: boolean;
  onFullXRay?: (query: string) => void;
  factorizerUrl?: string;
}

export function DiscoveryWidget({ 
  embedded = false, 
  onFullXRay,
  factorizerUrl = '/#/reality-lens' 
}: DiscoveryWidgetProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WidgetResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('./api/reality-lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();

      if (data.success && data.analysis) {
        setResult({
          subject: data.analysis.subject || searchQuery,
          type: data.analysis.type || 'Product',
          identity: data.analysis.identity || {},
          anatomy: data.analysis.anatomy || {},
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      setError('Analysis failed. Try again.');
    }
    setLoading(false);
  }, [query]);

  const handleFullXRay = () => {
    if (onFullXRay) {
      onFullXRay(query);
    } else {
      window.open(`${factorizerUrl}?q=${encodeURIComponent(query)}`, embedded ? '_blank' : '_self');
    }
  };

  return (
    <div className={`${embedded ? 'font-sans' : ''} w-full max-w-md mx-auto`}>
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#BFA46A]/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#BFA46A]" />
            </div>
            <span className="text-sm font-semibold text-[#E8E2D4]">Factorizer</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] font-medium">X-Ray</span>
          </div>
          <span className="text-[10px] text-[#555]">by Waveform Tech</span>
        </div>

        {/* Input */}
        <div className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter any product or company..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-[#E8E2D4] placeholder:text-[#444] focus:outline-none focus:border-[#BFA46A]/40 transition-colors"
                data-testid="widget-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-[#BFA46A] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4BE8A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              data-testid="widget-analyze"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? '' : 'Scan'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-4 pb-6 flex flex-col items-center gap-3">
            <div className="w-full h-1 bg-[#111] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#BFA46A] to-[#0EA5E9] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-[#555]">Scanning product intelligence...</p>
          </div>
        )}

        {/* Result — Identity + Anatomy teaser */}
        {result && !loading && (
          <div className="px-4 pb-4 space-y-3">
            
            {/* Subject Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#E8E2D4]">{result.subject}</h3>
                <p className="text-xs text-[#666]">{result.identity.company} · {result.identity.category}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BFA46A]/10 text-[#BFA46A] font-medium">
                {result.type}
              </span>
            </div>

            {/* Layer 1: Identity */}
            <div className="p-3 rounded-xl bg-[#111]/60 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#BFA46A]">Layer 1 · Identity</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed mb-2">{result.identity.positioning}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#666]">Price: <span className="text-[#E8E2D4]">{result.identity.price_range}</span></span>
                <span className="text-[#666]">Brand: <span className="text-[#BFA46A] font-semibold">{result.identity.brand_perception_score}/10</span></span>
              </div>
            </div>

            {/* Layer 2: Anatomy */}
            <div className="p-3 rounded-xl bg-[#111]/60 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#0EA5E9]">Layer 2 · Anatomy</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {result.anatomy.core_technology?.slice(0, 4).map((tech, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#666]">BOM: <span className="text-[#E8E2D4] font-semibold">{result.anatomy.total_bom_estimate}</span></span>
                <span className="text-[#666]">Complexity: <span className="text-[#0EA5E9] font-semibold">{result.anatomy.manufacturing_complexity_score}/10</span></span>
              </div>
            </div>

            {/* Locked layers teaser */}
            <div className="space-y-1.5">
              {['Process', 'Economics', 'Ecosystem'].map((layer, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#111]/30 border border-white/5 opacity-50">
                  <span className="text-[10px] font-medium text-[#555]">Layer {i + 3} · {layer}</span>
                  <span className="text-[10px] text-[#333]">🔒</span>
                </div>
              ))}
            </div>

            {/* Full X-Ray CTA */}
            <button
              onClick={handleFullXRay}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#BFA46A] to-[#D4BE8A] text-[#0A0A0A] text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#BFA46A]/20 transition-all group"
              data-testid="widget-full-xray"
            >
              See Full X-Ray — All 5 Layers + Verdict
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* VOLTS reward hint */}
            <p className="text-center text-[10px] text-[#444]">
              Complete the full teardown to earn <span className="text-[#BFA46A] font-semibold">+5 VOLTS</span>
            </p>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="px-4 pb-6 text-center">
            <p className="text-xs text-[#444]">Enter any product, company, or technology to get an instant intelligence preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}
