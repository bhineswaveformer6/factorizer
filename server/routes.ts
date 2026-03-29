import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeProductPhoto, analyzeWithRealityLens, runCopilot } from "./ai-analysis";
import { voltsVault, type VoltEventType } from "./services/voltsVault";
import { computePINK } from "./services/pinkScorer";
import { computeVOLT } from "./services/voltScorer";
import { computeMOAT } from "./services/moatScorer";
import { hashInput, getCache, setCache } from "./lib/cache";
import OpenAI from "openai";
import multer from "multer";

// NIM inference via ai-analysis.ts

// In-memory waitlist store
interface WaitlistEntry {
  email: string;
  first_name?: string;
  use_case?: string;
  created_at: string;
  status: string;
}
const waitlist: WaitlistEntry[] = [];

// In-memory signal store
interface Signal {
  id: string;
  text: string;
  email: string;
  page: string;
  priority: "critical" | "strategic" | "iteration";
  intent: string;
  urgency_score: number;
  status: "new" | "reviewed" | "actioned" | "archived";
  created_at: string;
}
const signals: Signal[] = [];
let signalCounter = 0;

const COPILOT_SYSTEM_PROMPT = `You are the Factorizer Copilot — the intelligence layer of CortexChain's first instrument. You speak for the Architect.

WHAT FACTORIZER IS:
Factorizer is a universal system comprehension engine. Point it at any system — software, hardware, infrastructure, AI agent — and it returns three simultaneous outputs: an animated X-ray schematic, a structured intelligence brief, and a PINK failure score. One instrument. Any system. The X-ray you should have had on day one.

SCORING SYSTEM:
- PINK = P × I × √(N × K) — identifies the Critical Node, the single component whose failure kills the system. P=probability, I=impact, N=dependencies, K=knowledge gap.
- VOLT = novelty rating 0–10, measures IP defensibility.
- MOAT = defensibility 0–10, measures switching costs + network effects + IP.

PRICING:
- SPARK: 3 free analyses, no card needed
- SURGE: $20/month, 20 VOLTs per month
- SOVEREIGN: $79/month, 100 VOLTs per month

IDENTITY:
Built by Brandon Hines [Ψ̂-001], Genesis Architect at CortexChain, Inc. / Waveform Tech LLC. 19 patents pending. NVIDIA Inception member.

RULES:
- Every answer ends with a clear next step. Never a dead end.
- If asked about custom builds, surface Quick Connect: "Drop your brief in Signal Box and Brandon reviews within 24 hours."
- Spare, precise, no filler. Every word load-bearing.
- You are a sales agent. Helpful, direct, closing.
- Never say "I'm just an AI" or "I can't help with that."`;

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
          model: "nvidia-nim/nemotron",
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

      // Check cache first
      const cacheKey = hashInput(trimmedQuery);
      const cached = getCache(cacheKey);
      if (cached) {
        console.log(`[Reality Lens] Cache hit for: "${trimmedQuery}"`);
        res.json({
          ...cached,
          meta: { ...cached.meta, cached: true },
        });
        return;
      }

      // Run AI analysis
      const analysis = await analyzeWithRealityLens(trimmedQuery);

      // Run PINK, VOLT, MOAT scorers in parallel
      const [pink, volt, moat] = await Promise.all([
        computePINK(trimmedQuery).catch(e => ({ critical_node: { component: "Unknown", score: 0, reason: e.message, mitigation: "Retry" }, scores: [], system_risk_level: "MODERATE" as const })),
        computeVOLT(trimmedQuery).catch(e => ({ score: 5, factors: { category_novelty: 5, patent_sparsity: 5, differentiation: 5, market_timing: 5, technical_novelty: 5 }, novelty_signal: "Unable to compute" })),
        computeMOAT(trimmedQuery).catch(e => ({ score: 5, primary_type: "Unknown", breakdown: { network_effects: 5, switching_costs: 5, ip: 5, brand: 5, distribution: 5 }, moat_signal: "Unable to compute" })),
      ]);

      console.log(`[Reality Lens] Analysis complete: ${analysis.subject} (verdict: ${analysis.verdict?.recommended})`);

      const fullResult = {
        success: true,
        analysis,
        pink,
        volt,
        moat,
        meta: {
          engine: "reality-lens",
          model: "nvidia-nim/nemotron",
          timestamp: new Date().toISOString(),
          query: trimmedQuery,
        },
      };

      // Cache the result
      setCache(cacheKey, fullResult);

      res.json(fullResult);
    } catch (error: any) {
      console.error("[Reality Lens] Error:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Analysis failed. Please try again.",
      });
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
  // COPILOT — Agentic AI sales assistant
  // ═══════════════════════════════════════════════════════════
  app.post("/api/copilot", async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        res.status(400).json({ error: "Please provide a message." });
        return;
      }

      console.log(`[Copilot] Message: "${message.trim().slice(0, 80)}"`);

      const reply = await runCopilot(message.trim(), COPILOT_SYSTEM_PROMPT);

      res.json({ reply });
    } catch (error: any) {
      console.error("[Copilot] Error:", error.message);
      res.status(500).json({ error: error.message || "Copilot failed. Please try again." });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // SIGNAL BOX — Inbound signal classification
  // ═══════════════════════════════════════════════════════════
  app.post("/api/signal", async (req: Request, res: Response) => {
    try {
      const { text, email, page } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        res.status(400).json({ error: "Signal text is required." });
        return;
      }

      const response = await openai.responses.create({
        model: "nvidia-nim/nemotron",
        instructions: `You are a signal triage engine. Classify inbound messages by priority, intent, and urgency.
Return JSON only:
{"priority":"critical|strategic|iteration","intent":"one sentence describing what they want","urgency_score":1-100}
Rules:
- critical = revenue at risk, churn signal, security issue (urgency 80-100)
- strategic = partnership, enterprise lead, investor (urgency 50-79)
- iteration = feature request, bug report, general feedback (urgency 1-49)`,
        input: `Classify this signal:\nText: ${text.trim()}\nEmail: ${email || "unknown"}\nPage: ${page || "unknown"}\nReturn JSON only.`,
      });

      const responseText = response.output
        .filter((b: any) => b.type === "message")
        .flatMap((b: any) => b.content)
        .filter((c: any) => c.type === "output_text")
        .map((c: any) => c.text)
        .join("");

      let jsonStr = responseText;
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();

      const classification = JSON.parse(jsonStr);

      signalCounter++;
      const signal: Signal = {
        id: `sig_${signalCounter}_${Date.now()}`,
        text: text.trim(),
        email: email || "unknown",
        page: page || "unknown",
        priority: classification.priority || "iteration",
        intent: classification.intent || "Unknown intent",
        urgency_score: classification.urgency_score || 25,
        status: "new",
        created_at: new Date().toISOString(),
      };

      signals.push(signal);
      console.log(`[Signal Box] New signal: ${signal.id} (${signal.priority}, urgency: ${signal.urgency_score})`);

      res.json({ success: true, signal });
    } catch (error: any) {
      console.error("[Signal Box] Error:", error.message);
      res.status(500).json({ success: false, error: error.message || "Signal classification failed." });
    }
  });

  app.get("/api/signals", async (_req: Request, res: Response) => {
    const sorted = [...signals].sort((a, b) => b.urgency_score - a.urgency_score);
    res.json({ success: true, signals: sorted });
  });

  app.patch("/api/signals/:id/status", async (req: Request, res: Response) => {
    const { status } = req.body;
    const validStatuses = ["new", "reviewed", "actioned", "archived"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Valid status required: new, reviewed, actioned, archived" });
      return;
    }
    const signal = signals.find(s => s.id === req.params.id);
    if (!signal) {
      res.status(404).json({ error: "Signal not found" });
      return;
    }
    signal.status = status;
    res.json({ success: true, signal });
  });

  // ═══════════════════════════════════════════════════════════
  // WAITLIST CRM
  // ═══════════════════════════════════════════════════════════
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const { email, first_name, use_case } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({ error: "A valid email is required." });
        return;
      }

      const entry: WaitlistEntry = {
        email: email.trim(),
        first_name: first_name?.trim() || undefined,
        use_case: use_case || undefined,
        created_at: new Date().toISOString(),
        status: "new",
      };

      waitlist.push(entry);
      const position = waitlist.length;

      console.log(`[Waitlist] New entry #${position}: ${entry.email}`);
      res.json({ success: true, position });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/waitlist/count", async (_req: Request, res: Response) => {
    res.json({ count: waitlist.length });
  });

  app.get("/api/waitlist/list", async (_req: Request, res: Response) => {
    res.json({ success: true, entries: waitlist });
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
      },
      version: "1.1.0",
      by: "Waveform Tech",
    });
  });

  return httpServer;
}
