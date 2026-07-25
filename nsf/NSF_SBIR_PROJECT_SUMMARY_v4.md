# NSF SBIR Phase I — Project Summary (v4 — Aligned to v3)
## ARCHON Ψ: Edge-Native EEG System for Neuroplasticity Engineering
## Project Pitch ID: 00108466 | Topic Area: HC — Human-Computer Interaction
## PI: Brandon Hines, Waveform Tech LLC | Budget: $305,000 | Duration: 12 months

---

## Overview

Waveform Tech LLC will design, build, and validate the **ARCHON Ψ Edge-Neuro Node**, an 8-channel EEG interface built around an ARM Cortex-M7 microcontroller that implements real-time ORICA artifact removal, physics-informed neural network (PINN) classification, and a SHA-256 hash-chaining provenance engine — all on device, without cloud dependency. The system targets sub-50ms end-to-end latency at consumer price points ($99–$149/month vs. $10K traditional), addressing the 51.5M Americans with documented attentional challenges who are excluded from current neurofeedback by cost, latency, and lack of verifiable outcomes. Phase I benchmarks will quantify closed-loop latency, artifact rejection efficiency, cognitive state classification accuracy, thermal and mechanical safety via HALT testing, on-device provenance integrity, and multi-device compatibility across four consumer EEG platforms. The project culminates in a human feasibility study (N=40, 1,200 sessions) under IRB-approved protocols, positioning the firm for immediate execution of a $750K Phase II (N=200 multi-site validation) and commercial deployment of the automated assessment pipeline.

## Intellectual Merit

Phase I resolves whether three components — ORICA artifact removal, PINN cognitive state classification, and RFC 8785/SHA-256 on-device provenance — can co-exist on a single 600MHz ARM Cortex-M7 without unacceptable accuracy drift, quantization failure, or provenance collisions. Their coupled behavior on a constrained edge processor is uncharacterized in the literature. Three testable research questions address: (RQ1) provenance robustness on 50+ heterogeneous session outputs, (RQ2) PINN vs. CNN cross-user generalization under INT8 quantization, and (RQ3) integrated pipeline latency under thermal stress (−20°C to 80°C, 48-hour HALT). A five-dimension quality rubric (Claim Clarity, Conceptual Advancement, Cross-Context Applicability, Disconfirmability, Evidence Availability) is calibrated against dual-expert consensus (Cohen's κ ≥ 0.70) and benchmarked for automated scoring concordance (Spearman ρ ≥ 0.70). Phase I is not a clinical trial; it is a feasibility study of an instrumentation platform.

## Broader Impacts

Phase I will enroll 40 participants (20 URM, 50%) across 1,200 sessions with $50/session compensation to remove economic barriers, partnered with Howard University (HBCU). The technology targets 51.5M Americans with documented attentional challenges currently excluded by $10K traditional costs. If 1% of this population achieves 15–25% productivity improvement, the economic value is $3.9–$6.4B annually. All de-identified neural data will be released as an OpenNeuro dataset (BIDS-compliant, CC BY 4.0), and three GitHub repositories (ORICA pipeline, PINN models, Semantic Energy framework) will be published under MIT/Apache licenses. The on-device provenance approach establishes a new standard for verifiable neural telemetry — a structural defense against AI-generated or fabricated cognitive claims that has applications beyond neurofeedback in clinical research, compliance, and institutional due diligence. Phase I funds two independent blind annotators for the rubric corpus, establishing inter-annotator agreement (Cohen's κ ≥ 0.70) as a reliability standard for the assessment pipeline. The system enforces human-in-the-loop triage: cognitive events are surfaced for expert review, never auto-certified.

## Key Words

EEG, edge computing, physics-informed neural networks, ORICA, cryptographic provenance, cognitive state classification, neurofeedback, ARM Cortex-M7, INT8 quantization, quality rubric

---

*NSF SBIR Phase I Project Summary · v4 (Aligned to Project Description v3) · July 25, 2026*
*Changes from v3: 'ADHD/anxiety' → 'documented attentional challenges'; 'FDA 510(k)' removed; 'clinical validation' → 'human feasibility study'; 'pre-clinical' → 'feasibility'; rubric calibration added; commercial deployment language added*
