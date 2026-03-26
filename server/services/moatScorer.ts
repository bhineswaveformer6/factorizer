import OpenAI from "openai";
const openai = new OpenAI();

export interface MOATResult {
  score: number; // 0-10
  primary_type: string;
  breakdown: {
    network_effects: number;
    switching_costs: number;
    ip: number;
    brand: number;
    distribution: number;
  };
  moat_signal: string;
}

export async function computeMOAT(productDescription: string): Promise<MOATResult> {
  const response = await openai.responses.create({
    model: "gpt_5_4",
    instructions: `You are a moat analysis engine. Score defensibility on 5 dimensions (0-10 each):
network_effects (does it get better with more users?)
switching_costs (how painful to leave?)
ip (patents, trade secrets, proprietary data?)
brand (recognition, trust, premium pricing power?)
distribution (channels, partnerships, platform lock-in?)
Return JSON only: {"breakdown":{"network_effects":3,"switching_costs":7,"ip":8,"brand":6,"distribution":5},"primary_type":"IP","moat_signal":"one sentence moat thesis"}
primary_type = the dimension with highest score.`,
    input: `Score defensibility moat for: ${productDescription}. Return JSON only.`,
  });

  const text = response.output.filter((b: any) => b.type === "message").flatMap((b: any) => b.content).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("");
  let jsonStr = text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();

  const parsed = JSON.parse(jsonStr);
  const b = parsed.breakdown;
  const score = Math.round((b.network_effects * 0.25 + b.switching_costs * 0.25 + b.ip * 0.20 + b.brand * 0.15 + b.distribution * 0.15) * 10) / 10;

  return { score, primary_type: parsed.primary_type, breakdown: b, moat_signal: parsed.moat_signal };
}
