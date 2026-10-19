# CampusQuiz AI — Autonomous Institutional Assessment Engine
### Avanthi Institute of Engineering & Technology (AIET), Visakhapatnam

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=flat-square&logo=github)](https://rahul-gembali.github.io/CampusQuiz/)
[![Zero Build Step](https://img.shields.io/badge/Build-Zero--Build%20Single--File-emerald?style=flat-square)](#)
[![Dual Theme](https://img.shields.io/badge/Design-Academic%20Crimson%20%26%20Obsidian-red?style=flat-square)](#)
[![Offline PWA](https://img.shields.io/badge/PWA-100%25%20Offline%20First-blue?style=flat-square)](#)
[![PRNG Determinism](https://img.shields.io/badge/PRNG-Mulberry32%20Seed--Deterministic-purple?style=flat-square)](#)
[![Tests Passing](https://img.shields.io/badge/Verification-84%2F84%20Tests%20Passed-brightgreen?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

> 🚀 **Live Production Application:** [https://rahul-gembali.github.io/CampusQuiz/](https://rahul-gembali.github.io/CampusQuiz/)

---

## 🏛️ Executive Overview

**CampusQuiz AI** is a minimalist, authoritative, zero-dependency academic examination and quiz platform engineered specifically for **Avanthi Institute of Engineering & Technology (AIET)**. Built with high-contrast Swiss typography, Dieter Rams' *"Less, but better"* design principles, and an institutional **Academic Crimson** color system, it delivers an air-gapped, cheat-resistant, offline-first assessment environment.

The entire production application is contained in a single, deployable `index.html` file requiring **zero Node.js build steps, zero Webpack bundlers, and zero server dependencies**—launchable immediately on legacy laboratory desktop hardware or budget mobile devices via browser or standalone PWA.

---

## ✨ Architectural Pillars & Features

### 1. 🎨 Academic Crimson Design System & Dual-Theme Ergonomics
- **Light Theme (Crisp Editorial White):** Pure white canvas (`#ffffff`) with hairline 1px borders (`#e2e8f0`) and Deep Academic Crimson accents (`#991b1b`).
- **Dark Theme (Deep Obsidian):** High-contrast dark mode (`#09090b` / `#121215`) with zinc typography and radiant crimson focus rings (`#be123c`).
- **AIET Institutional Crest:** Crisp vector SVG shield in the navbar featuring the academic book, digital gear, torch of enlightenment, and Latin moto *"Jnanam Paramam Balam"*.

### 2. 🔐 Universal Master Credentials & Immutable Identity
- **Permanent Roll Number Primary Key:** Once enrolled, a student's institutional Roll Number (e.g. `26A91A0500`) is permanently locked and cryptographically bound to their answer records.
- **Pre-Seeded Universal Master Access (Instant Evaluation):**
  | Portal | User Identifier | Password | Default Cohort |
  |---|---|---|---|
  | **Faculty Administration** | `FACULTY_ADMIN` | `Avanthi#Faculty2026` | Institutional Admin |
  | **Candidate Examination** | `26A91A0500` | `Avanthi#Student2026` | 2nd Year • CSE • Sec A |

### 3. 📸 Student Profile Photo Compression Pipeline
- **Canvas Aspect-Ratio Cover Downscaler:** In-browser canvas scaler crops and downscales any uploaded image to a square **$256 \times 256$ pixels** without stretching.
- **Lightweight Storage:** Compressed to lightweight JPEG data URLs ($\sim 8\text{--}15\text{ KB}$), stored strictly in offline local storage.
- **Deep Crimson Monogram Fallback:** Dynamic circular avatar displaying candidate initials (e.g. `RG`, `KS`) rendered against Deep Crimson background when no photo is provided.

### 4. 🎓 6 Strict Selectable Engineering Groups
To eliminate data fragmentation and typos, all branch selections across student registration, examination scheduling, and faculty gradebooks are strictly chosen via dropdowns and pill buttons:
1. **CSE** — Computer Science & Engineering
2. **CSM** — Computer Science & Engineering (AI & ML)
3. **CSD** — Computer Science & Engineering (Data Science)
4. **ECE** — Electronics & Communication Engineering
5. **EEE** — Electrical & Electronics Engineering
6. **Mechanical** — Mechanical Engineering

### 5. 🎲 Deterministic PRNG Question & Option Randomization
- **Mulberry32 PRNG:** Each student receives an identically fair examination with question order and answer options deterministically shuffled based on `hash(RollNumber + QuizID)`.
- **ZeroDOM Answer Leakage:** Answer keys, explanations, and generation metadata are completely stripped from the candidate examination DOM and only decrypted upon submission.

### 6. 🛡️ Integrity Monitoring & Anti-Tamper Verification
- **Tab-Switch Supervision:** Detects tab switches, window blurs, and devtool tampering in real-time, logging timestamped infraction records with configurable automated lockout limits.
- **Synchronous SHA-256 Signatures:** Results payload includes a cryptographic integrity hash verifying that client-side marks were not altered before faculty compilation.

### 7. 📊 Faculty Gradebook, Omnibar & Deep Answer-Sheet Inspector
- **Instant Search Omnibar:** Real-time 150ms debounced search matching student names, roll numbers, groups, and sections with $<5\text{ ms}$ latency.
- **Multi-Tier Cohort Filtering:** Filter marksheet roster by Year (`1st` to `4th`), Group (`6 branches`), Section (`A` through `F`), and Examination.
- **Deep Student Answer Sheet Inspector:** Two-section inspection modal displaying candidate's 72×72 profile photo, academic standing, time spent, integrity violations, and full question-by-question comparative breakdown against the official answer key with academic rationale and source citations.
- **One-Click CSV / Excel Export:** Downloads official institutional marksheets formatted with UTF-8 BOM encoding for Microsoft Excel.

### 8. 🎙️ AI Lecture Ingestion & Voice-to-Quiz Pipeline
- Multi-provider AI generation support (OpenRouter, Gemini, OpenAI) with single-key unified configuration.
- Local browser audio recording with automatic chunked transcription via Whisper or local offline Web Speech API.

---

## 🚀 Quick Start Guide

### Launching the Application
No installation or build setup required. Open `index.html` in any browser:
```bash
# Option A: Open directly from file system
start index.html

# Option B: Run via any static HTTP server (Python, Node, or VS Code Live Server)
python -m http.server 8080
# Visit: http://localhost:8080
```

---

## 🧪 Automated Verification & QA Suite

CampusQuiz includes an exhaustive, zero-dependency Node.js test suite with 84 automated assertions covering authentication, cohort gating, photo compression, PRNG determinism, and marksheet inspection:

```bash
# Run Authentication & Cohort Targeting Test Suite (36 Tests)
node test_auth_cohort.js

# Run Profile Photo, 6 Groups & Marksheet Inspector Suite (48 Tests)
node test_profile_marksheet.js
```

### Test Results Summary
```
===============================================================================
TOTAL AUTOMATED ASSERTIONS: 84 | PASSED: 84 | FAILED: 0 (100% SUCCESS)
===============================================================================
[✓] SHA-256 Synchronous Cryptographic Hashes
[✓] Universal Master Credentials & Session Persistence
[✓] Immutable Roll Number Architecture
[✓] Strict 6 Engineering Groups & Branch Normalization
[✓] Aspect-Ratio Cover 256x256 Canvas Downscaling & Monograms
[✓] Real-Time Marksheet Cohort Filtering & Omnibar Search (<5ms)
[✓] Deep Student Answer Sheet & Profile Inspector Modal
```

---

## 🛠️ Technology Stack

| Component | Specification |
|---|---|
| **Core Architecture** | Pure Vanilla JavaScript (ES6+), Zero-Build Standalone Shell |
| **Styling & Theme** | Tailwind CSS CDN + Academic Crimson Dual-Theme System |
| **Iconography** | Lucide Icons CDN |
| **Document Parsing** | PDF.js CDN (Client-side textbook / syllabus parsing) |
| **PRNG Engine** | Deterministic 32-bit Mulberry32 seeded with FNV-1a |
| **Cryptography** | Synchronous SHA-256 implementation with zero external dependencies |
| **Storage Engine** | Browser LocalStorage + Local IndexedDB for offline resilience |

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

Developed for **Avanthi Institute of Engineering & Technology (AIET)**.
