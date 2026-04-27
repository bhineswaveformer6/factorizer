# Factorizer — AI Product Intelligence Engine

> *Upload a photo. Get the blueprint.*

[![Status](https://img.shields.io/badge/Status-Active-34d399)](https://factorizer.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-OpenRouter%20%2B%20Qwen3--VL--32B-6366f1)](https://openrouter.ai)
[![CortexChain](https://img.shields.io/badge/CortexChain-ARCHON%20Ψ-f5c842)](https://github.com/bhineswaveformer6/archon-psi-canon)

---

## What It Does

Factorizer turns any product image into a structured intelligence report:

- **Visual decomposition** — identifies components, materials, form factor
- **Market scoring** — QTAC₇ composite + Stone Score via ARCHON Ψ
- **Blueprint extraction** — structured BOM, build steps, comparable products
- **VOLT minting** — verified analyses mint cognitive capital units to the Canon Ledger
- **Provenance** — every run is hashed, scored, and sealed

---

## Tech Stack

| Layer | Tool |
|---|---|
| Vision model | Qwen3-VL-32B-Instruct via OpenRouter |
| Scoring | ARCHON Ψ — QTAC₇ + Stone Score |
| Storage | Durable schema (9 tables) — analysis_runs, score_snapshots, ledger_entries, volt_transactions |
| Frontend | React + Vite + Tailwind |
| Backend | Node/Express with Drizzle ORM |

**Model policy:** OpenRouter + Qwen3-VL-32B only. No OpenAI.

---

## Schema (Durable — CB-361)

```
analysis_runs       → every scoring run, immutable
score_snapshots     → Stone + QTAC² per run
ledger_entries      → append-only Canon seal records
volt_transactions   → VOLT issuance with attestation state
volt_balances       → running balance per operator
analysis_cache      → dedup layer for identical inputs
waitlist_entries    → access queue
lifecycle_events    → state machine transitions
score_models        → model version registry
```

---

## Relationship to ARCHON Ψ

Factorizer is the **runtime scoring engine** for product intelligence.  
`archon-psi-canon` is the **canonical specification** and governance layer.  
Every Factorizer run that seals to Canon creates a ledger entry governed by CB-364.

---

## Live

- App: https://factorizer.vercel.app
- Canon spec: https://github.com/bhineswaveformer6/archon-psi-canon

---

`Waveform Tech LLC · CortexChain, Inc. · Ψ-001 · 2026`
