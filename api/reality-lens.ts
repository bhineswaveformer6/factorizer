import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Reality Lens, an expert AI strategic intelligence engine. Perform 5-layer strategic factorization of any product/company/technology. Return JSON with: subject, type, identity (full_name, company, category, launch_date, price_range, positioning, target_customer, brand_perception_score 1-10), anatomy (core_technology, key_components with name/purpose/estimated_cost, total_bom_estimate, key_patents, manufacturing_complexity_score 1-10), process (manufacturing_overview, supply_chain with stage/location/risk, quality_checkpoints, time_to_market), economics (unit_economics with cogs/retail_price/gross_margin_pct/estimated_annual_revenue, revenue_model, tam, sam, som, competitive_pricing with competitor/price/value_proposition), ecosystem (competitors with name/market_share_pct/key_strength/key_weakness, competitive_dimensions with price/quality/features/brand/innovation 0-1, partnerships, threats, growth_vectors), verdict (recommended BUILD/ACQUIRE/PARTNER/REMIX, confidence 0-1, rationale, alternatives), and summary. Be specific and data-driven.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Provide a product/company to analyze' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Perform a complete 5-layer strategic factorization of: "${query.trim()}". Return JSON.` }
      ],
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, analysis, meta: { engine: 'reality-lens', timestamp: new Date().toISOString(), query: query.trim() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
