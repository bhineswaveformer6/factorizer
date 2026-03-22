/**
 * VOLTS VAULT — Event-Driven Cognitive Capital Minting Service
 * Waveform Tech / Cortex Chain, Inc.
 * 
 * VOLT = Ψ̂ × M_L × C_g × G_h × G_a
 * Where Ψ̂ = ∫(γ·ψ)dτ × QTAC₇/Σ(L_n·W_n) × √(N·I·C)
 * 
 * QTAC₇ = (Quorum × Immersion × Apex × Coherence × Domain Density × Resonance × Verification)^(1/7)
 * 
 * This service handles utility-first VOLTS — earned by doing, not bought speculatively.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type VoltEventType =
  | 'TEARDOWN_COMPLETE'        // Full 5-layer factorization completed
  | 'BLUEPRINT_SHARED'         // User shared a report publicly
  | 'ATTESTATION_SUBMITTED'    // Peer-verified session (HAC gate)
  | 'WIDGET_CLICKTHROUGH'      // Discovery widget viral distribution event
  | 'PHOTO_ANALYSIS_COMPLETE'  // Factorizer Engine photo analysis done
  | 'GENESIS_MINT';            // First-ever action by a user

export type AttestationStatus = 'provisional' | 'attested' | 'rejected';

export interface VoltTransaction {
  id: string;
  userId: string;
  eventType: VoltEventType;
  amount: number;
  timestamp: string;
  attestationStatus: AttestationStatus;
  sessionId?: string;
  metadata?: Record<string, any>;
  qtac7?: QTAC7Score;
}

export interface QTAC7Score {
  quorum: number;        // Q — Critical mass of reasoning (0-1)
  immersion: number;     // I — Depth of sustained engagement (0-1)
  apex: number;          // A — Peak attention state (0-1)
  coherence: number;     // C — Internal consistency (0-1)
  domainDensity: number; // D — Expert synthesis density (0-1)
  resonance: number;     // R — Transmissible to another mind (0-1)
  verification: number;  // V — Data-backed attestation (0-1)
  composite: number;     // Geometric mean — the final score
}

export interface UserVoltBalance {
  userId: string;
  totalMinted: number;
  totalAttested: number;
  totalProvisional: number;
  transactions: VoltTransaction[];
  level: number;
  title: string;
}

// ═══════════════════════════════════════════════════════════════
// REWARD SCHEDULE
// ═══════════════════════════════════════════════════════════════

const VOLT_REWARDS: Record<VoltEventType, { base: number; condition: string }> = {
  TEARDOWN_COMPLETE: {
    base: 5,
    condition: 'All 5 layers returned, user confirms completion',
  },
  BLUEPRINT_SHARED: {
    base: 2,
    condition: 'Generates unique share link, public blueprint created',
  },
  ATTESTATION_SUBMITTED: {
    base: 3,
    condition: 'Peer-verified session — HAC attestation gate passed',
  },
  WIDGET_CLICKTHROUGH: {
    base: 1,
    condition: 'Viral distribution event — someone clicked through discovery widget',
  },
  PHOTO_ANALYSIS_COMPLETE: {
    base: 3,
    condition: 'Full Factorizer Engine analysis from photo upload',
  },
  GENESIS_MINT: {
    base: 10,
    condition: 'First-ever action — unrepeatable genesis event',
  },
};

// ═══════════════════════════════════════════════════════════════
// LEVEL SYSTEM
// ═══════════════════════════════════════════════════════════════

const LEVELS = [
  { min: 0, title: 'Observer', level: 0 },
  { min: 5, title: 'Spark', level: 1 },
  { min: 20, title: 'Apprentice', level: 2 },
  { min: 50, title: 'Scribe', level: 3 },
  { min: 100, title: 'Factorer', level: 4 },
  { min: 250, title: 'Narrator', level: 5 },
  { min: 500, title: 'Collider', level: 6 },
  { min: 1000, title: 'Resonant', level: 7 },
  { min: 2500, title: 'Lattice Keeper', level: 8 },
  { min: 5000, title: 'Crown Bearer', level: 9 },
  { min: 10000, title: 'Sovereign Elect', level: 10 },
  { min: 25000, title: 'Sovereign', level: 11 },
  { min: 50000, title: 'Sovereign Architect', level: 12 },
  { min: 100000, title: 'Founding Architect', level: 13 },
];

function getUserLevel(totalVolts: number): { level: number; title: string } {
  let result = LEVELS[0];
  for (const l of LEVELS) {
    if (totalVolts >= l.min) result = l;
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// QTAC₇ COMPUTATION
// ═══════════════════════════════════════════════════════════════

export function computeQTAC7(scores: Omit<QTAC7Score, 'composite'>): QTAC7Score {
  const { quorum, immersion, apex, coherence, domainDensity, resonance, verification } = scores;
  
  // Geometric mean — one zero kills the score (integrity gate)
  const product = quorum * immersion * apex * coherence * domainDensity * resonance * verification;
  const composite = product > 0 ? Math.pow(product, 1 / 7) : 0;
  
  return { ...scores, composite: Math.round(composite * 1000) / 1000 };
}

// ═══════════════════════════════════════════════════════════════
// VOLTS VAULT — IN-MEMORY STORE (swap for DB in production)
// ═══════════════════════════════════════════════════════════════

class VoltsVault {
  private transactions: VoltTransaction[] = [];
  private genesisUsers: Set<string> = new Set();

  /**
   * Mint VOLTS for a specific event
   */
  mint(
    userId: string,
    eventType: VoltEventType,
    options?: {
      sessionId?: string;
      metadata?: Record<string, any>;
      qtac7?: Omit<QTAC7Score, 'composite'>;
      graftHardness?: number;   // G_h — observed, not self-reported
      aiAmplification?: number; // G_a — human% × amplification factor
    }
  ): VoltTransaction {
    const reward = VOLT_REWARDS[eventType];
    if (!reward) throw new Error(`Unknown event type: ${eventType}`);

    // Genesis check — only once per user
    if (eventType === 'GENESIS_MINT') {
      if (this.genesisUsers.has(userId)) {
        throw new Error('Genesis already minted — unrepeatable event');
      }
      this.genesisUsers.add(userId);
    }

    // Compute QTAC₇ multiplier if provided
    let qtac7: QTAC7Score | undefined;
    let qtacMultiplier = 1;
    if (options?.qtac7) {
      qtac7 = computeQTAC7(options.qtac7);
      qtacMultiplier = qtac7.composite; // 0 to 1 range
    }

    // Apply modifiers
    const graftHardness = options?.graftHardness ?? 1.0;
    const aiAmplification = Math.max(options?.aiAmplification ?? 0.5, 0.1); // Floor of 0.1 for pure AI

    // Final VOLT amount = base × QTAC₇ × G_h × G_a
    const amount = Math.round(reward.base * Math.max(qtacMultiplier, 0.5) * graftHardness * (1 + aiAmplification) * 100) / 100;

    const transaction: VoltTransaction = {
      id: `vt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      eventType,
      amount,
      timestamp: new Date().toISOString(),
      attestationStatus: eventType === 'ATTESTATION_SUBMITTED' ? 'attested' : 'provisional',
      sessionId: options?.sessionId,
      metadata: options?.metadata,
      qtac7,
    };

    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Attest a provisional transaction (HAC gate)
   */
  attest(transactionId: string, attesterId: string): VoltTransaction {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error(`Transaction ${transactionId} not found`);
    if (tx.attestationStatus === 'attested') throw new Error('Already attested');
    if (attesterId === tx.userId) throw new Error('Cannot self-attest');

    tx.attestationStatus = 'attested';
    tx.metadata = { ...tx.metadata, attestedBy: attesterId, attestedAt: new Date().toISOString() };
    return tx;
  }

  /**
   * Get user balance and transaction history
   */
  getBalance(userId: string): UserVoltBalance {
    const userTxs = this.transactions.filter(t => t.userId === userId);
    const totalMinted = userTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalAttested = userTxs.filter(t => t.attestationStatus === 'attested').reduce((sum, t) => sum + t.amount, 0);
    const totalProvisional = userTxs.filter(t => t.attestationStatus === 'provisional').reduce((sum, t) => sum + t.amount, 0);
    const { level, title } = getUserLevel(totalMinted);

    return {
      userId,
      totalMinted: Math.round(totalMinted * 100) / 100,
      totalAttested: Math.round(totalAttested * 100) / 100,
      totalProvisional: Math.round(totalProvisional * 100) / 100,
      transactions: userTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      level,
      title,
    };
  }

  /**
   * Get the global reward schedule
   */
  getRewardSchedule() {
    return Object.entries(VOLT_REWARDS).map(([event, reward]) => ({
      event,
      baseReward: reward.base,
      condition: reward.condition,
    }));
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit = 10): UserVoltBalance[] {
    const userIds = [...new Set(this.transactions.map(t => t.userId))];
    return userIds
      .map(id => this.getBalance(id))
      .sort((a, b) => b.totalMinted - a.totalMinted)
      .slice(0, limit);
  }
}

// Singleton instance
export const voltsVault = new VoltsVault();
