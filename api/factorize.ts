import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

// ── Canonical constants — never change without bumping versions
const MODEL          = "qwen/qwen3-vl-32b-instruct";
const BASE_URL       = "https://openrouter.ai/api/v1/chat/completions";
const SCHEMA_VERSION = "factorizer@2.0";
const PROMPT_VERSION = "v1.3";
const QTAC_WEIGHTS   = [0.20, 0.15, 0.15, 0.15, 0.15, 0.10, 0.10];

// ── PINK FORMULA: P × I × √(N × K) ─────────────────────────────────────────
// P = Probability of failure (0–10)   I = Impact severity (0–10)
// N = Dependency count (0–10)         K = Knowledge gap score (0–10)
// Novel vs FMECA: N amplifies connected nodes; K penalizes unknown failure modes
function computePINK(raw: Array<{p:number;i:number;n:number;k:number;name:string}>) {
  const scored = raw.map(c => {
    const p = clamp(c.p), i = clamp(c.i), n = clamp(c.n), k = clamp(c.k);
    return { ...c, p, i, n, k, pink: Math.round(p * i * Math.sqrt(n * k) * 10) / 10 };
  });
  scored.sort((a, b) => b.pink - a.pink);
  const top  = scored[0] ?? { name: "Unknown", pink: 0 };
  const band = top.pink >= 300 ? "CRITICAL" : top.pink >= 150 ? "HIGH" : top.pink >= 50 ? "MEDIUM" : "LOW";
  return { critical_node: top.name, score: top.pink, band, components: scored };
}

function clamp(v: any, lo = 0, hi = 10): number {
  return Math.min(hi, Math.max(lo, Number(v) || 0));
}

// ── Semantic validation — JSON-valid ≠ semantically correct ─────────────────
interface SemanticCheck { pass: boolean; warnings: string[]; errors: string[] }
function validateSemantics(a: any): SemanticCheck {
  const warnings: string[] = [];
  const errors:   string[] = [];

  // Intelligence brief completeness
  const brief = a.intelligence_brief || {};
  for (const field of ['what_it_is','what_it_does','how_it_works','where_it_fails','what_to_watch']) {
    if (!brief[field] || (Array.isArray(brief[field]) && brief[field].length === 0)) {
      errors.push(`intelligence_brief.${field} missing or empty`);
    }
  }

  // QTAC₇ diversity — all same score is a red flag
  if (Array.isArray(a.qtac7) && a.qtac7.length >= 7) {
    const scores = a.qtac7.map((f: any) => Number(f.score) || 0);
    const allSame = scores.every((s: number) => s === scores[0]);
    if (allSame) warnings.push("qtac7: all scores identical — likely template copy, not differentiated scoring");
    const outOfRange = scores.some((s: number) => s < 0 || s > 10);
    if (outOfRange) errors.push("qtac7: one or more scores outside [0,10]");
  } else {
    errors.push("qtac7: missing or fewer than 7 factors");
  }

  // PINK components
  if (!Array.isArray(a.pink?.components) || a.pink.components.length === 0) {
    errors.push("pink.components: missing — cannot compute Critical Node");
  } else {
    const allPSame = a.pink.components.every((c: any) => c.p === a.pink.components[0].p);
    if (allPSame) warnings.push("pink.components: all P values identical — check model differentiation");
  }

  // Confidence range
  const conf = Number(a.confidence);
  if (conf <= 0 || conf > 1) warnings.push(`confidence ${conf} outside (0,1] — will be clamped`);

  // Layers coverage
  const layers = a.layers || {};
  const missing = ['L1_anatomy','L2_mechanics','L3_swot','L4_reality_lens','L5_blueprint']
    .filter(k => !layers[k]);
  if (missing.length > 0) warnings.push(`layers: missing ${missing.join(', ')}`);

  return { pass: errors.length === 0, warnings, errors };
}

const SYSTEM_PROMPT = `You are Factorizer — a universal system comprehension engine by CortexChain / Waveform Tech.
You X-ray any object: software, hardware, physical infrastructure, industrial machinery, geotechnical systems.

RULES (non-negotiable):
1. Score every field based on actual knowledge of THIS specific product. No template copying.
2. PINK components: assign realistic, differentiated P, I, N, K values (0-10 each). Highest PINK = Critical Node.
3. intelligence_brief must have ALL 5 fields: what_it_is, what_it_does, how_it_works, where_it_fails, what_to_watch.
4. qtac7 scores must be differentiated — no two identical scores allowed.
5. Return ONLY valid JSON. No markdown fences. No explanation text.
6. NO OpenAI references anywhere in output.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ success: false, error: 'POST only' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ success: false, error: 'OPENROUTER_API_KEY not configured' });

  const t0 = Date.now();
  let subject = "Unknown";

  try {
    // ── Body parse — single read (Deno/fetch-style safety pattern)
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const query = Array.isArray(fields.query) ? fields.query[0] : (fields.query || '') as string;
    const file  = files.image?.[0];

    if (!query && !file) {
      return res.status(400).json({
        success: false,
        error: 'query text or image file required',
        schema_version: SCHEMA_VERSION,
        prompt_version: PROMPT_VERSION,
      });
    }

    subject = query || file?.originalFilename?.replace(/\.[^.]+$/, '') || 'Unknown Product';

    // ── Build multimodal content array
    const content: any[] = [{
      type: 'text',
      text: `Perform a complete 5-layer Factorizer teardown of: "${subject}"

Return this EXACT JSON. Replace every [SCORE] with real, differentiated data for THIS product.

{
  "subject": "${subject}",
  "system_type": "[software|hardware|infrastructure|geotechnical|biological|mechanical]",
  "one_line": "[one sentence, no jargon]",

  "intelligence_brief": {
    "what_it_is": "[one sentence — canonical identity]",
    "what_it_does": "[the specific job it performs]",
    "how_it_works": "[mechanics in plain language]",
    "where_it_fails": [
      {"mode": "[failure mode]", "probability": [1-10], "severity": [1-10]},
      {"mode": "[failure mode]", "probability": [1-10], "severity": [1-10]},
      {"mode": "[failure mode]", "probability": [1-10], "severity": [1-10]}
    ],
    "what_to_watch": [
      "[early warning signal 1 — specific and measurable]",
      "[early warning signal 2 — specific and measurable]",
      "[early warning signal 3 — specific and measurable]"
    ]
  },

  "layers": {
    "L1_anatomy": {
      "components": [
        {"name": "[component]", "role": "[function]", "layer_type": "[SILICON|MECHANICAL|IO_SENSOR|SOFTWARE|SUPPLY_CHAIN|PRICING|MOAT]", "cost_est": "[$ or free text]"},
        {"name": "[component]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"},
        {"name": "[component]", "role": "[function]", "layer_type": "[type]", "cost_est": "[$ or free text]"}
      ],
      "total_bom_est": "[$ range or description]",
      "complexity_score": [1-10]
    },
    "L2_mechanics": {
      "data_or_energy_flow": "[operating chain description]",
      "key_interfaces": ["[interface 1]", "[interface 2]", "[interface 3]"],
      "bottleneck": "[single performance-limiting step]",
      "diagram_description": "[what the X-ray would show]"
    },
    "L3_swot": {
      "strengths": ["[strength 1]", "[strength 2]", "[strength 3]"],
      "weaknesses": ["[weakness 1]", "[weakness 2]"],
      "opportunities": ["[opportunity 1]", "[opportunity 2]"],
      "threats": ["[threat 1]", "[threat 2]"],
      "competitors": [
        {"name": "[competitor]", "price": "[$ range]", "gap": "[differentiator vs subject]"},
        {"name": "[competitor]", "price": "[$ range]", "gap": "[differentiator vs subject]"}
      ]
    },
    "L4_reality_lens": {
      "buyer_profile": "[specific buyer — role, firm size, trigger event]",
      "purchase_trigger": "[specific event that causes them to buy]",
      "growth_vector": "[single biggest expansion opportunity]",
      "moat_analysis": "[honest defensibility assessment]",
      "trajectory": "[ASCENDING|STABLE|DESCENDING]",
      "trajectory_reason": "[one sentence why]"
    },
    "L5_blueprint": {
      "recommended_action": "[BUILD|ACQUIRE|PARTNER|REMIX|INVEST|AVOID]",
      "action_rationale": "[specific reasoning for THIS product]",
      "key_risk_if_wrong": "[consequence if recommendation is wrong]"
    }
  },

  "pink": {
    "components": [
      {"name": "[component 1]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[component 2]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[component 3]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[component 4]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]},
      {"name": "[component 5]", "p": [0-10], "i": [0-10], "n": [0-10], "k": [0-10]}
    ]
  },

  "qtac7": [
    {"name": "Q · Product Quality",       "score": [UNIQUE_SCORE 0-10]},
    {"name": "T · Economic Return",        "score": [UNIQUE_SCORE 0-10]},
    {"name": "A · Market Alignment",       "score": [UNIQUE_SCORE 0-10]},
    {"name": "C · Moat Durability",        "score": [UNIQUE_SCORE 0-10]},
    {"name": "D · Compounding Trajectory", "score": [UNIQUE_SCORE 0-10]},
    {"name": "R · Reinvestment Runway",    "score": [UNIQUE_SCORE 0-10]},
    {"name": "V · Error Resilience",       "score": [UNIQUE_SCORE 0-10]}
  ],

  "confidence": [0.0-1.0],
  "evidence_gaps": ["[gap 1]", "[gap 2]", "[gap 3]"],
  "volts_earned": [1-5]
}`
    }];

    // Attach image if provided
    if (file) {
      const buf  = fs.readFileSync(file.filepath);
      const b64  = buf.toString('base64');
      const mime = file.mimetype || 'image/jpeg';
      content.push({ type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } });
    }

    // ── Call OpenRouter — single fetch, no double-read
    const orRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://factorizer.cortexchain.io',
        'X-Title':      'Factorizer — Universal System Comprehension Engine',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.20,
        max_tokens:  3000,
      }),
    });

    // ── Path 3: upstream model failure
    if (!orRes.ok) {
      const detail = await orRes.text().catch(() => 'unknown');
      return res.status(502).json({
        success: false,
        error:   `OpenRouter error ${orRes.status}`,
        detail,
        schema_version: SCHEMA_VERSION,
        prompt_version: PROMPT_VERSION,
        run_meta: { model: MODEL, latency_ms: Date.now() - t0, subject },
      });
    }

    const orData = await orRes.json();
    const raw    = orData.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - t0;

    // ── Path 4: JSON parse failure
    let analysis: any;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return res.status(422).json({
        success: false,
        error: 'Model returned invalid JSON',
        raw: raw.slice(0, 500),
        schema_version: SCHEMA_VERSION,
        prompt_version: PROMPT_VERSION,
        run_meta: { model: MODEL, latency_ms: latencyMs, subject },
      });
    }

    // ── Semantic validation — before scoring or persistence
    const semantic = validateSemantics(analysis);
    if (!semantic.pass) {
      return res.status(422).json({
        success: false,
        error: 'Semantic validation failed',
        semantic_errors: semantic.errors,
        semantic_warnings: semantic.warnings,
        schema_version: SCHEMA_VERSION,
        prompt_version: PROMPT_VERSION,
        run_meta: { model: MODEL, latency_ms: latencyMs, subject },
      });
    }

    // ── Deterministic PINK (server-side, never trust model's computed score)
    if (Array.isArray(analysis.pink?.components) && analysis.pink.components.length > 0) {
      analysis.pink = computePINK(analysis.pink.components);
    }

    // ── Deterministic QTAC₇ + Stone Score
    if (Array.isArray(analysis.qtac7) && analysis.qtac7.length >= 7) {
      analysis.qtac7 = analysis.qtac7.map((f: any, i: number) => {
        const s = Number(f.score) > 10 ? Number(f.score) / 10 : clamp(Number(f.score) || 5);
        return { ...f, score: Math.round(s * 100) / 100, pct: Math.round(s * 10) };
      });
      const stone = analysis.qtac7
        .slice(0, 7)
        .reduce((acc: number, f: any, i: number) => acc + f.score * QTAC_WEIGHTS[i], 0);
      analysis.stone_score = Math.round(stone * 100) / 100;
      const s = analysis.stone_score;
      analysis.stone_band = s >= 8 ? 'STRONG YES' : s >= 6.5 ? 'BUY' : s >= 5 ? 'WATCH' : s >= 3 ? 'PASS' : 'REJECT';
      // PINK penalty: CRITICAL node reduces stone score
      if (analysis.pink?.score > 200) {
        analysis.stone_score = Math.round(Math.max(0, analysis.stone_score - 0.5) * 100) / 100;
      }
    }

    // ── Confidence clamp
    analysis.confidence = Math.min(1, Math.max(0.01, Number(analysis.confidence) || 0.65));

    // ── VOLTs = layers completed
    const layerKeys  = ['L1_anatomy','L2_mechanics','L3_swot','L4_reality_lens','L5_blueprint'];
    analysis.volts_earned = layerKeys.filter(k => analysis.layers?.[k]).length;

    // ── run_meta — all smoke-test required fields present
    const run_meta = {
      schema_version:    SCHEMA_VERSION,
      prompt_version:    PROMPT_VERSION,
      model:             MODEL,
      provider:          'openrouter',
      latency_ms:        latencyMs,
      tokens_in:         orData.usage?.prompt_tokens     || 0,
      tokens_out:        orData.usage?.completion_tokens || 0,
      pink_computed:     true,
      stone_computed:    true,
      semantic_pass:     semantic.pass,
      semantic_warnings: semantic.warnings,
      timestamp:         new Date().toISOString(),
      subject,
    };

    // ── Path 1: success
    return res.status(200).json({
      success: true,
      analysis,
      run_meta,
    });

  } catch (err: any) {
    // ── Path 2: internal error
    return res.status(500).json({
      success: false,
      error:   err.message || 'Internal server error',
      schema_version: SCHEMA_VERSION,
      prompt_version: PROMPT_VERSION,
      run_meta: { model: MODEL, latency_ms: Date.now() - t0, subject },
    });
  }
}
