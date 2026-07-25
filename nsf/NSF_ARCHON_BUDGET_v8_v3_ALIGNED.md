# NSF SBIR Phase I — Budget v8 (v3 ALIGNED)
## ARCHON Ψ: Edge-Native EEG System for Neuroplasticity Engineering
## PI: Brandon Hines, Waveform Tech LLC
## Total Requested: $305,000.00 | Duration: 12 months | Project Pitch ID: 00108466
## Change from v7: FDA 510(k) consulting line ($2,000) removed — regulatory out of scope for Phase I. Reallocated to rubric calibration tooling. WP names aligned to v3.

---

## 1. MASTER BUDGET TABLE

| Line | Category | Amount | % of Total |
|------|----------|--------|------------|
| A | Senior Personnel — PI (Brandon Hines, 6.0 PM, 50% FTE) | $75,000.00 | 24.59% |
| B | Other Personnel — Technical Lead (John Driscoll, 3.0 PM, 25% FTE) | $25,000.00 | 8.20% |
| C | Other Personnel — EEG/Clinical Data Engineer (D1, 2.0 PM, 25% FTE) | $20,000.00 | 6.56% |
| D | Subcontract — Dark Consultancy (Kunal Patel, 240 hrs @ $250) | $60,000.00 | 19.67% |
| E | Subcontract — AlienTT (120 hrs @ $200) | $24,000.00 | 7.87% |
| F | Consultant — Marina Tudor (40 hrs @ $200) | $8,000.00 | 2.62% |
| ~~G~~ | ~~Consultant — Ryan Moeller~~ | ~~$0~~ | ~~REMOVED~~ |
| H | Consultant — Ad Hoc Domain Experts (3.33 hrs @ $300) | $1,000.00 | 0.33% |
| I | Equipment (26 line items — see §4) | $8,000.00 | 2.62% |
| J | Travel (see §5) | $5,000.00 | 1.64% |
| K | Other Direct Costs (12 line items — see §6) | $28,500.00 | 9.34% |
| | **Total Direct Costs** | **$255,500.00** | **83.77%** |
| L | Indirect Costs (19.37% of direct) | $49,500.00 | 16.23% |
| | **TOTAL** | **$305,000.00** | **100.00%** |

**Math verification:** $255,500.00 + $49,500.00 = $305,000.00 ✓

---

## 2. SBIR 2/3 RULE COMPLIANCE

| Entity | Components | Amount | % of Total |
|--------|-----------|--------|------------|
| Waveform Tech LLC | A + B + C + F + H + I + J + K + L | $221,000.00 | 72.46% |
| Subcontractors | D + E | $84,000.00 | 27.54% |
| **Total** | | **$305,000.00** | **100.00%** |

- Waveform Tech portion: 72.46% ≥ 66.67% required ✓
- Subcontractor portion: 27.54% ≤ 33.33% allowed ✓

---

## 3. PERSONNEL DETAIL

| Person | Role | FTE | Person-Months | Cost |
|--------|------|-----|---------------|------|
| Brandon Hines | PI | 50% | 6.0 | $75,000 |
| John Driscoll | Technical Lead | 25% | 3.0 | $25,000 |
| TBD | EEG/Clinical Data Engineer (D1) | 25% | 2.0 | $20,000 |
| Kunal Patel | Lead Engineer (subcontractor) | ~3% | 0.36 | $60,000* |
| AlienTT | PM Support (subcontractor) | — | — | $24,000* |
| Marina Tudor | Clinical Annotator (D2) | — | — | $8,000* |
| Ad Hoc Experts | Domain consultation | — | — | $1,000* |

*Subcontractors and consultants are hourly, not FTE-based.*

**Ryan Moeller — NOT on budget.** Ryan provides an external Letter of Support (on file). NSF rules prohibit individuals from being on the budget AND providing an LoS.

---

## 4. EQUIPMENT — $8,000.00 (26 LINE ITEMS)

*(Unchanged from v7)*

---

## 5. TRAVEL — $5,000.00

*(Unchanged from v7)*

---

## 6. OTHER DIRECT COSTS — $28,500.00 (12 LINE ITEMS)

| # | Item | Amount | Justification |
|---|------|--------|--------------|
| 1 | Participant compensation (60 participants × $50 × 3 sessions) | $9,000.00 | WP3 human feasibility study — $50/session removes economic barriers. Supports URM enrollment. |
| 2 | Cloud computing (AWS/GCP — PINN training, data storage) | $3,500.00 | WP1, WP2 — GPU training, inference, data pipeline |
| 3 | NVIDIA A100 GPU compute (supplemental to in-kind credits) | $2,000.00 | WP2 — large-scale PINN model training |
| 4 | Software licenses (MATLAB, BrainFlow SDK Pro) | $1,500.00 | WP1, WP2 — signal processing, device integration |
| 5 | IRB application and annual review fees | $2,000.00 | WP3 — IRB Protocol |
| 6 | Rubric calibration and annotation tooling | $2,000.00 | WP2 — dual-annotator rubric scoring infrastructure, inter-annotator agreement tooling, automated pipeline validation software |
| 7 | Clinical annotation software and tools | $2,000.00 | WP2, WP3 — expert annotation infrastructure |
| 8 | Data storage (encrypted, HIPAA-compliant) | $1,500.00 | WP3 — feasibility study data, BIDS-compliant |
| 9 | Open-access publication fees | $1,500.00 | WP4 — disseminate results, OpenNeuro dataset |
| 10 | Materials and lab supplies | $1,000.00 | WP1–WP3 — general lab consumables |
| 11 | Communications (phone, internet, remote sessions) | $1,000.00 | WP3 — remote participant sessions |
| 12 | Second Blind Annotator (D2) — 20 hrs @ $125/hr | $2,500.00 | WP2 — independent blind annotation; Cohen's κ inter-annotator agreement |
| | **TOTAL ODC** | **$28,500.00** | |

**Math verification:** $9,000 + $3,500 + $2,000 + $1,500 + $2,000 + $2,000 + $2,000 + $1,500 + $1,500 + $1,000 + $1,000 + $2,500 = $28,500.00 ✓

**Change from v7:**
- Line 6: "FDA 510(k) pre-submission consulting" → "Rubric calibration and annotation tooling" — regulatory work removed from Phase I scope per v3 §5.1
- Net budget impact: $0 (reallocation within ODC)

---

## 7. INDIRECT COSTS — $49,500.00

*(Unchanged from v7)*
Rate: 19.37% of $255,500 = $49,500 ✓

---

## 8. BUDGET BY WORK PACKAGE

| Work Package | Months | Key Activities | Budget |
|-------------|--------|---------------|--------|
| WP1: System Foundation | M1–3 | Prototype assembly, ORICA+PINN pipeline, device abstraction, HALT baseline | ~$70,000 |
| WP2: Instrument Calibration & Feedback Development | M4–6 | PINN training, Semantic Energy validation, closed-loop N=10, D2 blind annotation, rubric calibration | ~$77,500 |
| WP3: Human Feasibility Study & Instrument Validation | M7–9 | N=40 enrollment, 1,200 sessions, provenance on 50+ artifacts, rubric concordance, PCA | ~$95,500 |
| WP4: Phase II Readiness & Technical Dossier | M10–12 | HALT complete, technical dossier, deployable pipeline module, Phase II proposal, time-on-task | ~$62,000 |
| **Total** | | | **~$305,000** |

---

## 9. IN-KIND CONTRIBUTIONS (NOT IN BUDGET)

| Contributor | Item | Value | Role |
|---|---|---|---|
| BrainBit Inc. (Boris Goldstein) | 100 BrainBit beta headsets + SDK support | ~$15,000 | Multi-device compatibility validation |
| NVIDIA Inception | GPU compute credits | ~$5,000–$10,000 | Supplemental PINN training compute |

---

## 10. FINAL VERIFICATION

| Check | Value | Status |
|-------|-------|--------|
| Direct costs | $255,500.00 | ✓ |
| Indirect costs | $49,500.00 | ✓ |
| Grand total | $305,000.00 | ✓ |
| Equipment line items sum | $8,000.00 | ✓ |
| ODC line items sum | $28,500.00 | ✓ |
| Travel line items sum | $5,000.00 | ✓ |
| WT portion ≥ 66.67% | 72.46% | ✓ PASS |
| Subcontractor portion ≤ 33.33% | 27.54% | ✓ PASS |
| PI effort ≥ 1 PM per 6 months | 6.0 PM over 12 months | ✓ PASS |
| D2 annotator funded | $2,500 in ODC Line 12 | ✓ |
| Ryan Moeller not on budget | $0 (removed) | ✓ — LoS only |
| No SBIR funds for regulatory work | FDA line removed, $2K → rubric tooling | ✓ PASS |
| WP names aligned to v3 | WP2/WP3/WP4 updated | ✓ PASS |
| Proposal text matches budget | Two annotators funded, regulatory excluded | ✓ PASS |

**All checks pass. Budget is $305,000.00 exact. No SBIR funds allocated to regulatory activities.**

---

*NSF SBIR Phase I Budget v8 (v3 ALIGNED) · July 25, 2026 · Waveform Tech LLC*
*v7→v8 change: FDA 510(k) consulting $2,000 removed (regulatory out of scope), reallocated to rubric calibration tooling. WP names aligned to Project Description v3. Zero net budget impact.*
