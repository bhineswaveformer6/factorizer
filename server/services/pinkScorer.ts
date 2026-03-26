// PINK = P × I × √(N × K)
// P = failure probability (0-1 scale, multiply by 10 for display)
// I = impact severity (0-10)
// N = number of dependencies
// K = knowledge gap (0-10)

import OpenAI from "openai";

const openai = new OpenAI();

export interface PINKResult {
  critical_node: { component: string; score: number; reason: string; mitigation: string };
  scores: Array<{ component: string; P: number; I: number; N: number; K: number; score: number }>;
  system_risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export async function computePINK(productDescription: string): Promise<PINKResult> {
  const response = await openai.responses.create({
    model: "gpt_5_4",
    instructions: `You are a failure analysis engine. Given a product/system description, identify 5-8 key components and score each on:
P (failure probability 0-1), I (impact 0-10), N (dependency count 1-20), K (knowledge gap 0-10).
Compute PINK = P*10 * I * sqrt(N * K) for each. Return JSON only:
{"components": [{"component":"name","P":0.5,"I":8,"N":5,"K":6,"score":123.4,"reason":"why critical","mitigation":"how to fix"}], "system_risk_level":"HIGH"}
Sort by score descending. system_risk_level: <50 avg=LOW, 50-150=MODERATE, 150-300=HIGH, >300=CRITICAL.`,
    input: `Analyze failure modes for: ${productDescription}. Return JSON only.`,
  });

  const text = response.output.filter((b: any) => b.type === "message").flatMap((b: any) => b.content).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("");
  let jsonStr = text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();
  
  const parsed = JSON.parse(jsonStr);
  const scores = parsed.components.map((c: any) => ({
    component: c.component,
    P: c.P,
    I: c.I,
    N: c.N,
    K: c.K,
    score: Math.round(c.P * 10 * c.I * Math.sqrt(c.N * c.K) * 10) / 10,
  })).sort((a: any, b: any) => b.score - a.score);

  const critical = scores[0];
  const criticalData = parsed.components.find((c: any) => c.component === critical.component);

  return {
    critical_node: {
      component: critical.component,
      score: critical.score,
      reason: criticalData?.reason || "Highest combined failure risk",
      mitigation: criticalData?.mitigation || "Requires monitoring",
    },
    scores,
    system_risk_level: parsed.system_risk_level || "MODERATE",
  };
}
