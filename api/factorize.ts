import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const MODEL    = "qwen/qwen3-vl-32b-instruct";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// ── PINK FORMULA: P × I × √(N × K) ──────────────────────────────────────────
// P = Probability of failure (0–10)
// I = Impact severity when it fails (0–10)
// N = Number of system dependencies on this component
// K = Knowledge gap score (0–10; how poorly understood the failure mode is)
function computePINK(components: Array<{p:number;i:number;n:number;k:number;name:string}>): {
  critical_node: string; score: number; band: string; components: typeof components & { pink: number }[];
} {
  const scored = components.map(c => ({
    ...c,
    pink: Math.round(c.p * c.i * Math.sqrt(c.n * c.k) * 10) / 10
  }));
  scored.sort((a, b) => b.pink - a.pink);
  const top = scored[0];
  const band = top.pink >= 300 ? "CRITICAL" : top.pink >= 150 ? "HIGH" : top.pink >= 50 ? "MEDIUM" : "LOW";
  return { critical_node: top?.name || "Unknown", score: top?.pink || 0, band, components: scored };
}

const SYSTEM_PROMPT = `You are Factorizer — a universal system comprehension engine by CortexChain / Waveform Tech.

You X-ray any object: software, hardware, physical infrastructure, industrial machinery, or geotechnical systems.

CRITICAL RULES:
1. Score every field based on actual knowledge of THIS specific product. No template copying.
2. PINK components: assign realistic P, I, N, K values (0-10). The highest PINK = Critical Node.
3. Intelligence Brief uses EXACTLY 5 fixed fields — no deviation.
4. Return ONLY valid JSON. No markdown. No explanation.
5. NO OpenAI references anywhere in output.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const query = Array.isArray(fields.query) ? fields.query[0] : (fields.query || '') as string;
    const file  = files.image?.[0];
    const layer = Array.isArray(fields.layer) ? fields.layer[0] : (fields.layer || 'full') as string;

    if (!query && !file) return res.status(400).json({ error: 'query text or image file required' });

    const subject = query || file?.originalFilename?.replace(/\.[^.]+$/, '') || 'Unknown Product';

    const content: any[] = [{
      type: 'text',
      text: `Perform a complete 5-layer Factorizer teardown of: "${subject}"

You must return this EXACT JSON structure. Replace every [SCORE] and [VALUE] with real data for THIS specific product.

{
  "subject": "${subject}",
  "system_type": "[software|hardware|infrastructure|geotechnical|biological|mechanical]",
  "one_line": "[one sentence, no jargon — what this IS]",
  
  "intelligence_brief": {
    "what_it_is": "[one sentence — canonical identity, no jargon]",
    "what_it_does": "[the specific job it performs — functional description]",
    "how_it_works": "[mechanics in plain language — the actual operating principle]",
    "where_it_fails": [
      {"mode": "[failure mode 1]", "probability": [1-10], "severity": [1-10]},
      {"mode": "[failure mode 2]", "probability": [1-10], "severity": [1-10]},
      {"mode": "[failure mode 3]", "probability": [1-10], "severity": [1-10]}
    ],
    "what_to_watch": [
      "[early warning signal 1 — specific, measurable]",
      "[early warning signal 2 — specific, measurable]",
      "[early warning signal 3 — specific, measurable]"
    ]
  },
  
  "layers": {
    "L1_anatomy": {
      "components": [
        {"name": "[component name]", "role": "[function]", "layer_type": "[SILICON|MECHANICAL|IO_SENSOR|SOFTWARE|SUPPLY_CHAIN|PRICING|MOAT]", "cost_est": "[$ or free text]"},
        {"name": "[component name]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component name]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component name]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component name]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"}
      ],
      "total_bom_est": "[$ range or description]",
      "complexity_score": [SCORE 1-10]
    },
    "L2_mechanics": {
      "data_or_energy_flow": "[how inputs become outputs — the operating chain]",
      "key_interfaces": ["[interface 1]", "[interface 2]", "[interface 3]"],
      "bottleneck": "[the single step that limits performance or capacity]",
      "diagram_description": "[isometric/cutaway/flow — what the X-ray would show]"
    },
    "L3_swot": {
      "strengths": ["[strength 1]", "[strength 2]", "[strength 3]"],
      "weaknesses": ["[weakness 1]", "[weakness 2]"],
      "opportunities": ["[opportunity 1]", "[opportunity 2]"],
      "threats": ["[threat 1]", "[threat 2]"],
      "competitors": [
        {"name": "[competitor]", "price": "[$ range]", "gap": "[key differentiator vs subject]"},
        {"name": "[competitor]", "price": "[$ range]", "gap": "[key differentiator vs subject]"}
      ]
    },
    "L4_reality_lens": {
      "buyer_profile": "[specific buyer — role, firm size, trigger event]",
      "purchase_trigger": "[the specific event that causes them to buy]",
      "growth_vector": "[the single biggest expansion opportunity]",
      "moat_analysis": "[what makes this defensible or not — be honest]",
      "trajectory": "[ASCENDING|STABLE|DESCENDING]",
      "trajectory_reason": "[why — one sentence]"
    },
    "L5_blueprint": {
      "recommended_action": "[BUILD|ACQUIRE|PARTNER|REMIX|INVEST|AVOID]",
      "action_rationale": "[specific reasoning for THIS product]",
      "key_risk_if_wrong": "[what happens if the action recommendation is incorrect]",
      "share_token": "[factorizer-${subject.replace(/\s+/g, '-').toLowerCase()}-v1]"
    }
  },
  
  "pink": {
    "components": [
      {"name": "[critical component 1]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[critical component 2]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[critical component 3]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[critical component 4]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[critical component 5]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]}
    ]
  },
  
  "qtac7": [
    {"name": "Q · Product Quality",       "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "T · Economic Return",        "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "A · Market Alignment",       "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "C · Moat Durability",        "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "D · Compounding Trajectory", "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "R · Reinvestment Runway",    "score": [SCORE 0-10], "pct": [score×10]},
    {"name": "V · Error Resilience",       "score": [SCORE 0-10], "pct": [score×10]}
  ],
  
  "confidence": [SCORE 0.0-1.0],
  "evidence_gaps": ["[specific missing data 1]", "[specific missing data 2]", "[specific missing data 3]"],
  "volts_earned": [integer 1-5 based on teardown completeness]
}`
    }];

    // Attach image if provided
    if (file) {
      const imageBuffer = fs.readFileSync(file.filepath);
      const b64  = imageBuffer.toString('base64');
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
        'X-Title': 'Factorizer — Universal System Comprehension Engine'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.20,
        max_tokens: 3000
      })
    });

    if (!orRes.ok) {
      const errText = await orRes.text().catch(() => 'unknown');
      return res.status(502).json({ success: false, error: `OpenRouter ${orRes.status}`, detail: errText });
    }

    const orData    = await orRes.json();
    const raw       = orData.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - t0;

    let analysis: any;
    try { analysis = JSON.parse(raw); }
    catch { return res.status(422).json({ success: false, error: 'Invalid JSON from model', raw: raw.slice(0, 500) }); }

    // ── Compute PINK server-side (never trust model's PINK score)
    if (Array.isArray(analysis.pink?.components) && analysis.pink.components.length > 0) {
      const pinkResult = computePINK(analysis.pink.components.map((c: any) => ({
        name: c.name || 'Unknown',
        p: Math.min(10, Math.max(0, Number(c.p) || 5)),
        i: Math.min(10, Math.max(0, Number(c.i) || 5)),
        n: Math.min(10, Math.max(0, Number(c.n) || 3)),
        k: Math.min(10, Math.max(0, Number(c.k) || 3)),
      })));
      analysis.pink = pinkResult;
    }

    // ── Compute Stone Score from QTAC₇ (deterministic)
    const WEIGHTS = [0.20, 0.15, 0.15, 0.15, 0.15, 0.10, 0.10];
    if (Array.isArray(analysis.qtac7) && analysis.qtac7.length >= 7) {
      analysis.qtac7 = analysis.qtac7.map((f: any, i: number) => {
        const s = Number(f.score) > 10 ? Number(f.score)/10 : Number(f.score) || 5;
        return { ...f, score: Math.round(s*100)/100, pct: Math.round(s*10) };
      });
      const stone = analysis.qtac7.slice(0,7).reduce(
        (acc: number, f: any, i: number) => acc + Math.min(10, Math.max(0, f.score)) * WEIGHTS[i], 0
      );
      analysis.stone_score = Math.round(stone * 100) / 100;
      const s = analysis.stone_score;
      analysis.stone_band = s>=8 ? 'STRONG YES' : s>=6.5 ? 'BUY' : s>=5 ? 'WATCH' : s>=3 ? 'PASS' : 'REJECT';
      // PINK affects stone score (higher PINK = lower stone)
      if (analysis.pink?.score > 200) {
        analysis.stone_score = Math.max(0, analysis.stone_score - 0.5);
        analysis.stone_score = Math.round(analysis.stone_score * 100) / 100;
      }
    }

    // ── VOLTS = completeness of teardown (all 5 layers present)
    const layerKeys = ['L1_anatomy','L2_mechanics','L3_swot','L4_reality_lens','L5_blueprint'];
    const layerCount = layerKeys.filter(k => analysis.layers?.[k]).length;
    analysis.volts_earned = Math.max(1, layerCount);

    res.json({
      success: true,
      analysis,
      meta: {
        engine: 'factorizer-v2.0',
        model: MODEL,
        provider: 'openrouter',
        pink_computed: true,
        stone_computed: true,
        latency_ms: latencyMs,
        prompt_tokens:      orData.usage?.prompt_tokens || 0,
        completion_tokens:  orData.usage?.completion_tokens || 0,
        timestamp: new Date().toISOString(),
        subject
      }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
