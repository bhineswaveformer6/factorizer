import OpenAI from "openai";

// ═══════════════════════════════════════════════════════════════
// NVIDIA NIM — Primary inference stack
// Fallback chain: nemotron-49b → mistral-nemotron → llama-3.3-70b
// ═══════════════════════════════════════════════════════════════

const nim = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

// Vision model for photo analysis
const NIM_VISION_MODEL = "nvidia/phi-3.5-vision-instruct";
// Text model for strategic analysis
const NIM_TEXT_MODEL = "nvidia/nemotron-super-49b-v1.5";
// Fallback text model
const NIM_FALLBACK_MODEL = "mistralai/mistral-nemotron";

async function callNIM(
  model: string,
  systemPrompt: string,
  userContent: any[],
  jsonMode = true
): Promise<string> {
  try {
    const response = await nim.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      temperature: 0.1,
      max_tokens: 4096,
    });
    return response.choices[0]?.message?.content || "{}";
  } catch (err: any) {
    // Fallback cascade
    if (model === NIM_TEXT_MODEL) {
      console.warn(`[NIM] ${model} failed, trying fallback: ${NIM_FALLBACK_MODEL}`);
      return callNIM(NIM_FALLBACK_MODEL, systemPrompt, userContent, jsonMode);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORIZER ENGINE — Photo → Component Analysis + Intelligence
// ═══════════════════════════════════════════════════════════════

const FACTORIZER_SYSTEM_PROMPT = `You are Factorizer, an expert AI product intelligence engine built by CortexChain / Waveform Tech. You analyze product photos and deliver institutional-grade reverse engineering reports.

When given a product photo, you MUST return a JSON object with this exact structure:

{
  "product_name": "Name of the product identified",
  "category": "Consumer Electronics | Mechanical Device | Medical Device | Industrial Equipment | Wearable | IoT | Other",
  "confidence": 0.0 to 1.0,
  "components": [
    {
      "name": "Component name (e.g., nRF52840 SoC)",
      "type": "MCU | Sensor | Power | Connector | IC | Passive | Mechanical | Display | Antenna | Memory | Other",
      "quantity": 1,
      "unit_cost_usd": 3.50,
      "supplier": "Nordic Semiconductor | Texas Instruments | STMicroelectronics | Murata | etc.",
      "confidence": 0.0 to 1.0,
      "notes": "Brief technical note about this component"
    }
  ],
  "materials": [
    {
      "material": "ABS Plastic | Aluminum | FR-4 PCB | Silicone | Glass | Steel | Copper | Carbon Fiber | etc.",
      "percentage": 40,
      "notes": "Where this material appears"
    }
  ],
  "total_bom_usd": 47.82,
  "manufacturing_costs": {
    "1_unit": 189.00,
    "100_units": 94.00,
    "1000_units": 67.00,
    "10000_units": 52.00
  },
  "cost_breakdown": {
    "materials_pct": 45,
    "labor_pct": 25,
    "tooling_pct": 15,
    "overhead_pct": 15
  },
  "visual_schema": {
    "layout_description": "2-3 sentence description of physical layout and form factor",
    "annotated_zones": [
      {"zone": "Top-left PCB quadrant", "contents": "Power management ICs, input filtering", "visual_note": "Brown capacitor cluster near USB port"},
      {"zone": "Center PCB", "contents": "Main SoC or processor", "visual_note": "Largest chip on board"},
      {"zone": "Antenna region", "contents": "RF components, antenna trace", "visual_note": "Clear area at board edge"}
    ],
    "design_philosophy": "cost-optimized | performance-first | modular | vertically-integrated | repairability-focused",
    "complexity_verdict": "simple | moderate | complex | highly-complex"
  },
  "ip_risk": {
    "score": 3,
    "max_score": 10,
    "level": "Low | Medium | High | Critical",
    "details": "Brief IP risk assessment",
    "patents_identified": ["US Patent descriptions if any"],
    "design_around": ["Suggestions for design-around if applicable"]
  },
  "competitive_landscape": {
    "competitors": [
      {
        "name": "Competitor name",
        "similarity": 0.0 to 1.0,
        "strengths": ["str1", "str2"],
        "weaknesses": ["weak1", "weak2"]
      }
    ],
    "positioning": {
      "price": 0.0 to 1.0,
      "quality": 0.0 to 1.0,
      "features": 0.0 to 1.0,
      "design": 0.0 to 1.0,
      "innovation": 0.0 to 1.0
    }
  },
  "pm_verdict": {
    "cost_vs_competitors": "significantly cheaper | cheaper | comparable | more expensive | significantly more expensive",
    "design_philosophy": "one sentence",
    "what_to_copy": "the single most valuable thing to replicate",
    "what_to_avoid": "the single biggest design trap",
    "recommended_action": "BUILD | ACQUIRE | PARTNER | REMIX | AVOID",
    "action_rationale": "one sentence — why this action"
  },
  "summary": "2-3 sentence executive summary of the product intelligence"
}

Be specific and technical. Use real component names, real suppliers, real cost estimates. Ground everything in real-world manufacturing knowledge. Include the visual_schema and pm_verdict fields — these are required.`;

export async function analyzeProductPhoto(imageBase64: string, mimeType: string): Promise<any> {
  try {
    const text = await callNIM(
      NIM_VISION_MODEL,
      FACTORIZER_SYSTEM_PROMPT,
      [
        { type: "text", text: "Analyze this product photo. Identify all visible components, estimate materials, calculate manufacturing costs at scale, assess IP risks, and map the competitive landscape. Include visual_schema and pm_verdict. Return complete JSON." },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" } },
      ],
      true
    );

    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Factorizer analysis error:", error?.message || error);
    throw new Error(`Analysis failed: ${error?.message || "Unknown error"}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// REALITY LENS — Product/Company Name → 5-Layer Strategic Analysis
// ═══════════════════════════════════════════════════════════════

const REALITY_LENS_SYSTEM_PROMPT = `You are Reality Lens, an expert AI strategic intelligence engine built by CortexChain / Waveform Tech. You perform 5-layer deep strategic factorization of any product, company, or technology. You are powered by NVIDIA NIM.

When given a product/company/technology name, you MUST return a JSON object with this exact structure — all fields required:

{
  "subject": "Name analyzed",
  "type": "Product | Company | Technology | Platform | Service",
  "identity": {
    "full_name": "Official name",
    "company": "Parent company",
    "category": "Product category",
    "launch_date": "Year or date",
    "price_range": "$X - $Y",
    "positioning": "One-sentence market positioning",
    "target_customer": "Primary customer profile",
    "brand_perception_score": 1-10,
    "brand_perception_notes": "Why this score"
  },
  "anatomy": {
    "core_technology": ["Tech 1", "Tech 2"],
    "key_components": [{"name": "Component", "purpose": "What it does", "estimated_cost": "$X"}],
    "total_bom_estimate": "$X",
    "key_patents": ["Patent description"],
    "manufacturing_complexity_score": 1-10,
    "manufacturing_notes": "Why this score"
  },
  "process": {
    "manufacturing_overview": "How it is made — 2-3 sentences",
    "supply_chain": [{"stage": "Stage", "location": "Country", "risk": "Low | Medium | High"}],
    "quality_checkpoints": ["QC step"],
    "time_to_market": "Estimated time",
    "process_notes": "Key insight"
  },
  "economics": {
    "unit_economics": {"cogs": "$X", "retail_price": "$X", "gross_margin_pct": 0-100, "estimated_annual_revenue": "$X"},
    "revenue_model": "How money is made",
    "tam": "$X",
    "sam": "$X",
    "som": "$X",
    "competitive_pricing": [{"competitor": "Name", "price": "$X", "value_proposition": "Why"}]
  },
  "ecosystem": {
    "competitors": [{"name": "Name", "market_share_pct": 0-100, "key_strength": "Advantage", "key_weakness": "Vulnerability"}],
    "competitive_dimensions": {"price": 0-1, "quality": 0-1, "features": 0-1, "brand": 0-1, "innovation": 0-1},
    "partnerships": ["Key partnership"],
    "threats": ["Threat"],
    "growth_vectors": ["Opportunity"]
  },
  "verdict": {
    "recommended": "BUILD | ACQUIRE | PARTNER | REMIX",
    "confidence": 0-1,
    "rationale": "One sentence",
    "alternatives": [{"action": "BUILD | ACQUIRE | PARTNER | REMIX", "confidence": 0-1, "rationale": "Why"}]
  },
  "summary": "3-4 sentence executive summary",
  "visual_schema": {
    "product_map": "Text description of how this product/system is structured visually",
    "key_nodes": [{"node": "Component or subsystem name", "role": "What it does", "dependency": "What depends on it"}],
    "architecture_type": "modular | monolithic | platform | network | pipeline | hub-and-spoke"
  },
  "pm_advantage": {
    "question_answered": "The single most important question this analysis answers for a PM",
    "competitive_edge": "What a PM now knows that competitors don't",
    "decision_brief": "One paragraph — what to do and why, written for a VP of Product",
    "what_to_benchmark": ["Specific metric 1 to track vs competitors", "Specific metric 2"],
    "risk_to_watch": "The single highest-priority risk for a PM to monitor"
  },
  "molecular_map": {
    "offer_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "mechanic_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "money_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "trust_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}]
  },
  "attention_leak": "one sentence",
  "money_leak": "one sentence",
  "hidden_wedge": "one sentence",
  "son_line": {
    "today": "what this means right now",
    "tomorrow": "near-future decision",
    "generalized": "how this scales to market"
  },
  "buffett_lens": {
    "circle_of_competence": "inside|adjacent|outside",
    "capital_intensity": "asset-light|moderate|asset-heavy",
    "float_like_dynamics": "none|weak|strong",
    "permanent_loss_risk": "one sentence"
  },
  "differential_moat": {
    "cost_curve": {"answer": "YES|NO", "reason": "one sentence"},
    "network_effects": {"answer": "YES|NO|WEAK", "reason": "one sentence"},
    "business_model_flip": {"answer": "YES|NO", "reason": "one sentence"},
    "off_grid_edge": {"answer": "YES|NO", "reason": "one sentence"},
    "today_advantage": "one sentence",
    "if_scaled_becomes": "one sentence",
    "incumbent_pain_if_copy": "one sentence"
  },
  "emoji_tags": "4-8 relevant emojis",
  "flywheel_next_action": {
    "label": "imperative sentence",
    "route": "/reality-lens or /analyze",
    "flywheel_stage": "awareness|activation|insight|decision|share|return"
  }
}

Be specific, data-driven, institutional-grade. Include ALL fields — visual_schema and pm_advantage are required. This is the intelligence layer between product observation and manufacturing decision-making.`;

export async function analyzeWithRealityLens(query: string): Promise<any> {
  try {
    const text = await callNIM(
      NIM_TEXT_MODEL,
      REALITY_LENS_SYSTEM_PROMPT,
      [{ type: "text", text: `Perform complete 5-layer strategic factorization of: "${query}". Include all fields including visual_schema and pm_advantage. Return complete JSON.` }],
      true
    );

    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Reality Lens analysis error:", error?.message || error);
    throw new Error(`Analysis failed: ${error?.message || "Unknown error"}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// COPILOT — Agentic sales + intelligence assistant
// ═══════════════════════════════════════════════════════════════

export async function runCopilot(message: string, systemPrompt: string): Promise<string> {
  try {
    const text = await callNIM(
      NIM_FALLBACK_MODEL,
      systemPrompt,
      [{ type: "text", text: message }],
      false
    );
    return text;
  } catch (error: any) {
    throw new Error(`Copilot failed: ${error?.message}`);
  }
}
