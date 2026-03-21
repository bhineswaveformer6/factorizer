import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeProductPhoto, analyzeWithRealityLens } from "./ai-analysis";
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

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!allowedTypes.includes(file.mimetype)) {
        res.status(400).json({ error: "Invalid file type. Please upload JPEG, PNG, WebP, or HEIC." });
        return;
      }

      console.log(`[Factorizer] Analyzing ${file.originalname} (${(file.size / 1024).toFixed(1)}KB, ${file.mimetype})`);

      // Convert to base64
      const imageBase64 = file.buffer.toString("base64");

      // Run AI analysis
      const analysis = await analyzeProductPhoto(imageBase64, file.mimetype);

      console.log(`[Factorizer] Analysis complete: ${analysis.product_name} (confidence: ${analysis.confidence})`);

      res.json({
        success: true,
        analysis,
        meta: {
          engine: "factorizer",
          model: "gpt_5_4",
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

      // Run AI analysis
      const analysis = await analyzeWithRealityLens(trimmedQuery);

      console.log(`[Reality Lens] Analysis complete: ${analysis.subject} (verdict: ${analysis.verdict?.recommended})`);

      res.json({
        success: true,
        analysis,
        meta: {
          engine: "reality-lens",
          model: "gpt_5_4",
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
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "operational",
      engines: {
        factorizer: "active",
        reality_lens: "active",
      },
      version: "1.0.0",
      by: "Waveform Tech",
    });
  });

  return httpServer;
}
