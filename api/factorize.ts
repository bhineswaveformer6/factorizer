import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const SYSTEM_PROMPT = `You are Factorizer, an expert AI product intelligence engine. When given a product photo, return a JSON object with: product_name, category, confidence (0-1), components (array with name, type, quantity, unit_cost_usd, supplier, confidence, notes), materials (array with material, percentage, notes), total_bom_usd, manufacturing_costs (1_unit, 100_units, 1000_units, 10000_units), cost_breakdown (materials_pct, labor_pct, tooling_pct, overhead_pct), ip_risk (score 1-10, max_score, level, details, patents_identified, design_around), competitive_landscape (competitors array with name/similarity/strengths/weaknesses, positioning with price/quality/features/design/innovation 0-1), and summary. Be specific. Use real component names, suppliers, and costs.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [_fields, files] = await form.parse(req);
    const file = files.image?.[0];
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    const imageBuffer = fs.readFileSync(file.filepath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [
          { type: 'text', text: 'Analyze this product photo. Return JSON.' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]}
      ],
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, analysis, meta: { engine: 'factorizer', timestamp: new Date().toISOString() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
