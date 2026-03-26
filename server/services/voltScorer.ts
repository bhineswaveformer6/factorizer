import OpenAI from "openai";
const openai = new OpenAI();

export interface VOLTResult {
  score: number; // 0-10
  factors: {
    category_novelty: number;
    patent_sparsity: number;
    differentiation: number;
    market_timing: number;
    technical_novelty: number;
  };
  novelty_signal: string;
}

export async function computeVOLT(productDescription: string): Promise<VOLTResult> {
  const response = await openai.responses.create({
    model: "gpt_5_4",
    instructions: `You are a novelty scoring engine. Score a product/system on 5 dimensions (0-10 each):
category_novelty (inverted maturity: new category=10, commoditized=1)
patent_sparsity (inverted density: uncrowded IP=10, patent thicket=1)
differentiation (unique mechanisms, novel combinations)
market_timing (right time? early mover advantage?)
technical_novelty (new tech stack, novel architecture?)
Return JSON only: {"factors":{"category_novelty":7,"patent_sparsity":6,"differentiation":8,"market_timing":9,"technical_novelty":7},"novelty_signal":"one sentence explaining the novelty thesis"}
Final score = weighted average: differentiation 30%, technical_novelty 25%, category_novelty 20%, patent_sparsity 15%, market_timing 10%.`,
    input: `Score novelty for: ${productDescription}. Return JSON only.`,
  });

  const text = response.output.filter((b: any) => b.type === "message").flatMap((b: any) => b.content).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("");
  let jsonStr = text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();

  const parsed = JSON.parse(jsonStr);
  const f = parsed.factors;
  const score = Math.round((f.differentiation * 0.3 + f.technical_novelty * 0.25 + f.category_novelty * 0.2 + f.patent_sparsity * 0.15 + f.market_timing * 0.1) * 10) / 10;

  return { score, factors: f, novelty_signal: parsed.novelty_signal };
}
