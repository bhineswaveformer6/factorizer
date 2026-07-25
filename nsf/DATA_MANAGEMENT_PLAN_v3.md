# DATA MANAGEMENT PLAN (v3 — Aligned to Project Description v3)
## ARCHON Ψ: Edge-Native EEG System for Neuroplasticity Engineering
## NSF SBIR Phase I · PI: Brandon Hines · Waveform Tech LLC
## Updated: July 25, 2026

---

## 1. DATA TYPES

### 1.1 Data to be Collected

| Data Type | Description | Format | Estimated Volume |
|-----------|-------------|--------|------------------|
| Raw EEG signals | 4-channel dry electrode, 250Hz, 24-bit | EDF/BDF + raw binary | ~2GB/session, 1,200 sessions = ~2.4TB |
| Processed EEG | Post-ORICA cleaned signals, PINN embeddings | NumPy arrays (.npy) | ~500MB/session |
| Cognitive state labels | Five states (focus, flow, creative, clarity, confidence) per epoch | JSON + CSV | <10MB total |
| Rubric scores | Five-dimension quality rubric scores per artifact | JSON (RFC 8785 canonicalized) | <5MB total |
| Provenance records | SHA-256 hash-chained cognitive event logs | JSON (canonicalized) | <50MB total |
| Participant demographics | Anonymized age range, gender, attentional challenge status (no PII) | JSON | <1MB |
| HALT test data | Thermal stress profiles, accuracy drift measurements | CSV + JSON | <100MB |
| Device compatibility metrics | Cross-device variance measurements (4 devices) | CSV | <50MB |

### 1.2 Data Not Shared

- Participant identities and contact information (destroyed after de-identification)
- Raw session video recordings (if any) — retained only for IRB audit, not shared
- Proprietary PINN model weights (commercial IP, shared as architecture + benchmarks, not trained weights)

---

## 2. DATA STANDARDS

### 2.1 Formats

- **EEG data:** EDF+ (European Data Format) for raw signals, BIDS-compliant directory structure for OpenNeuro deposition
- **Processed data:** NumPy .npy arrays with metadata JSON sidecars
- **Rubric scores:** RFC 8785 JSON Canonicalization Scheme (ensures reproducibility)
- **Provenance:** SHA-256 hash-chained JSON records with ISO 8601 timestamps
- **Demographics:** De-identified per HIPAA Safe Harbor (45 CFR 164.514)

### 2.2 Metadata

All datasets include:
- Session ID, participant ID (anonymized), date (year only)
- Device type, sampling rate, channel configuration
- ORICA parameters, PINN model version, quantization level
- Rubric scorer version, annotator IDs, kappa value
- Environmental conditions (temperature, humidity at time of recording)

### 2.3 Quality Rubric Data Standard

Rubric scores follow the RFC 8785 canonicalized JSON schema:
```json
{
  "artifact_id": "uuid",
  "dimensions": {
    "claim_clarity": 0-10,
    "conceptual_advancement": 0-10,
    "cross_context_applicability": 0-10,
    "disconfirmability": 0-10,
    "evidence_availability": 0-10
  },
  "annotator_id": "D1|D2|automated",
  "kappa": "inter-annotator agreement value",
  "timestamp": "ISO 8601",
  "provenance_hash": "SHA-256"
}
```

---

## 3. DATA ACCESS AND SHARING

### 3.1 Public Release

| Dataset | Repository | License | Timeline |
|---------|-----------|---------|----------|
| Raw EEG (de-identified) | OpenNeuro | CC BY 4.0 | Within 6 months of study completion |
| Processed EEG + labels | OpenNeuro + GitHub | CC BY 4.0 | Within 6 months |
| ORICA edge pipeline | GitHub | MIT | Within 12 months (post-publication) |
| PINN model architecture | GitHub | Apache 2.0 | Within 12 months |
| Semantic Energy framework | GitHub | MIT | Within 12 months |
| Rubric scoring benchmark | GitHub | CC BY 4.0 | Within 6 months |
| HALT test data | GitHub | CC BY 4.0 | Within 6 months |

### 3.2 Access Controls During Phase I

- Raw EEG data: stored on encrypted local drives + encrypted cloud backup (AES-256)
- Access restricted to PI, EEG/Clinical Data Engineer (D1), and Marina Tudor (Clinical Annotator)
- Provenance records: on-device (MicroSD) + mirrored to cloud (read-only)
- Rubric annotation data: dual-annotator blind access (D1 and D2 cannot see each other's scores until kappa computed)

### 3.3 Data Sharing Agreements

- Collaborative Research Agreements with Howard University for URM participant data
- Data Use Agreement with clinical partner sites for participant recruitment
- No exclusive data sharing agreements — all NSF-funded data released under CC BY 4.0

---

## 4. DATA PRESERVATION

### 4.1 Storage

| Tier | Medium | Duration | Purpose |
|------|--------|----------|---------|
| Primary | On-device MicroSD (SLC NAND) | Session lifetime | Real-time provenance |
| Secondary | Encrypted local NAS (RAID 6) | 10 years minimum | Working dataset |
| Tertiary | Encrypted cloud backup (AWS S3, IA tier) | 10 years minimum | Disaster recovery |
| Public | OpenNeuro + GitHub | Permanent | Community access |

### 4.2 Preservation Standards

- NSF-funded data preserved minimum 10 years per NSF DMP requirements
- BIDS-compliant format ensures long-term readability
- Provenance hash chain integrity verified annually
- Annual data integrity audit (SHA-256 verification against original hash)

---

## 5. ROLES AND RESPONSIBILITIES

| Role | Person | Data Responsibilities |
|------|--------|----------------------|
| PI / Data Manager | Brandon Hines | Overall data governance, IRB compliance, provenance architecture, public release |
| EEG/Clinical Data Engineer (D1) | TBD | EEG data collection, processing, BIDS formatting, device compatibility testing |
| Clinical Annotator (D2) | Marina Tudor | Cognitive state annotation, inter-rater reliability protocol, participant onboarding |
| Technical Lead | John Driscoll | Edge-Neuro Node data pipeline, ORICA implementation, HALT test data |
| CFO / Compliance | Jeffrey Hines | Budget tracking for data management costs, IRB coordination |

### 5.1 Data Management Costs

| Item | Cost | Source |
|------|------|--------|
| Cloud storage (10 years, S3 IA) | $2,000 | Phase I budget (Other Direct Costs) |
| OpenNeuro deposition | $0 | Free repository |
| GitHub repositories | $0 | Free for open-source |
| Encrypted NAS | $1,500 | Phase I budget (Equipment) |
| Data integrity audit tooling | $500 | Phase I budget (Other Direct Costs) |
| **Total** | **$4,000** | Included in Phase I budget |

---

## 6. INTEGRITY AND PRIVACY PROTECTION

### 6.1 De-identification

- All participant data de-identified per HIPAA Safe Harbor before any sharing
- Participant IDs replaced with random UUIDs
- Dates generalized to year only
- Geographic data aggregated to state level
- Free text responses reviewed for PII before release

### 6.2 On-Device Provenance

- Every cognitive event record is sealed with SHA-256 hash at the point of detection
- Hash chain is append-only — tamper-evident by design
- RFC 8785 canonicalization prevents false-positive tamper alerts from formatting variation
- Provenance records are immutable — correction requires a new record, not modification

### 6.3 Rubric Data Integrity

- Dual-annotator blind scoring protocol: D1 and D2 score independently without visibility into each other's assessments
- Cohen's kappa computed after both annotators complete scoring
- Disagreements adjudicated by PI with documented rationale
- Automated scoring pipeline benchmarked against the adjudicated expert consensus

---

## 7. DATA RETENTION AND DISPOSAL

### 7.1 Retention

- Raw EEG data: 10 years (NSF requirement)
- Processed data: 10 years
- Provenance records: Permanent (hash chain preserved as research artifact)
- Rubric scores: 10 years
- Demographic data: Destroyed after de-identification verification

### 7.2 Disposal

- Participant contact information: destroyed immediately after de-identification
- Raw video (if any): destroyed after IRB audit (within 90 days of study completion)
- Local working copies: securely erased (DoD 5220.22-M) after public release verified

---

*Data Management Plan v3 · July 25, 2026 · Aligned to Project Description v3*
*Changes from v2: 'ADHD/anxiety' → 'attentional challenge'; rubric data standard added; rubric scoring benchmark added to public release; D2 annotator role clarified; FDA references removed*
