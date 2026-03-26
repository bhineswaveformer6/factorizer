import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Reality Lens, an expert AI strategic intelligence engine built by Waveform Tech. Perform a 5-layer strategic factorization of any product, company, or technology.

Return JSON with: subject, type, identity (full_name, company, category, launch_date, price_range, positioning, target_customer, brand_perception_score 1-10), anatomy (core_technology, key_components with name/purpose/estimated_cost, total_bom_estimate, key_patents, manufacturing_complexity_score 1-10), process (manufacturing_overview, supply_chain with stage/location/risk, quality_checkpoints, time_to_market), economics (unit_economics with cogs/retail_price/gross_margin_pct/estimated_annual_revenue, revenue_model, tam, sam, som, competitive_pricing with competitor/price/value_proposition), ecosystem (competitors with name/market_share_pct/key_strength/key_weakness, competitive_dimensions with price/quality/features/brand/innovation 0-1, partnerships, threats, growth_vectors), verdict (recommended BUILD/ACQUIRE/PARTNER/REMIX, confidence 0-1, rationale, alternatives), and summary. Be specific and data-driven with real numbers.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Provide a product/company to analyze' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ── LAYER 1: Deep strategic analysis via GPT-4o ──────────
    const [gptRes, perplexityRes] = await Promise.allSettled([
      openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Perform a complete 5-layer strategic factorization of: "${query.trim()}". Return JSON.` }
        ],
      }),

      // ── LAYER 2: Live market intelligence via Perplexity Sonar ──
      fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'user',
            content: `Live competitive intelligence for "${query.trim()}". Return ONLY JSON:
{
  "latest_news": "Most recent significant news about this product/company (2025-2026)",
  "current_pricing": "Current real-world pricing data",
  "recent_funding": "Any recent funding rounds or financial events",
  "top_competitors_now": ["competitor1", "competitor2", "competitor3"],
  "market_signal": "One sharp sentence on what the market is doing right now",
  "red_flags": ["Any current concerns, lawsuits, or risks"],
  "build_signal": "Should someone build in this space right now? One sentence."
}`
          }],
          max_tokens: 500,
        }),
      }).then(r => r.json())
    ]);

    // Parse GPT analysis
    const gptContent = gptRes.status === 'fulfilled'
      ? JSON.parse(gptRes.value.choices[0].message.content || '{}')
      : {};

    // Parse Perplexity live data
    let liveIntel = null;
    if (perplexityRes.status === 'fulfilled') {
      try {
        const sonarText = perplexityRes.value.choices?.[0]?.message?.content || '';
        const jsonMatch = sonarText.match(/\{[\s\S]*\}/);
        if (jsonMatch) liveIntel = JSON.parse(jsonMatch[0]);
      } catch(e) { /* non-fatal */ }
    }

    res.json({
      success: true,
      analysis: gptContent,
      live_intel: liveIntel,
      meta: {
        engine: 'reality-lens',
        timestamp: new Date().toISOString(),
        query: query.trim(),
        perplexity_enriched: !!liveIntel,
      }
    });

  } catch (err: any) {
    console.error('Reality Lens error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
