import type { VercelRequest, VercelResponse } from '@vercel/node';

const MODEL    = "qwen/qwen3-vl-32b-instruct";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are Reality Lens, a strategic intelligence engine by CortexChain / Waveform Tech.

Perform 5-layer strategic factorization of any product, company, or technology.

CRITICAL RULES:
- Score every dimension based on actual knowledge of THIS specific subject.
- DO NOT repeat template scores — every subject gets differentiated, honest scores.
- Confidence reflects data quality: inferred = 0.55-0.70, well-documented = 0.80-0.92.
- Verdict must reflect genuine assessment — BUILD/ACQUIRE/PARTNER/REMIX with real rationale.
- Return ONLY valid JSON. No markdown. No explanation text.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Provide a product/company to analyze' });

    const t0 = Date.now();
    const orRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://factorizer.cortexchain.io',
        'X-Title': 'Reality Lens by CortexChain'
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.25,
        max_tokens: 2500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Perform a complete 5-layer strategic factorization of: "${query.trim()}"

Return this exact JSON structure with differentiated, honest scores for THIS specific subject:
{
  "subject": "[canonical name]",
  "type": "[product|company|technology|platform]",
  "identity": {
    "full_name": "[full canonical name]",
    "company": "[manufacturer or parent company]",
    "category": "[Primary Category] · [Subcategory]",
    "launch_date": "[year or date range]",
    "price_range": "[actual price or range]",
    "positioning": "[one sentence on market position]",
    "target_customer": "[specific customer segment]",
    "brand_perception_score": [SCORE 1-10]
  },
  "anatomy": {
    "core_technology": "[key enabling technology]",
    "key_components": [
      {"name": "[component]", "purpose": "[function]", "estimated_cost": "[$ range]"},
      {"name": "[component]", "purpose": "[function]", "estimated_cost": "[$ range]"},
      {"name": "[component]", "purpose": "[function]", "estimated_cost": "[$ range]"}
    ],
    "total_bom_estimate": "[$ range]",
    "key_patents": ["[patent area 1]", "[patent area 2]"],
    "manufacturing_complexity_score": [SCORE 1-10]
  },
  "process": {
    "manufacturing_overview": "[specific manufacturing approach]",
    "supply_chain": [
      {"stage": "[stage]", "location": "[country/region]", "risk": "[LOW|MED|HIGH]"},
      {"stage": "[stage]", "location": "[country/region]", "risk": "[LOW|MED|HIGH]"}
    ],
    "quality_checkpoints": ["[checkpoint 1]", "[checkpoint 2]"],
    "time_to_market": "[timeline]"
  },
  "economics": {
    "unit_economics": {
      "cogs": "[$ range]",
      "retail_price": "[$ range]",
      "gross_margin_pct": [SCORE 0-100],
      "estimated_annual_revenue": "[$ range]"
    },
    "revenue_model": "[how they make money]",
    "tam": "[$ total addressable market]",
    "sam": "[$ serviceable addressable market]",
    "som": "[$ serviceable obtainable market]",
    "competitive_pricing": [
      {"competitor": "[name]", "price": "[$ range]", "value_proposition": "[differentiator]"},
      {"competitor": "[name]", "price": "[$ range]", "value_proposition": "[differentiator]"}
    ]
  },
  "ecosystem": {
    "competitors": [
      {"name": "[competitor]", "market_share_pct": [SCORE 0-100], "key_strength": "[strength]", "key_weakness": "[weakness]"},
      {"name": "[competitor]", "market_share_pct": [SCORE 0-100], "key_strength": "[strength]", "key_weakness": "[weakness]"}
    ],
    "competitive_dimensions": {
      "price": [SCORE 0-1],
      "quality": [SCORE 0-1],
      "features": [SCORE 0-1],
      "brand": [SCORE 0-1],
      "innovation": [SCORE 0-1]
    },
    "partnerships": ["[key partner 1]", "[key partner 2]"],
    "threats": ["[threat 1]", "[threat 2]"],
    "growth_vectors": ["[vector 1]", "[vector 2]"]
  },
  "verdict": {
    "recommended": "[BUILD|ACQUIRE|PARTNER|REMIX]",
    "confidence": [SCORE 0-1],
    "rationale": "[specific reasoning for this subject]",
    "alternatives": ["[alternative 1]", "[alternative 2]"]
  },
  "summary": "[3-4 sentences of strategic intelligence specific to THIS subject. Name real differentiators and real risks.]"
}` }
        ]
      })
    });

    if (!orRes.ok) {
      const errText = await orRes.text().catch(() => 'unknown');
      return res.status(502).json({ success: false, error: `OpenRouter error ${orRes.status}`, detail: errText });
    }

    const orData   = await orRes.json();
    const raw      = orData.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - t0;

    let analysis: any;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return res.status(422).json({ success: false, error: 'Model returned invalid JSON', raw: raw.slice(0, 500) });
    }

    res.json({
      success: true,
      analysis,
      meta: {
        engine: 'reality-lens',
        model: MODEL,
        provider: 'openrouter',
        latency_ms: latencyMs,
        prompt_tokens: orData.usage?.prompt_tokens || 0,
        completion_tokens: orData.usage?.completion_tokens || 0,
        timestamp: new Date().toISOString(),
        query: query.trim()
      }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
