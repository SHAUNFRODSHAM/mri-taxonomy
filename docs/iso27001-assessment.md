# ISO/IEC 27001:2022 — Internal Assessment & Secure-Development Evidence Report

**Application:** MRI ERP Implementation Taxonomy (`mri-erp-taxonomy`)
**Repository:** SHAUNFRODSHAM/mri-taxonomy
**Assessed commit:** `fa6d8fb` (master)
**Date:** 2026-09-02
**Author:** omarsdenhill@openboxsoftware.com
**Classification:** Internal — for Open Box Software colleagues

---

## 0. Important scope statement (read first)

ISO/IEC 27001:2022 certifies an **organisation's Information Security Management
System (ISMS)** — the management framework, policies, risk process and controls
that an organisation operates. **It does not certify software.** An application
cannot, by itself, "be ISO 27001 compliant," and only an accredited certification
body can grant certification.

This document is therefore an **internal self-assessment**, not a certificate and
not a claim of conformance. It has two parts:

- **Part A — Annex A (2022) control mapping / gap analysis.** For each relevant
  control theme: what the repository evidences, what is partial, and what is
  missing or out of scope.
- **Part B — Secure-development-lifecycle evidence.** The technical controls a
  code repository can genuinely evidence (Annex A 8.25–8.34).

Findings are drawn **only from the repository contents** at the assessed commit.
Organisational controls (HR security, physical security, supplier contracts,
management review, internal audit) cannot be evidenced from code and are marked
accordingly — they live at the Open Box Software ISMS level, not here.

---

## 1. System characterisation (why most controls are low-risk here)

| Attribute | Finding | Source |
|---|---|---|
| Architecture | Pure client-side single-page app; **no backend, no server, no API** | `package.json`, `src/` survey |
| Build tooling | Vite 5.4, vanilla JS ES modules, no framework | `package.json` |
| Authentication / accounts | **None** — the app has no login, users or sessions | full `src/` grep: no auth/token/password logic |
| Data at rest | Browser `localStorage` only (taxonomy versions) | `src/versions.js`, `src/main.js` |
| Personal data (PII) | **None processed** — content is ERP process taxonomy, not personal data | data files in `src/data/` |
| Network calls | One local-asset `fetch` for the export logo; no external endpoints | `src/components/docxExport.js:49` |
| Secrets / credentials | **None in repo** (no API keys, tokens, connection strings) | full `src/` grep |
| Hosting | Static assets (`dist/`); GitHub-hosted source | `.gitignore`, repo |

**Consequence for the assessment:** the app's inherent information-security risk
is **low**. There is no user data to breach, no credentials to steal, no server to
compromise, and no network attack surface beyond the static host. The meaningful
controls are concentrated in **secure development, change management and
dependency hygiene** (Part B).

---

## Part A — Annex A:2022 control mapping / gap analysis

Legend: ✅ Evidenced · ◐ Partial · ✗ Gap · N/A Not applicable to this system

### A.5 Organisational controls

| Control | Status | Evidence / Gap |
|---|---|---|
| 5.1 Policies for information security | ✗ (org level) | No security policy in repo. Belongs to the Open Box ISMS, not the codebase. |
| 5.9 Inventory of information & assets | ◐ | Repo, `package-lock.json` and `dist/` inventory the software assets; no formal asset register. |
| 5.10 Acceptable use of information | N/A / org level | No user data; acceptable-use is an org policy. |
| 5.12–5.13 Classification / labelling | ◐ | This report is classified "Internal". Content itself is client-methodology IP; no formal scheme. |
| 5.15 Access control | N/A (app) | App has no accounts. Repo access is governed by GitHub org permissions (org level). |
| 5.19–5.22 Supplier / ICT supply chain | ◐ | Only suppliers are npm packages + GitHub. See Part B dependency findings. |
| 5.23 Cloud services security | ◐ | GitHub (source) + static host. No formal cloud-service assessment recorded. |
| 5.28 Collection of evidence | ✅ | Git history provides an immutable, attributable change record. |
| 5.30 ICT readiness for continuity | ✅ (implicit) | Stateless static app; redeploy from Git is full recovery. No data to lose server-side. |

### A.6 People controls

| Control | Status | Evidence / Gap |
|---|---|---|
| 6.1–6.6 Screening, terms, awareness, disciplinary, NDA | ✗ (org level) | Not evidenced in code; managed via Open Box HR/ISMS. |
| 6.7 Remote working | N/A code level | Contributors work remotely via Git; governed by org policy. |

### A.7 Physical controls

| 7.x (all) | N/A (org level) | Cloud-hosted SaaS repo + static app. Physical security is GitHub's / the host's responsibility and Open Box's office policy. |

### A.8 Technological controls

| Control | Status | Evidence / Gap |
|---|---|---|
| 8.1 User endpoint devices | N/A / org level | No app-managed endpoints. |
| 8.2–8.5 Privileged access, restriction, auth | ◐ | No app accounts. Source-code access controlled by GitHub org roles; enable branch protection + 2FA enforcement (see recommendations). |
| 8.8 Management of technical vulnerabilities | ◐ | `npm audit` runs available but **not automated**; 3 known advisories currently open (see Part B). |
| 8.9 Configuration management | ✅ | Config is code (`vite`, `package.json`) and version-controlled. |
| 8.10 Information deletion | N/A | No persistent server data; `localStorage` cleared by the user/browser. |
| 8.12 Data leakage prevention | ✅ | No PII or secrets in repo (verified by grep); `.gitignore` excludes `.claude/`, logs, temp, editor files. |
| 8.13 Backup | ✅ | Git + GitHub remote = distributed backup of all source. |
| 8.15 Logging | N/A (app) | No server; browser console only. GitHub retains audit logs of repo activity. |
| 8.16 Monitoring | ✗ | No runtime monitoring (acceptable for a static internal tool; note for future hosting). |
| 8.24 Use of cryptography | N/A | No sensitive data stored/transmitted by the app to require app-level crypto. HTTPS is a hosting concern. |
| 8.25 Secure development lifecycle | ◐ | See Part B. |
| 8.26 Application security requirements | ◐ | See Part B. |
| 8.27 Secure system architecture | ✅ | Minimal attack surface by design (static, no backend). See Part B. |
| 8.28 Secure coding | ◐ | See Part B — `innerHTML` usage is the main technical finding. |
| 8.29 Security testing in dev & acceptance | ✗ | No automated security tests / SAST in the pipeline. |
| 8.30 Outsourced development | N/A | Developed in-house + AI assistant; no outsourced vendor. |
| 8.31 Separation of dev/test/prod | ◐ | `dev` / `build` / `preview` scripts separate modes; no separate prod environment config (static deploy). |
| 8.32 Change management | ✅ | Git branches, PR-based merges, `CHANGELOG.md` maintained. |
| 8.33 Test information | N/A | No production/personal data used in testing. |
| 8.34 Protection during audit testing | N/A | No live production system to disrupt. |

**Annex A summary:** Of the technological (A.8) controls, the material ones for
this app are **8.8, 8.25–8.32**. The rest are either N/A (no server/accounts/PII)
or sit at the organisational ISMS level.

---

## Part B — Secure-development-lifecycle evidence (Annex A 8.25–8.34)

### B.1 What the repository does well ✅

- **Version control & attributable change history** (8.28/8.32/5.28) — all
  changes are in Git with author attribution; `CHANGELOG.md` is actively kept.
- **Minimal attack surface by design** (8.27) — no backend, no auth, no PII, no
  secrets. This is the single strongest security property of the system.
- **No secrets committed** (8.12) — grep for `password|secret|token|api key` across
  `src/` returns only unrelated UI code; `.gitignore` excludes `.claude/`, logs,
  temp and editor artefacts.
- **Dependency lockfile present** (8.19) — `package-lock.json` pins the full
  dependency tree for reproducible builds.
- **House-style / quality gate on build** — `npm run build` runs
  `scripts/check-house-style.mjs` before `vite build`, showing a pre-build check
  discipline that a security lint could plug into.

### B.2 Findings & gaps

| # | Finding | Control | Severity | Recommendation |
|---|---|---|---|---|
| B-1 | **3 open npm advisories** (`uuid` v3/v5/v6 bounds check, via `exceljs`) reported by `npm audit` (2 moderate, 1 high). | 8.8 | Medium | Run `npm audit fix`; evaluate `exceljs` upgrade. Note: `exceljs` is used by the **offline xlsx export tooling**, not the shipped app runtime, which lowers real-world exposure. |
| B-2 | **Widespread `innerHTML` assignment** (~30+ sites across components) builds DOM from template strings. Content is team-authored taxonomy data, not untrusted external input, so live XSS risk is low — but it is an unbounded pattern. | 8.28 | Low–Medium | Confirm all interpolated values pass through the existing `esc()` helper (already used in `mappingView.js`); prefer `textContent` for plain text. |
| B-3 | **No automated security scanning in CI** — no `.github/workflows/`; `npm audit` / dependency review are manual. | 8.8/8.29 | Medium | Add a GitHub Actions workflow running `npm audit` + Dependabot/CodeQL on PRs. |
| B-4 | **No `SECURITY.md`** (vulnerability disclosure) or `LICENSE`. | 5.1/8.25 | Low | Add a `SECURITY.md` with a reporting contact and a licence file. |
| B-5 | **No branch protection evidence** — cannot confirm required reviews / status checks from repo files. | 8.4/8.32 | Medium | Enable branch protection on `master`: required PR review, no direct pushes, enforce 2FA at org level. |
| B-6 | **No documented secure-coding standard / SDLC policy** in repo. | 8.25/8.27 | Low | Add a short `docs/secure-development.md` referencing this app's threat model (static, no data) so the low-risk posture is recorded, not assumed. |

### B.3 Threat model summary

The realistic threats to this application are:

1. **Supply-chain (dependencies)** — the primary vector (findings B-1, B-3).
2. **DOM/XSS via authored content** — low, mitigated by trusted-author model and
   `esc()` (finding B-2).
3. **Source-repository compromise** — mitigated by GitHub access control; harden
   with branch protection + 2FA (finding B-5).

There is **no** meaningful threat of data breach, credential theft, or server
compromise, because the app holds none of those assets.

---

## 3. Overall internal opinion

Against the subset of ISO/IEC 27001:2022 Annex A controls that are **applicable to
a static, backend-less, data-free internal web application**, the codebase
demonstrates a **sound and low-risk posture**: strong change control, no secrets
or PII, and a minimal attack surface by design.

The remaining gaps are **hygiene and process**, not architectural flaws:
dependency-advisory remediation (B-1), CI-based scanning (B-3, B-5), and a small
amount of security documentation (B-4, B-6). None indicate a data-security risk to
clients.

**Formal ISO/IEC 27001 certification remains an organisational undertaking** — it
requires Open Box Software to operate a certified ISMS (Clauses 4–10: context,
leadership, planning, risk assessment, Statement of Applicability, internal audit,
management review) assessed by an accredited body. This app would sit **inside**
that ISMS scope as one low-risk asset; it does not, and cannot, carry certification
on its own.

## 4. Recommended next actions (prioritised)

1. `npm audit fix` and re-verify (closes B-1). *(quick)*
2. Add GitHub Actions: `npm audit` + Dependabot + CodeQL on PRs (closes B-3). *(quick)*
3. Enable branch protection on `master` + enforce org 2FA (closes B-5). *(config)*
4. Add `SECURITY.md`, `LICENSE`, and `docs/secure-development.md` (closes B-4, B-6). *(docs)*
5. Audit `innerHTML` sites against `esc()` (addresses B-2). *(dev task)*

---

*This is an internal self-assessment based solely on repository contents at commit
`fa6d8fb`. It is not a certificate of compliance and does not represent the opinion
of an accredited certification body.*
