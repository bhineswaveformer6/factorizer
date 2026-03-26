import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const SYSTEM_PROMPT = `You are Factorizer, an expert AI product intelligence engine built by Waveform Tech. Analyze any product — from a photo, URL, or text description — and return an institutional-grade reverse engineering report.

Return a JSON object with: product_name, category, confidence (0-1), components (array with name, type, quantity, unit_cost_usd, supplier, confidence, notes), materials (array with material, percentage, notes), total_bom_usd, manufacturing_costs (1_unit, 100_units, 1000_units, 10000_units), cost_breakdown (materials_pct, labor_pct, tooling_pct, overhead_pct), ip_risk (score 1-10, max_score, level, details, patents_identified, design_around), competitive_landscape (competitors array with name/similarity/strengths/weaknesses, positioning with price/quality/features/design/innovation 0-1), and summary. Be specific. Use real component names, suppliers, and costs.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const contentType = req.headers['content-type'] || '';

    // ── MODE 1: Image upload (multipart/form-data) ──────────
    if (contentType.includes('multipart/form-data')) {
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [fields, files] = await form.parse(req);
      const file = files.image?.[0];
      if (!file) return res.status(400).json({ error: 'No image uploaded' });

      const imageBuffer = fs.readFileSync(file.filepath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: [
            { type: 'text', text: 'Analyze this product photo. Return JSON.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } }
          ]}
        ],
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return res.json({ success: true, analysis, input_mode: 'image', meta: { engine: 'factorizer', timestamp: new Date().toISOString() } });
    }

    // ── JSON body modes ──────────────────────────────────────
    const buffers: Buffer[] = [];
    for await (const chunk of req) buffers.push(Buffer.from(chunk));
    const body = JSON.parse(Buffer.concat(buffers).toString());

    // ── MODE 2: URL input ────────────────────────────────────
    if (body.url) {
      let urlContent = '';
      try {
        const pageRes = await fetch(body.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Factorizer/1.0)' }
        });
        const html = await pageRes.text();
        // Strip HTML tags, get text content
        urlContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 8000);
      } catch (e) {
        return res.status(400).json({ error: 'Could not fetch URL. Try pasting the product description instead.' });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this product from the webpage content below. Return JSON.\n\nURL: ${body.url}\n\nPage content:\n${urlContent}` }
        ],
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return res.json({ success: true, analysis, input_mode: 'url', meta: { engine: 'factorizer', timestamp: new Date().toISOString(), source_url: body.url } });
    }

    // ── MODE 3: Text/description input ──────────────────────
    if (body.text || body.description) {
      const text = body.text || body.description;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this product description. Return JSON.\n\n${text}` }
        ],
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return res.json({ success: true, analysis, input_mode: 'text', meta: { engine: 'factorizer', timestamp: new Date().toISOString() } });
    }

    return res.status(400).json({ error: 'Provide an image (multipart), url, or text in the request body.' });

  } catch (err: any) {
    console.error('Factorizer error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
