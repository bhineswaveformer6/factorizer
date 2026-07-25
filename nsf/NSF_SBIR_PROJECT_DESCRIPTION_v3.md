# NSF SBIR Phase I — Project Description (v3 — Factorizer Threaded)
## ARCHON Ψ: Edge-Native EEG System for Neuroplasticity Engineering
## Project Pitch ID: 00108466 | Topic Area: HC — Human-Computer Interaction
## PI: Brandon Hines, Waveform Tech LLC | Budget: $305,000 | Duration: 12 months

---

## 1. INTELLECTUAL MERIT

### 1.1 The Central Research Problem

Current neurofeedback systems evaluate signal processing and cognitive state detection separately from provenance and verification, leaving no validated method for determining whether consumer-grade EEG hardware can simultaneously achieve real-time artifact removal, accurate cognitive state classification, and tamper-evident recording of detected cognitive events on a single constrained edge processor.

This structural decoupling — between real-time neural signal processing and cryptographic provenance — means that even when neurofeedback systems successfully detect and train cognitive states, they produce no verifiable, auditable record of the cognitive event. Session metrics live on a dashboard and disappear. No prior system has established an integrated benchmark for edge-native cognitive state detection with on-device cryptographic provenance.

Three compounding failures make this gap urgent:

**Latency:** Current systems operate at 150–300ms end-to-end, exceeding the neuroplasticity-relevant window (20–100ms). No consumer-grade system has demonstrated sub-30ms ORICA artifact removal and PINN cognitive state classification on a single ARM-class edge processor.

**Accessibility:** Clinical neurofeedback costs $2K–$10K per protocol, excluding 51.5M Americans with documented attentional challenges. Consumer EEG devices (Muse, Emotiv) achieve 63–78% classification accuracy — insufficient for clinical-grade neurofeedback.

**Verifiability:** No consumer or clinical neurofeedback system generates hash-chained provenance records at the point of neural detection. Even research-grade systems log session data post-hoc on servers, creating a trust gap that prevents cognitive performance from being treated as a measurable, defensible output.

Phase I will generate the first baseline dataset and metrics for integrated edge-native cognitive state detection with on-device cryptographic provenance under controlled experimental conditions.

### 1.2 What Is Novel vs. What Exists

While ORICA, PINNs, and RFC 8785 canonicalization are individually established in the literature, their coupled behavior on a single constrained edge processor is uncharacterized. Phase I treats the ARCHON Ψ Edge-Neuro Node as a scientific instrument: we are resolving whether sub-50ms artifact removal, physics-informed cognitive state inference, and on-device canonicalized provenance can co-exist without unacceptable accuracy drift or false collisions. The technical risk and novelty lie in this coupled, constraint-driven behavior — it is unknown whether a consumer-grade EEG front-end, physics-informed model, and provenance engine can co-exist on a 600MHz microcontroller without unacceptable accuracy drift, quantization failure, or provenance collisions. Phase I is explicitly designed to resolve these unknowns via latency, generalization, and robustness benchmarks.

- **ORICA** (Optimized Real-time Independent Component Analysis) is well-established (Pion-Tonachini et al., 2018; US9724005B2) and has been implemented on FPGA and VLSI platforms. No prior implementation targets ARM Cortex-M7 under a sub-30ms end-to-end latency budget using INT8 quantization and CMSIS-DSP optimized libraries.

- **PINNs** (Physics-Informed Neural Networks) for EEG cognitive state classification is an emerging approach with limited prior work (Tang et al., 2024, motor imagery only). No prior work applies physics-informed constraints (Hodgkin-Huxley, Kuramoto, Wilson-Cowan) to cognitive state classification (focus, flow, creative, clarity, confidence) on constrained edge hardware.

- **SHA-256 hash-chaining** and **RFC 8785 canonicalization** are standard cryptographic/standards primitives. No prior system applies them to verified cognitive event records with on-device evidence binding — hash-chaining at the point of neural detection rather than post-hoc server-side logging.

The ARCHON Ψ Edge-Neuro Node proposes an integrated architecture for jointly validating real-time cognitive state detection and on-device cryptographic provenance in a single edge-native pipeline.

### 1.3 Three Research Questions

Phase I is designed to resolve three specific technical unknowns:

**RQ1:** Can RFC 8785-based canonicalization combined with SHA-256 hash-chaining maintain 100% reproducibility and tamper detection on heterogeneous cognitive session outputs (50+ artifacts) without false collisions, when executed on a constrained edge processor alongside real-time ORICA and PINN inference?

**RQ2:** Can a physics-informed neural network materially outperform a standard CNN baseline on cross-user cognitive state generalization (leave-one-subject-out) when both are deployed with INT8 quantization on ARM Cortex-M7, and does the physics-informed regularization preserve accuracy under this constraint?

**RQ3:** Can the integrated edge-native pipeline (ORICA + PINN + on-device provenance) maintain sub-50ms end-to-end latency while preserving classification accuracy within 2% of an unconstrained float32 baseline across thermal stress conditions (−20°C to 80°C, 48-hour HALT)?

These questions are testable, falsifiable, and have explicit Go/No-Go criteria defined in the work plan.

### 1.4 Technical Innovation

The technical innovation lies in coupling three components that have not been jointly benchmarked in prior work:

**Innovation 1: Edge-Native ORICA Artifact Removal**

ORICA removes eye blinks, muscle artifacts, and electrical noise during recording rather than post-hoc. Our contribution is not the algorithm — it is the deployment on ARM Cortex-M7 (600MHz, 1MB RAM) under a sub-30ms end-to-end latency budget, using INT8 quantization and ARM CMSIS-DSP optimized fixed-point/float32 mixed-precision operations. Phase I will benchmark: artifact removal efficiency vs. float32 baseline, latency contribution of ORICA stage to total pipeline, and accuracy drift under thermal stress.

**Innovation 2: Physics-Informed Cognitive State Classification**

Standard CNN-based EEG classifiers treat the brain as a black box. PINNs embed neural dynamics equations (Hodgkin-Huxley membrane dynamics, Kuramoto synchronization, Wilson-Cowan excitatory-inhibitory coupling) as regularization constraints. The hybrid design is chosen for institutional interpretability: the symbolic physics layer yields traceable evidence paths, unlike purely neural models. Phase I will benchmark: PINN vs. CNN classification accuracy (leave-one-subject-out cross-validation), cross-user generalization delta, and accuracy retention under INT8 quantization on Cortex-M7.

**Innovation 3: On-Device Cryptographic Provenance**

The provenance engine runs on the same Cortex-M7 that performs ORICA and PINN. Cognitive events are canonicalized using RFC 8785 JSON Canonicalization Scheme (recursive key sorting, I-JSON subset, Unicode NFC normalization) and sealed in a SHA-256 append-only hash chain on industrial MicroSD. Standard document hashing fails under benign formatting variation, generating false-positive tamper alerts; RFC 8785-based canonicalization eliminates this variance. Phase I will validate: reproducibility (100% target), tamper detection (100% target), false collision rate (zero target) on 50+ heterogeneous session outputs, and rank-order concordance with independent expert assessment (Spearman ρ ≥ 0.70).

The provenance layer is designed for modular extension across domains, subject to Phase I validation. It is not claimed to be production-ready; it is claimed to be architecturally sound and ready for controlled validation.

### 1.5 Preliminary Results and Stated Limitations

**Provenance Pilot (20 artifacts):** 100% reproducibility and 100% tamper detection under adversarial edits, line-ending variation, and trailing whitespace changes.

*Limitation:* The pilot demonstrates feasibility on a small, homogeneous corpus. It does not establish generalizability to heterogeneous, multimodal cognitive session outputs. This limitation directly motivates Work Package 3 (50-artifact heterogeneous corpus validation).

**Pilot Study (IRB #2024-078, n=24):** 23% TOVA improvement vs. 10% for controls (p<0.05, power >0.8), 92% retention.

*Limitation:* The pilot used a single EEG device and a custom processing pipeline, not the integrated edge-native architecture. Classification accuracy was measured under unconstrained compute (GPU), not on ARM Cortex-M7 with INT8 quantization. These results establish directional evidence for neurofeedback efficacy but do not validate the edge-native pipeline's performance.

**v0 Citation Classifier:** Passed all 15 structured automated self-tests for explicit citation parsing.

*Limitation:* The v0 classifier establishes baseline precision on explicit citations but does not yet characterize recall on implicit technical reasoning. Phase I transitions this to a Neural-Symbolic hybrid and benchmarks against blind expert consensus.

Preliminary workflow observations suggest the architecture may reduce expert review burden. Phase I will test this prospectively using a controlled time-on-task protocol (WP3), not retrospective estimation.

---

## 2. PHASE I TECHNICAL ARCHITECTURE

### 2.1 ARCHON Ψ Edge-Neuro Node Specifications

| Subsystem | Component | Specification | Phase I Role |
|---|---|---|---|
| Signal Acquisition | BrainBit Flex EEG | 4-channel dry electrode, Bluetooth LE/USB | Primary acquisition device. Phase II roadmap: dedicated ADS1299 front-end for lower latency. |
| Edge Processing | Teensy 4.1 (ARM Cortex-M7 @ 600MHz) | 1MB RAM, 8MB Flash, CMSIS-NN | Runs ORICA, PINN, and provenance engine simultaneously. The constrained resource environment IS the research question. |
| Provenance Engine | SHA-256 Hash-Chaining + Industrial MicroSD | 16GB SLC NAND | Generates immutable audit logs on device. Validated for reproducibility and tamper detection. |
| Enclosure & Power | 3D-printed PETG + LiPo 2000mAh | Thick-walled, brass inserts, thermal sensing, over-current protection | Engineering test platform for HALT and mechanical resilience benchmarks. |

Prototype cost: ~$845 per unit. Five prototypes budgeted for Phase I.

### 2.2 Five Testable Hypotheses

**H1 (Ultra-Low Latency):** The integrated pipeline (ORICA + PINN + provenance hash-chaining) will achieve >92% motor imagery accuracy while maintaining <50ms end-to-end latency on ARM Cortex-M7 with INT8 quantization.

**H2 (Cross-User Generalization):** The PINN model will outperform a standard CNN baseline by ≥5pp on leave-one-subject-out cross-validation when both are deployed with INT8 quantization on ARM Cortex-M7.

**H3 (Thermal Robustness):** Classification accuracy will not degrade by more than 2% from unconstrained float32 baseline across thermal stress conditions (−20°C to 80°C, 48-hour HALT).

**H4 (Multi-Device Consistency):** Classification accuracy variance across four EEG devices (BrainBit Flex, Muse 2, Emotiv EPOC, OpenBCI Cyton) will be ≤10pp.

**H5 (Provenance + Rubric Concordance):** On 50+ heterogeneous cognitive session outputs: (a) provenance reproducibility = 100%, (b) tamper detection = 100%, (c) false collision rate = 0, (d) rank-order concordance between automated five-dimension quality rubric and independent expert assessment: Spearman ρ ≥ 0.70.

### 2.3 Testing Plan

| Test | Method | Target | Gate |
|---|---|---|---|
| ORICA artifact removal | 12,000+ session corpus | >95% efficiency | WP1 |
| PINN vs. CNN accuracy | Leave-one-subject-out CV | ≥5pp improvement | WP2 |
| End-to-end latency | ARM Cortex-M7 profiling | <50ms | WP1 |
| Thermal robustness | HALT (−20°C to 80°C, 48hr) | <2% drift | WP4 |
| Provenance reproducibility | 50+ heterogeneous artifacts | 100% | WP3 |
| Rubric concordance | Spearman ρ vs. expert consensus | ≥ 0.70 | WP3 |
| Inter-annotator agreement | Cohen's kappa (D1 vs. D2) | ≥ 0.70 | WP2 |

---

## 3. WORK PLAN & MILESTONES (12 MONTHS)

### WP1: System Foundation (Months 1–3)
- Edge-Neuro Node prototype assembly (5 units)
- Real-time EEG pipeline (8-channel, <50ms) — **Go/No-Go gate**
- ORICA validated (>92% artifact removal, <25ms) on ARM Cortex-M7 with CMSIS-DSP
- Universal device abstraction (BrainBit, Muse, Emotiv, OpenBCI)
- HALT thermal testing baseline established
- *Deliverable:* Functional prototype with live demo + HALT baseline report

### WP2: Instrument Calibration & Feedback Development (Months 4–6)
- PINN models trained (127 markers), benchmarked against CNN baseline (leave-one-subject-out)
- Semantic Energy validated as flow-state biomarker (correlation with subjective assessments)
- Closed-loop neurofeedback validated (N=10 internal cohort) — **Go/No-Go gate**
- Mechanical resilience testing (5,000 flexion cycles)

- Five-dimension quality rubric calibrated against dual-expert consensus:
  Two independent blind annotators (D1 + D2) score cognitive session artifacts
  across five dimensions (Claim Clarity, Conceptual Advancement, Cross-Context
  Applicability, Disconfirmability, Evidence Availability). Inter-annotator
  agreement computed as Cohen's kappa (threshold ≥ 0.70, per Landis & Koch 1977).
  Disagreements adjudicated by the PI. This calibration establishes the rubric
  as a validated assessment instrument — the automated scoring pipeline is
  benchmarked against this human expert consensus baseline.

- N≥40 annotated session corpus completed with precision/recall metrics for
  both the PINN classifier and the automated rubric scoring pipeline

- *Deliverable:* AI benchmarks vs. SOTA + inter-rater reliability report +
  rubric calibration report (precision/recall of automated scoring vs.
  expert consensus)

### WP3: Human Feasibility Study & Instrument Validation (Months 7–9)
- IRB approval secured for human feasibility study (not a clinical trial)
- N=40 adult participants with documented attentional challenges recruited
  via partner clinics. Primary objective: characterize instrument performance
  and user interaction under repeated real-world use (signal quality, latency,
  drop-outs, adherence). Exploratory analyses examine changes in attention
  metrics (e.g., TOVA) but do not constitute a therapeutic trial.
  Phase I is not a clinical trial and will not evaluate safety or efficacy
  of any medical treatment; it is a feasibility study of an instrumentation
  platform for measuring and training cognitive states.

- Instrument data collection (1,200 total sessions across 40 participants)

- Automated assessment pipeline deployed on all session outputs:
  The five-dimension rubric is applied automatically to each session artifact
  by the on-device scoring pipeline. On-device provenance layer (RFC 8785
  canonicalization + SHA-256 hash-chaining) seals each scored output at the
  point of detection — **Go/No-Go gate (H5)**

- 50+ heterogeneous session outputs tested for:
  (a) Provenance reproducibility (target: 100%)
  (b) Tamper detection (target: 100%)
  (c) False collision rate (target: zero)
  (d) Rank-order concordance between automated rubric scores and independent
      expert assessment (target: Spearman ρ ≥ 0.70)

- PCA applied to rubric dimension scores to test dimensional independence
  (target: ≥ 4 independent dimensions confirmed)

- Controlled time-on-task protocol executed: unaided expert review vs.
  dashboard-assisted expert review. Primary KPI: hours saved per artifact
  reviewed. This is a feasibility metric for workflow integration, not a
  therapeutic endpoint.

- *Deliverable:* Instrument feasibility report (signal quality, usability,
  adherence metrics) + provenance validation report + automated assessment
  pipeline performance report (precision/recall vs. expert consensus)

### WP4: Phase II Readiness & Technical Dossier (Months 10–12)
- HALT thermal testing complete (−20°C to 80°C, <2% accuracy drift over
  48hr continuous operation)

- Structured technical dossier generated from Phase I instrument data:
  The dossier compiles performance characteristics (latency, accuracy,
  reliability), provenance validation results, rubric calibration metrics,
  and usability benchmarks into a standardized format. This dossier is
  intended to inform future regulatory interactions and commercial
  deployment, funded via Phase II and/or private capital. Regulatory
  clearance (e.g., FDA 510(k)) is out of scope for Phase I.

- Automated assessment pipeline finalized: the scoring + provenance
  pipeline is packaged as a deployable module with documented API,
  performance benchmarks, and reproducibility metrics. This module
  constitutes the technical foundation for the commercial assessment
  tool described in the Commercialization section.

- Phase II proposal submitted ($750K request) with multi-site validation
  plan (N=200) and commercial deployment roadmap

- *Deliverable:* Technical dossier (performance + provenance + rubric
  metrics) + Phase II funding pathway confirmed + deployable assessment
  pipeline module

### Go/No-Go Summary

| Gate | Criterion | Threshold |
|---|---|---|
| WP1 | Edge-Neuro Node + ORICA+PINN end-to-end latency on ARM | ≤ 50ms |
| WP2 | PINN vs. CNN cross-user generalization | Material improvement (leave-one-subject-out) |
| WP2 | Inter-annotator agreement (D1 vs. D2, Cohen's kappa) | ≥ 0.70 |
| WP2 | Mechanical resilience (flexion fatigue) | 5,000 cycles, no degradation |
| WP3 | Provenance reproducibility on session outputs | 100% |
| WP3 | Quality rubric vs. expert concordance | Spearman ρ ≥ 0.70 |
| WP3 | PCA confirms ≥ 4 independent rubric dimensions | Pass |
| WP4 | HALT thermal testing (−20°C to 80°C) | <2% accuracy drift / 48hr |

---

## 4. COMMERCIALIZATION & MARKET

### 4.1 Market Problem

Conventional neurofeedback costs $2K–$10K per protocol, requiring 30–40 clinical sessions. This excludes 51.5M Americans with documented attentional challenges who could benefit from neurofeedback but cannot access it. Consumer EEG devices (Muse at $300, Emotiv at $300) achieve 63–78% classification accuracy — insufficient for clinical-grade neurofeedback.

### 4.2 Customer Discovery (n=47, 18 months)

Structured interviews using Jobs-to-be-Done methodology across three segments:

**Clinical Psychologists & Neurotherapists (n=18):** 83% would pay $149/month for unlimited patient sessions (15/18). Pain point severity: 9.2/10 (cost of traditional neurofeedback).

**High-Performance Executives (n=15):** 73% would pay $299/month for cognitive performance dashboard (11/15). Pain point: no objective measurement of cognitive ROI.

**ADHD Self-Optimizers (n=14):** 86% would pay $99/month for daily neurofeedback training (12/14). Pain point: medication side effects (9.0/10 severity).

### 4.3 Demand Signals

347 organic waitlist sign-ups (25–40/month, no paid ads). 120+ LinkedIn engagements from decision-makers (53.5% director-level+). 27 inbound demo requests. 47,000+ patients accessible via clinical partner Letters of Intent (Mayo Clinic, Johns Hopkins, Rural Health Network).

Preliminary workflow observations suggest the architecture may reduce expert review burden; Phase I will test this prospectively using a controlled time-on-task protocol rather than relying on retrospective estimation.

### 4.4 Automated Assessment Pipeline (Commercialization Vehicle)

Phase I validates the automated assessment pipeline — a five-dimension quality rubric with on-device cryptographic provenance that scores cognitive artifacts against expert consensus. Post-award, this validated pipeline deploys as a self-serve commercial tool at $49/month per operator, enabling solo founders and small teams to upload any artifact (pitch deck, technical document, session output) and receive a structured quality report with tamper-evident provenance in under 30 seconds.

The commercial tool is the direct deployment of the Phase I research instrument — no additional R&D is required to launch. The rubric calibration (WP2), heterogeneous corpus validation (WP3), and dossier template (WP4) produced under Phase I constitute the product's validated backend. Customer discovery (n=47) indicates 83% willingness-to-pay among clinical psychologists and 73% among executives for structured cognitive assessment with provenance.

Revenue projection: $2,450 MRR at launch (50 users), scaling to $39,200 MRR within 12 months (800 users) based on current waitlist velocity (25–40 organic signups/month, no paid acquisition).

---

## 5. REGULATORY & RISK

### 5.1 Regulatory Pathway (Downstream)

Regulatory clearance (e.g., FDA 510(k)) is out of scope for Phase I. NSF SBIR funds are used exclusively for instrumentation feasibility and technical validation — not regulatory submissions or compliance activities. The instrumentation and performance data developed in Phase I (signal quality, latency, reliability, provenance validation, rubric calibration) are intended to inform subsequent regulatory efforts, which will be funded via Phase II and/or private capital. The structured technical dossier produced in WP4 compiles these performance characteristics in a format that can be reused in future regulatory interactions without requiring additional SBIR-funded regulatory work.

### 5.2 IRB & Ethical Compliance

Full IRB approval (Protocol WTL-IRB-2024-001, March 15, 2024). Compliant with 45 CFR 46 (Common Rule), Declaration of Helsinki, and Belmont Report. De-identified data, encrypted databases, HIPAA-compliant, minimal risk, 48-hour adverse event reporting, annual continuing review.

### 5.3 Technical Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Latency exceeds 50ms under load | GPU acceleration (NVIDIA A100), FPGA edge fallback (Xilinx Zynq), graceful degradation to 100ms |
| ORICA underperforms in noisy environments | Multi-modal validation (EEG + PPG + eye tracking), adaptive thresholding |
| PINN accuracy drops under INT8 quantization | Benchmark against float32 baseline; if >5% drop, investigate mixed-precision or QAT |
| Device compatibility variance >10pp | Prioritize 4 FDA-cleared devices; open-source abstraction SDK |
| Provenance false collisions on heterogeneous sessions | WP3 Go/No-Go gate at 50 artifacts; redesign canonicalization if collisions detected |
| LiPo thermal runaway | Dedicated thermal sensing, over-current protection circuit, IEC 62133 compliance |
| PETG enclosure creep | Brass heat-set inserts (+400% pull-out strength), ASA filament alternative for UV resistance |

---

## 6. BROADER IMPACTS

### 6.1 Full Participation of Underrepresented Groups
60 URM participants (50% of 120 total): 20 African American, 20 Hispanic, 5 Native American. 10 graduate research assistants (5 URM, 50% women). Howard University partnership (PI's alma mater, HBCU). $50/session compensation removes economic barriers.

### 6.2 Improved Well-Being (51.5M Population with Documented Attentional Challenges)
Phase I: 120 participants, 60 with documented attentional challenges, projected 15–25% improvement in attention metrics. Phase II: 10,000 low-income patients by 2028 via Rural Health Network ($50/month subsidized). 91% cost reduction ($1,188/year vs. $10K traditional). If 1% of this population (515K) achieves 15–25% productivity improvement → $3.9–$6.4B annual economic value.

### 6.3 Research Infrastructure
847M+ neural patterns → OpenNeuro dataset (BIDS-compliant, CC BY 4.0). Three GitHub repos (MIT/Apache): ORICA edge pipeline, PINN models, Semantic Energy framework. Phase I will produce the first documented precision/recall baselines for edge-native cryptographic provenance of neural telemetry — establishing an empirical basis needed to evaluate deployability in institutional review workflows.

### 6.4 Integrity & Safety
ARCHON Ψ enforces human-in-the-loop triage. Cognitive breakthrough events are surfaced for expert review, never auto-certified. The on-device provenance layer ensures every claim is traceable to its neural evidence at the point of detection. The five-dimensional quality rubric surfaces unsupported claims for human review rather than auto-rejecting, in order not to penalize genuinely novel methodologies. Precision/recall will be monitored for drift.

### 6.5 Environmental & IP Protection
Lightweight SHA-256 and targeted PINN inference over LLM-heavy stacks reduce compute footprint. Hash-chains allow integrity verification without exposing plaintext proprietary content.

---

## 7. TEAM

**Brandon Hines (PI, 50% FTE):** M.S. Computer Science, 8 years real-time signal processing. Leads ORICA-PINN integration, Semantic Energy validation, provenance architecture, all experimental protocols. Inventor on patent application ARAPA-BHINES-001P (in prosecution).

**John Driscoll (Technical Lead, 25% FTE):** Founder Naked Development, 12+ years embedded systems. Architects Edge-Neuro Node — FPGA prototyping (Xilinx Zynq), GPU acceleration (NVIDIA A100), INT8 quantization, ARM CMSIS-DSP optimization for ORICA matrix operations.

**Kunal Patel, PMP (Technical Advisor / Lead Engineer, ~3% FTE):** MS Computer Science (University at Albany), PMP. CEO Dark Consultancy (US-based, NYC). Prior DoD delivery. Leads engineering delivery for provenance layer (WP3), cloud architecture, programme governance in regulated environments. $60K subcontract.

**Marina Tudor (Annotator / Clinical Research Coordinator, ~2% FTE):** NCC, LCSP, CCTP, C-DBT, EMDR. 26 years clinical methodology, 7 languages, 54,000+ hours observation. Manages Phase I participant onboarding, clinical state annotation, inter-rater reliability protocol for rubric calibration (WP2).

**Ryan Moeller (Community Engagement Advisor, <1% FTE):** CFA Charter Holder, 26-year finance career. Connects Phase I outcomes to enterprise and clinical market channels. $75K SAFE committed to Waveform Tech.

**Boris Goldstein (Industry / Hardware Advisor, in-kind):** Founder/CEO BrainBit Inc. Provides hardware integration support, SDK access, device validation expertise, 100 beta units for H4 multi-device testing.

**Jeffrey Hines (CFO, 25% FTE):** CPA/MBIT, 20 years financial leadership. Budget tracking, NSF compliance, IRB coordination.

---

## 8. BUDGET ($305,000)

| Category | Amount | % |
|---|---|---|
| A. Senior Personnel — PI (50% FTE) | $75,000 | 24.6% |
| B. Technical Lead — Driscoll (25% FTE) | $25,000 | 8.2% |
| C. Subcontract — Dark Consultancy (Kunal) | $60,000 | 19.7% |
| D. Other Personnel — EEG/Clinical Data Engineer | $20,000 | 6.6% |
| E. Subcontract — AlienTT (PM Support) | $24,000 | 7.9% |
| F. Consultant — Marina Tudor | $8,000 | 2.6% |
| G. Consultant — Ryan Moeller | $3,000 | 1.0% |
| H. Consultant — Ad Hoc Experts | $2,000 | 0.7% |
| I. Equipment (Edge-Neuro Node + EEG devices) | $8,000 | 2.6% |
| J. Travel | $5,000 | 1.6% |
| K. Other Direct Costs | $26,500 | 8.7% |
| L. Indirect Costs | $48,500 | 15.9% |
| **TOTAL** | **$305,000** | **100%** |

SBIR 2/3 Rule: Waveform Tech portion = 72.5% (exceeds 66.7%). In-kind: BrainBit 100 beta units ($15,000 value).

---

## 9. CONCLUSION

Phase I is not a product build. It is a controlled research effort to resolve whether consumer-grade EEG hardware, ARM-class edge processing, and on-device cryptographic provenance can be jointly validated under institutional review conditions. The ARCHON Ψ Edge-Neuro Node is the physical artifact on which this validation occurs.

The three research questions (RQ1: provenance robustness on heterogeneous sessions, RQ2: PINN vs. CNN generalization under quantization, RQ3: integrated latency under thermal stress) are testable, falsifiable, and mapped to explicit Go/No-Go gates. Preliminary results establish directional feasibility but are explicitly limited in scale and device heterogeneity — limitations that directly motivate the Phase I work plan.

Success in Phase I establishes the empirical basis needed to evaluate deployability in institutional review workflows and justifies Phase II scale-up: multi-site validation (N=200), regulatory pathway evaluation, and commercial deployment of the automated assessment pipeline.

---

*ARCHON Ψ — NSF SBIR Phase I Project Description · v3 (Factorizer Threaded) · July 25, 2026 · Waveform Tech LLC*
*PI: Brandon Hines · Project Pitch ID: 00108466 · Topic: HC — Human-Computer Interaction*
*Budget: $305,000 · Duration: 12 months · 5 hypotheses · 3 research questions · 4 Go/No-Go gates*
*Changes from v2: §1.2 reframed as coupled constraint science; WP2 adds rubric calibration; WP3 renamed to Human Feasibility Study; WP4 removes FDA 510(k); §5.1 regulatory moved downstream; §4.4 adds commercialization vehicle*
