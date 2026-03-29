// ═══════════════════════════════════════════════════════════════
// INTELLIGENCE LEDGER — Persistent analysis store
// Every run is saved. Searchable. Comparable. Yours.
// The data moat that turns $29/report → $99/month
// ═══════════════════════════════════════════════════════════════

export interface LedgerEntry {
  id: string;
  type: "reality-lens" | "factorizer";
  subject: string;           // product/company name or "photo:filename"
  query: string;             // raw user input
  analysis: any;             // full analysis object
  scores: {
    volt?: number;
    moat?: number;
    pink_level?: string;
  };
  verdict?: string;          // BUILD | ACQUIRE | PARTNER | REMIX | AVOID
  tags: string[];
  saved_at: string;
  user_id?: string;          // for future auth
  notes?: string;            // user annotation
}

// In-memory ledger — persists for the session
// Replace with SQLite/Postgres for production persistence
const entries: Map<string, LedgerEntry> = new Map();
let counter = 0;

export const ledger = {
  save(entry: Omit<LedgerEntry, "id" | "saved_at">): LedgerEntry {
    const id = `ledger_${Date.now()}_${++counter}`;
    const full: LedgerEntry = {
      ...entry,
      id,
      saved_at: new Date().toISOString(),
    };
    entries.set(id, full);
    console.log(`[Ledger] Saved: ${full.type} — "${full.subject}" (${full.id})`);
    return full;
  },

  get(id: string): LedgerEntry | undefined {
    return entries.get(id);
  },

  list(userId?: string, limit = 50): LedgerEntry[] {
    const all = Array.from(entries.values())
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    if (userId) return all.filter(e => e.user_id === userId).slice(0, limit);
    return all.slice(0, limit);
  },

  search(query: string): LedgerEntry[] {
    const q = query.toLowerCase();
    return Array.from(entries.values()).filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.query.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q)) ||
      (e.verdict || "").toLowerCase().includes(q)
    );
  },

  compare(id1: string, id2: string): any {
    const a = entries.get(id1);
    const b = entries.get(id2);
    if (!a || !b) return null;
    return {
      subjects: [a.subject, b.subject],
      volt_delta: (a.scores.volt || 0) - (b.scores.volt || 0),
      moat_delta: (a.scores.moat || 0) - (b.scores.moat || 0),
      verdicts: [a.verdict, b.verdict],
      a: a.analysis,
      b: b.analysis,
    };
  },

  annotate(id: string, notes: string, tags?: string[]): LedgerEntry | null {
    const entry = entries.get(id);
    if (!entry) return null;
    entry.notes = notes;
    if (tags) entry.tags = [...new Set([...entry.tags, ...tags])];
    return entry;
  },

  count(): number {
    return entries.size;
  },
};

