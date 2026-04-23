import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const MODEL   = "qwen/qwen3-vl-32b-instruct";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are Factorizer, an expert AI product intelligence engine by CortexChain / Waveform Tech.

CRITICAL SCORING RULES:
- Score every factor based on actual product-specific knowledge for THIS specific product.
- DO NOT copy or repeat any example numbers. Every product gets unique scores.
- Scores are 0.0-10.0. A software product should score differently on Core/Silicon than a GPU.
- A product with regulatory risk should score lower on Error Resilience.
- Confidence should reflect data availability — inferred = 0.55-0.70, well-documented = 0.80-0.92.
- If a product is risky or low-moat, score it WATCH, PASS, or REJECT.
- Return ONLY valid JSON. No markdown. No explanation text.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const query = Array.isArray(fields.query) ? fields.query[0] : fields.query || '';
    const file  = files.image?.[0];

    if (!query && !file) return res.status(400).json({ error: 'query text or image file required' });

    const content: any[] = [{
      type: 'text',
      text: `Analyze this specific product: "${query || file?.originalFilename || 'uploaded product'}"

IMPORTANT: Replace every [SCORE] with your actual assessment for THIS product.
Do NOT repeat the same score across fields unless the product genuinely warrants it.

Return this exact JSON structure:
{
  "title": "[product canonical name]",
  "category": "[Primary Category] · [Subcategory]",
  "summary": "[2-3 sentences of specific competitive intelligence. Name real differentiators and real risks.]",
  "confidence": [SCORE 0.0-1.0],
  "identity": {
    "entity": "[canonical name]",
    "product_type": "[hardware|software|platform|system]",
    "use_case": "[specific primary use case]",
    "manufacturer": "[company name]",
    "price_range": "[actual price or range]"
  },
  "qtac7": [
    {"name": "Q · Product Quality",       "score": [SCORE], "pct": [score×10]},
    {"name": "T · Economic Return",        "score": [SCORE], "pct": [score×10]},
    {"name": "A · Market Alignment",       "score": [SCORE], "pct": [score×10]},
    {"name": "C · Moat Durability",        "score": [SCORE], "pct": [score×10]},
    {"name": "D · Compounding Trajectory", "score": [SCORE], "pct": [score×10]},
    {"name": "R · Reinvestment Runway",    "score": [SCORE], "pct": [score×10]},
    {"name": "V · Error Resilience",       "score": [SCORE], "pct": [score×10]}
  ],
  "stone_score": [SCORE weighted composite 0.0-10.0],
  "stone_band": "[STRONG YES≥8.0 | BUY 6.5-7.9 | WATCH 5.0-6.4 | PASS 3.0-4.9 | REJECT<3.0]",
  "omega_gap": [absolute diff between QTAC avg and stone_score],
  "layers": [
    {"num": "L1", "icon": "⚡", "name": "Core/Silicon",     "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L2", "icon": "🧠", "name": "Memory/Storage",   "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L3", "icon": "🔗", "name": "Connectivity",     "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L4", "icon": "💻", "name": "Software/FW",      "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L5", "icon": "🏭", "name": "Supply Chain",     "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L6", "icon": "💰", "name": "Pricing/ASP",      "desc": "[specific detail for THIS product]", "score": [SCORE]},
    {"num": "L7", "icon": "🏰", "name": "Competitive Moat", "desc": "[specific detail for THIS product]", "score": [SCORE]}
  ],
  "signals": [
    {"type": "bull", "tag": "[TAG]", "text": "[specific bullish signal for THIS product]"},
    {"type": "bear", "tag": "[TAG]", "text": "[specific bearish risk for THIS product]"},
    {"type": "neut", "tag": "[TAG]", "text": "[specific neutral observation for THIS product]"},
    {"type": "[bull|bear|neut]", "tag": "[TAG]", "text": "[fourth signal for THIS product]"}
  ],
  "moves": [
    {"title": "[action]", "type": "PROVE",   "body": "[specific action]", "risk": "[risk if ignored]"},
    {"title": "[action]", "type": "IMPROVE", "body": "[specific action]", "risk": "[risk if ignored]"},
    {"title": "[action]", "type": "PROTECT", "body": "[specific action]", "risk": "[risk if ignored]"}
  ],
  "evidence_gaps": ["[real missing data point 1]", "[real missing data point 2]", "[real missing data point 3]"],
  "provenance": {
    "data_source": "[what knowledge was used]",
    "confidence_basis": "[why this confidence level]",
    "comparables": ["[real comparable 1]", "[real comparable 2]"]
  }
}`
    }];

    if (file) {
      const imageBuffer = fs.readFileSync(file.filepath);
      const b64 = imageBuffer.toString('base64');
      const mime = file.mimetype || 'image/jpeg';
      content.push({ type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } });
    }

    const t0 = Date.now();
    const orRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://factorizer.cortexchain.io',
        'X-Title': 'Factorizer by CortexChain'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.25,
        max_tokens: 2200
      })
    });

    if (!orRes.ok) {
      const errText = await orRes.text().catch(() => 'unknown');
      return res.status(502).json({ success: false, error: `OpenRouter error ${orRes.status}`, detail: errText });
    }

    const orData = await orRes.json();
    const raw    = orData.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - t0;

    let analysis: any;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return res.status(422).json({ success: false, error: 'Model returned invalid JSON', raw: raw.slice(0, 500) });
    }

    // Normalize scores deterministically
    if (analysis.stone_score > 10) analysis.stone_score = analysis.stone_score / 10;
    analysis.stone_score = Math.round(Number(analysis.stone_score || 0) * 100) / 100;
    if (analysis.confidence > 1)   analysis.confidence  = analysis.confidence  / 100;

    const weights = [0.20, 0.15, 0.15, 0.15, 0.15, 0.10, 0.10];
    if (Array.isArray(analysis.qtac7) && analysis.qtac7.length >= 7) {
      analysis.qtac7 = analysis.qtac7.map((f: any) => {
        const s = Number(f.score) > 10 ? Number(f.score)/10 : Number(f.score)||0;
        return { ...f, score: Math.round(s*100)/100, pct: Math.round(s*10) };
      });
      analysis.stone_score = Math.round(
        analysis.qtac7.slice(0,7).reduce((a: number, f: any, i: number) =>
          a + Math.min(10, Math.max(0, f.score)) * weights[i], 0) * 100) / 100;
    }

    const s = analysis.stone_score;
    analysis.stone_band = s>=8 ? 'STRONG YES' : s>=6.5 ? 'BUY' : s>=5 ? 'WATCH' : s>=3 ? 'PASS' : 'REJECT';

    res.json({
      success: true,
      analysis,
      meta: {
        engine: 'factorizer',
        model: MODEL,
        provider: 'openrouter',
        latency_ms: latencyMs,
        prompt_tokens: orData.usage?.prompt_tokens || 0,
        completion_tokens: orData.usage?.completion_tokens || 0,
        timestamp: new Date().toISOString(),
        query: query || file?.originalFilename || ''
      }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
