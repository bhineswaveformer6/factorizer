# FACTORIZER BLUEPRINT — TECHNICAL DOCUMENTATION
## ARCHON Ψ Cognitive Scoring Engine
## v1.0 · July 25, 2026 · Waveform Tech LLC

---

## 1. OVERVIEW

The Factorizer is an automated cognitive artifact scoring pipeline that takes any input (text, document, image, session data) and produces a structured quality report with cryptographic provenance. It is the commercial deployment of the research instrument validated under NSF SBIR Phase I.

**Commercial product:** $49/month per operator, self-serve, upload → score → report in < 30 seconds.
**Research instrument:** Validated under NSF Phase I as the "automated assessment pipeline" with "five-dimensional quality rubric" and "content-addressed audit log."

---

## 2. THE SCORING RUBRIC

### 2.1 Five Dimensions (NSF-Safe Language)

| Dimension | Code | Weight | What It Measures | NSF Name |
|-----------|------|--------|------------------|----------|
| Clarity | C | 0.20 | Does the artifact state its claim unambiguously? | "Claim Clarity" |
| Novelty | N | 0.20 | Does the artifact advance vs. repeat existing work? | "Conceptual Advancement" |
| Transfer | T | 0.20 | Can the claim apply outside its original context? | "Cross-Context Applicability" |
| Falsifiability | F | 0.20 | Does the artifact state what would disconfirm it? | "Disconfirmability" |
| Evidence-Ready | E | 0.20 | Is there at least one physical artifact backing this claim? | "Evidence Availability" |

### 2.2 Scoring Scale

Each dimension scored 0–10. Composite score = weighted sum (0–10).

| Band | Score | Verdict |
|------|-------|---------|
| STRONG | 9.0–10.0 | Seal candidate — submit for expert review |
| SOLID | 7.5–8.9 | Bank — high-confidence, proceed with action |
| WATCH | 6.0–7.4 | Monitor — needs more evidence or refinement |
| WEAK | 4.0–5.9 | Revise — rework needed before acting |
| REJECT | 0–3.9 | Discard — noise, no cognitive value |

### 2.3 Provenance Hash

Every report is sealed with a SHA-256 hash chain:
- Input artifact is canonicalized using RFC 8785 JSON Canonicalization Scheme
- Hash includes: artifact hash + timestamp + scorer version + dimension scores
- Previous report hash links to current (append-only chain)
- Tamper detection: any modification to a past report breaks the chain

---

## 3. THE PIPELINE

```
STAGE 1 — INGEST
  Input: text, document URL, image, or session data
  Process: extract text content, normalize format
  Output: canonicalized artifact string
  Gate: non-empty content required

STAGE 2 — SCORE
  Input: canonicalized artifact
  Process: apply 5-dimension rubric
  Output: dimension scores (0-10 each) + composite score + verdict band
  Gate: composite ≥ 5.0 to produce report (below = noise, archive only)

STAGE 3 — REPORT
  Input: dimension scores + artifact metadata
  Process: generate structured report with sections, summary, recommendations
  Output: BlueprintReport record (entity in app database)
  Includes: quality_score, sections, tags, provenance hash

STAGE 4 — SEAL
  Input: report record
  Process: compute SHA-256 hash, append to provenance chain
  Output: sealed report with immutable audit trail
  Gate: hash must verify (100% reproducibility target)
```

---

## 4. DATA MODEL

### 4.1 BlueprintReport Entity (App Database)

| Field | Type | Description |
|-------|------|-------------|
| title | string | One-line distillation of the artifact |
| subject | string | What was scored (person, idea, document) |
| subject_type | string | "startup" \| "idea" \| "document" \| "session" \| "claim" |
| category | string | Domain classification |
| summary | string | 2-3 sentence executive summary |
| sections | object | Per-dimension breakdown with scores + evidence |
| source_doc_ids | array | References to source documents |
| generated_by | string | "factorizer-v1" |
| quality_score | number | Composite 0-10 |
| tags | array | Classification tags |
| published | boolean | Whether report is publicly viewable |
| price_volts | number | VOLT cost to access (0 for free, 1 for Factorizer tier) |
| status | string | "draft" \| "scored" \| "sealed" \| "published" |

### 4.2 Provenance Record

Each report also creates a provenance entry:
- `artifact_hash`: SHA-256 of canonicalized input
- `report_hash`: SHA-256 of the full report JSON
- `prev_hash`: Previous report in chain
- `timestamp`: ISO 8601
- `scorer_version`: "factorizer-v1.0"
- `dimensions`: { C, N, T, F, E } with individual scores

---

## 5. BACKEND API

### 5.1 Endpoint

```
POST /api/call/generateFactorizerReport
```

### 5.2 Request

```json
{
  "artifact_text": "The core claim is...",
  "artifact_title": "Optional title",
  "subject": "What this is about",
  "subject_type": "idea",
  "category": "neurotech",
  "tags": ["eeg", "edge-computing"]
}
```

### 5.3 Response

```json
{
  "report_id": "uuid",
  "title": "One-line distillation",
  "composite_score": 7.8,
  "verdict": "SOLID",
  "dimensions": {
    "clarity": { "score": 8.5, "evidence": "..." },
    "novelty": { "score": 7.0, "evidence": "..." },
    "transfer": { "score": 8.0, "evidence": "..." },
    "falsifiability": { "score": 7.5, "evidence": "..." },
    "evidence_ready": { "score": 8.0, "evidence": "..." }
  },
  "summary": "2-3 sentence summary",
  "provenance_hash": "sha256...",
  "status": "scored"
}
```

---

## 6. NSF PHASE I MAPPING

### 6.1 How the Factorizer Maps to NSF Work Packages

| NSF WP | Factorizer Activity | NSF-Safe Language |
|--------|---------------------|------------------|
| WP2 | Rubric calibration via inter-annotator agreement | "Five-dimension rubric validated against expert consensus (Cohen's kappa ≥ 0.60)" |
| WP3 | Heterogeneous corpus validation (50+ artifacts) | "Reproducibility, false collision rate, and rank-order concordance (Spearman ρ ≥ 0.70)" |
| WP4 | Report generation pipeline | "Structured technical dossier with provenance hash chain" |

### 6.2 What NSF Funds vs. What the Product Is

NSF funds the instrument validation. The Factorizer is the commercial deployment of that validated instrument.

```
NSF Phase I (research):
  - Validates the rubric against human expert consensus
  - Tests provenance on 50+ heterogeneous artifacts
  - Produces the first baseline precision/recall metrics
  - Generates the dossier template

Factorizer Product (commercial, post-award):
  - Deploys the validated pipeline as a self-serve tool
  - $49/month per operator
  - Upload → score → report in < 30 seconds
  - No Canon Ledger access (that's Stone Partner tier)
```

### 6.3 Language Restrictions (NSF Compliance)

In NSF-facing documents, the Factorizer is NEVER referred to as:
- QTAC, Stone Score, Canon, VOLT, or any ARCHON terminology
- "World's first" or "first platform"

Instead:
- "automated assessment pipeline"
- "five-dimensional quality rubric"
- "content-addressed audit log"
- "structured technical dossier"
- "multi-criteria rubric"

---

## 7. COMMERCIALIZATION PATH

### 7.1 Factorizer ($49/mo) — Entry Tier

- Self-serve scoring from upload
- 5-dimension quality report
- PDF export with provenance hash
- No Canon Ledger, no VPC deployment, no agent governance
- Target: solo founders, small teams (1-5 operators)
- Launch: post-NSF Phase I award

### 7.2 Upsell Path

```
Factorizer ($49/mo)
  → Stone Partner ($499/mo): full rubric + Canon Ledger + drift monitoring
  → Genesis ($4,999): API access + Renaissance II scoring + direct Brandon sync
```

### 7.3 Revenue Model

| Milestone | Factorizer Users | MRR |
|-----------|-----------------|-----|
| Launch (Q1 2027) | 50 | $2,450/mo |
| Q2 2027 | 150 | $7,350/mo |
| Q3 2027 | 400 | $19,600/mo |
| Q4 2027 | 800 | $39,200/mo |

---

## 8. TECHNICAL IMPLEMENTATION

### 8.1 Current Stack

- **Scoring engine:** Base44 backend function (TypeScript/Deno)
- **Data model:** BlueprintReport entity (Base44 database)
- **Provenance:** SHA-256 hash chain (RFC 8785 canonicalization)
- **API:** POST /api/call/generateFactorizerReport
- **Frontend:** To be built as Base44 app page (post-NSF)

### 8.2 Scoring Logic

The scoring function evaluates each dimension algorithmically:

- **Clarity:** Checks for explicit claim statement, measurable terms, defined scope
- **Novelty:** Compares against known patterns (requires corpus baseline in Phase I)
- **Transfer:** Checks for domain-portability indicators (generalizability language)
- **Falsifiability:** Checks for explicit disconfirmation conditions
- **Evidence-Ready:** Checks for artifact references, URLs, or data citations

### 8.3 Provenance Implementation

```typescript
// Pseudocode for hash chain
const canonicalized = canonicalize(report_json, RFC_8785);
const report_hash = sha256(canonicalized);
const prev_hash = await getLastReportHash();
const provenance_entry = {
  artifact_hash: sha256(canonicalize(artifact)),
  report_hash: report_hash,
  prev_hash: prev_hash,
  timestamp: new Date().toISOString(),
  scorer_version: "factorizer-v1.0"
};
```

---

## 9. REPOSITORY STRUCTURE

```
sovereign-directory/
├── sovereign_directory_template.html    # Per-member node page
├── SOVEREIGN_DIRECTORY_MEMBER_TEMPLATE.md  # New member template
├── docs/
│   └── FACTORIZER_BLUEPRINT_v1.md        # This document
├── functions/
│   └── generateFactorizerReport.ts       # Backend function source
└── nsf/
    └── FACTORIZER_NSF_WP_EDITS_v1.md     # WP2/WP3/WP4 language edits
```

---

*Factorizer Blueprint v1.0 · July 25, 2026 · Waveform Tech LLC*
*NSF SBIR Phase I · Project Pitch ID: 00108466 · PI: Brandon Hines*
*Commercial deployment of NSF-validated cognitive scoring instrument*
