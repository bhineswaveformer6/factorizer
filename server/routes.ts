import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeProductPhoto, analyzeWithRealityLens } from "./ai-analysis";
import { voltsVault, type VoltEventType } from "./services/voltsVault";
import multer from "multer";

// Configure multer for in-memory file upload (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ═══════════════════════════════════════════════════════════
  // FACTORIZER ENGINE — Upload photo → AI analysis
  // ═══════════════════════════════════════════════════════════
  app.post("/api/factorize", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No image uploaded. Please upload a product photo." });
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!allowedTypes.includes(file.mimetype)) {
        res.status(400).json({ error: "Invalid file type. Please upload JPEG, PNG, WebP, or HEIC." });
        return;
      }

      console.log(`[Factorizer] Analyzing ${file.originalname} (${(file.size / 1024).toFixed(1)}KB, ${file.mimetype})`);

      const imageBase64 = file.buffer.toString("base64");
      const analysis = await analyzeProductPhoto(imageBase64, file.mimetype);

      console.log(`[Factorizer] Analysis complete: ${analysis.product_name} (confidence: ${analysis.confidence})`);

      res.json({
        success: true,
        analysis,
        meta: {
          engine: "factorizer",
          model: "gpt-4o",
          timestamp: new Date().toISOString(),
          image_size_kb: Math.round(file.size / 1024),
        },
      });
    } catch (error: any) {
      console.error("[Factorizer] Error:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Analysis failed. Please try again.",
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // REALITY LENS — Text query → 5-layer strategic analysis
  // ═══════════════════════════════════════════════════════════
  app.post("/api/reality-lens", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({ error: "Please provide a product, company, or technology to analyze." });
        return;
      }

      const trimmedQuery = query.trim();
      console.log(`[Reality Lens] Analyzing: "${trimmedQuery}"`);

      const analysis = await analyzeWithRealityLens(trimmedQuery);

      console.log(`[Reality Lens] Analysis complete: ${analysis.subject} (verdict: ${analysis.verdict?.recommended})`);

      res.json({
        success: true,
        analysis,
        meta: {
          engine: "reality-lens",
          model: "gpt-4o",
          timestamp: new Date().toISOString(),
          query: trimmedQuery,
        },
      });
    } catch (error: any) {
      console.error("[Reality Lens] Error:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Analysis failed. Please try again.",
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // PERPLEXITY SONAR — Live market intelligence enrichment
  // ═══════════════════════════════════════════════════════════
  app.post("/api/perplexity/enrich", async (req: Request, res: Response) => {
    try {
      const { query, context } = req.body;
      if (!query) {
        res.status(400).json({ error: "query is required" });
        return;
      }

      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        res.status(503).json({ error: "Perplexity not configured" });
        return;
      }

      const prompt = context
        ? `You are a market intelligence analyst. Given the following product analysis context:\n\n${JSON.stringify(context, null, 2)}\n\nAnswer this query with current market data, recent news, and real pricing: ${query}`
        : `You are a market intelligence analyst. Provide current market data, recent news, competitor pricing, and supply chain intel for: ${query}`;

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: "You are a precise market intelligence engine. Always cite sources. Be concise and data-dense." },
            { role: "user", content: prompt },
          ],
          max_tokens: 1024,
          return_citations: true,
          search_recency_filter: "month",
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content || "";
      const citations = data.citations || [];

      console.log(`[Perplexity] Enriched: "${query}" — ${citations.length} citations`);

      res.json({
        success: true,
        content,
        citations,
        model: "sonar-pro",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Perplexity] Error:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // VOLTS VAULT — Event-driven VOLT minting
  // ═══════════════════════════════════════════════════════════
  app.post("/api/volts/mint", async (req: Request, res: Response) => {
    try {
      const { userId, eventType, sessionId, metadata, qtac7, graftHardness, aiAmplification } = req.body;
      if (!userId || !eventType) {
        res.status(400).json({ error: "userId and eventType are required" });
        return;
      }

      const transaction = voltsVault.mint(userId, eventType as VoltEventType, {
        sessionId,
        metadata,
        qtac7,
        graftHardness,
        aiAmplification,
      });

      console.log(`[VOLTS] Minted ${transaction.amount}V for ${userId} (${eventType})`);
      res.json({ success: true, transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get("/api/volts/balance/:userId", async (req: Request, res: Response) => {
    try {
      const balance = voltsVault.getBalance(req.params.userId);
      res.json({ success: true, balance });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/volts/attest", async (req: Request, res: Response) => {
    try {
      const { transactionId, attesterId } = req.body;
      const transaction = voltsVault.attest(transactionId, attesterId);
      res.json({ success: true, transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get("/api/volts/leaderboard", async (_req: Request, res: Response) => {
    const leaderboard = voltsVault.getLeaderboard();
    res.json({ success: true, leaderboard });
  });

  app.get("/api/volts/rewards", async (_req: Request, res: Response) => {
    const schedule = voltsVault.getRewardSchedule();
    res.json({ success: true, schedule });
  });

  // ═══════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "operational",
      engines: {
        factorizer: "active",
        reality_lens: "active",
        volts_vault: "active",
        perplexity_sonar: process.env.PERPLEXITY_API_KEY ? "active" : "not_configured",
      },
      version: "1.2.0",
      by: "Waveform Tech",
    });
  });

  return httpServer;
}
