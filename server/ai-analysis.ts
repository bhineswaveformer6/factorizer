import OpenAI from "openai";

const openai = new OpenAI();

// ═══════════════════════════════════════════════════════════════
// FACTORIZER ENGINE — Photo → Component Analysis + Intelligence
// ═══════════════════════════════════════════════════════════════

const FACTORIZER_SYSTEM_PROMPT = `You are Factorizer, an expert AI product intelligence engine built by Waveform Tech. You analyze product photos and deliver institutional-grade reverse engineering reports.

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
  "summary": "2-3 sentence executive summary of the product intelligence"
}

Be specific and technical. Use real component names, real suppliers, real cost estimates. If you can identify specific ICs or chips from markings, name them. If you can estimate the PCB layer count, mention it. Ground everything in real-world manufacturing knowledge.

If you cannot identify the product clearly, still provide your best analysis with lower confidence scores.`;

export async function analyzeProductPhoto(imageBase64: string, mimeType: string): Promise<any> {
  try {
    const response = await openai.responses.create({
      model: "gpt_5_4",
      instructions: FACTORIZER_SYSTEM_PROMPT,
      input: [
        {
          type: "input_text",
          text: "Analyze this product photo. Identify all visible components, estimate materials, calculate manufacturing costs at scale, assess IP risks, and map the competitive landscape. Return the JSON analysis.",
        },
        {
          type: "input_image",
          image_url: `data:${mimeType};base64,${imageBase64}`,
        },
      ],
    });

    // Extract text from response
    const text = response.output
      .filter((block: any) => block.type === "message")
      .flatMap((block: any) => block.content)
      .filter((c: any) => c.type === "output_text")
      .map((c: any) => c.text)
      .join("");

    // Parse JSON from the response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Factorizer analysis error:", error?.message || error);
    throw new Error(`Analysis failed: ${error?.message || "Unknown error"}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// REALITY LENS — Product/Company Name → 5-Layer Strategic Analysis
// ═══════════════════════════════════════════════════════════════

const REALITY_LENS_SYSTEM_PROMPT = `You are Reality Lens, an expert AI strategic intelligence engine built by Waveform Tech. You perform 5-layer deep strategic factorization of any product, company, or technology.

When given a product/company/technology name, you MUST return a JSON object with this exact structure:

{
  "subject": "Name of the product/company/technology analyzed",
  "type": "Product | Company | Technology | Platform | Service",
  
  "identity": {
    "full_name": "Official name",
    "company": "Parent company",
    "category": "Product category",
    "launch_date": "Estimated launch date or year",
    "price_range": "$X - $Y",
    "positioning": "One-sentence market positioning statement",
    "target_customer": "Primary customer profile description",
    "brand_perception_score": 1 to 10,
    "brand_perception_notes": "Why this score"
  },
  
  "anatomy": {
    "core_technology": ["Tech 1", "Tech 2", "Tech 3"],
    "key_components": [
      {"name": "Component", "purpose": "What it does", "estimated_cost": "$X"}
    ],
    "total_bom_estimate": "$X",
    "key_patents": ["Patent or IP description 1", "Patent 2"],
    "manufacturing_complexity_score": 1 to 10,
    "manufacturing_notes": "Why this score"
  },
  
  "process": {
    "manufacturing_overview": "How it's made — 2-3 sentences",
    "supply_chain": [
      {"stage": "Stage name", "location": "Country/region", "risk": "Low | Medium | High"}
    ],
    "quality_checkpoints": ["QC step 1", "QC step 2"],
    "time_to_market": "Estimated time from concept to shelf",
    "process_notes": "Key process insight"
  },
  
  "economics": {
    "unit_economics": {
      "cogs": "$X",
      "retail_price": "$X",
      "gross_margin_pct": 0 to 100,
      "estimated_annual_revenue": "$X"
    },
    "revenue_model": "How money is made — subscription, one-time, freemium, etc.",
    "tam": "$X (Total Addressable Market)",
    "sam": "$X (Serviceable Addressable Market)",
    "som": "$X (Serviceable Obtainable Market)",
    "competitive_pricing": [
      {"competitor": "Name", "price": "$X", "value_proposition": "Why this price"}
    ]
  },
  
  "ecosystem": {
    "competitors": [
      {
        "name": "Competitor name",
        "market_share_pct": 0 to 100,
        "key_strength": "Their main advantage",
        "key_weakness": "Their main vulnerability"
      }
    ],
    "competitive_dimensions": {
      "price": 0.0 to 1.0,
      "quality": 0.0 to 1.0,
      "features": 0.0 to 1.0,
      "brand": 0.0 to 1.0,
      "innovation": 0.0 to 1.0
    },
    "partnerships": ["Key partnership or integration opportunity"],
    "threats": ["Threat 1 — substitutes, new entrants, regulation, etc."],
    "growth_vectors": ["Growth opportunity 1", "Growth opportunity 2"]
  },
  
  "verdict": {
    "recommended": "BUILD | ACQUIRE | PARTNER | REMIX",
    "confidence": 0.0 to 1.0,
    "rationale": "One sentence explaining the recommendation",
    "alternatives": [
      {"action": "BUILD | ACQUIRE | PARTNER | REMIX", "confidence": 0.0 to 1.0, "rationale": "Why"}
    ]
  },

  "summary": "3-4 sentence executive summary of the full strategic analysis",

  "molecular_map": {
    "offer_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "mechanic_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "money_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}],
    "trust_atoms": [{"atom": "string", "clarity": "clear|vague", "necessity": "necessary|nice-to-have|dead-weight"}]
  },
  "attention_leak": "one sentence - where should market attention be that it isn't?",
  "money_leak": "one sentence - where is value created but not captured?",
  "hidden_wedge": "one sentence - sharpest entry point to win first",
  "son_line": {
    "today": "what this means right now",
    "tomorrow": "near-future decision or application",
    "generalized": "how this scales to market or ecosystem"
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
  "emoji_tags": "string of 4-8 emojis from: ⛲️💎🏰🪴😈📖🔥💯💶💴💸💰",
  "flywheel_next_action": {
    "label": "imperative sentence",
    "route": "/reality-lens or /analyze",
    "flywheel_stage": "awareness|activation|insight|decision|share|return"
  }
}

IMPORTANT: You MUST include ALL fields above — both the 5-layer analysis (identity, anatomy, process, economics, ecosystem, verdict, summary) AND the additional framework fields (molecular_map, attention_leak, money_leak, hidden_wedge, son_line, buffett_lens, differential_moat, emoji_tags, flywheel_next_action). Return the complete JSON object with every field populated.

Be specific, data-driven, and grounded in real market knowledge. Use actual competitor names, real pricing data, real market sizes. If you're estimating, say so. Provide institutional-grade strategic intelligence — the kind a McKinsey analyst would deliver.`;

export async function analyzeWithRealityLens(query: string): Promise<any> {
  try {
    const response = await openai.responses.create({
      model: "gpt_5_4",
      instructions: REALITY_LENS_SYSTEM_PROMPT,
      input: `Perform a complete 5-layer strategic factorization of: "${query}"\n\nAnalyze Identity, Anatomy, Process, Economics, and Ecosystem. Provide a strategic verdict (BUILD/ACQUIRE/PARTNER/REMIX). Return the JSON analysis.`,
    });

    const text = response.output
      .filter((block: any) => block.type === "message")
      .flatMap((block: any) => block.content)
      .filter((c: any) => c.type === "output_text")
      .map((c: any) => c.text)
      .join("");

    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Reality Lens analysis error:", error?.message || error);
    throw new Error(`Analysis failed: ${error?.message || "Unknown error"}`);
  }
}
