# Changelog

All notable changes to the MRI ERP Implementation Taxonomy are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.5.0] — 2026-06-15

### Added — Per-Module Visibility (Client Scoping)

- **Visible Modules** checklist at the top of the Versions panel — toggle any module on/off
  - Hidden modules are removed from the tab bar; the selection is **saved as part of each version**, so a client version can be scoped to just the modules in that client's engagement
  - Toggling a module marks the version dirty (so it can be saved via Save Changes / Save As)
  - At least one module must remain visible — the last visible module's checkbox is disabled
  - If the active tab is hidden, the app automatically switches to the first visible module
  - Loading **Original** resets all modules to visible
- `state.moduleVisibility` added to central state (map of `tabId → boolean`; missing = visible)
- `moduleVisibility` persisted in saved versions (`versions.js`) and restored on load

### Changed — Tab Bar Overflow

- Tab bar now scrolls **horizontally** when modules exceed the available width (previously the last tab, B&F, could be cut off)
  - Slim styled scrollbar (green accent); tabs no longer compress (`flex-shrink: 0`)
- `index.html` / `src/components/versionMenu.js` / `src/main.js` / `src/state.js` / `src/versions.js` / `src/styles/main.css` updated

---

## [1.4.0] — 2026-06-15

### Added — Budgeting & Forecasting (B&F) Module (Placeholder)

- New **Budgeting & Forecasting (B&F)** module tab (`src/data/bf.js`)
- 8 columns mirroring the B&F functional taxonomy (§3.1–§3.8 of the source document):
  1. Budget Process & Ownership
  2. Budget Structure & Granularity
  3. Budget Creation & Management
  4. Budget Assumptions & Methodology
  5. Variance Reporting & Analysis
  6. Reporting & Distribution
  7. Integration & System Impact
  8. Setup & Configuration
- 49 processes total, with sub-processes under CM Workbook Views (Enhanced Suite View, Calculation View)
- MRI screen references use the real PMX menu paths from the source document (App Menu > Budgeting and Forecasting > …)
- Teal (`#0e5b5b`) module banner — visually distinct from existing modules
- **Placeholder treatment** (same as CAR and JC): amber `⚠️` tab styling, `⚠️ Placeholder Content` in the banner, source-code warning block, and `[PLACEHOLDER]` prefix on every content field — pending human review
- B&F registered in `src/data/index.js` — included in `ALL_DATA`, `ORIGINAL_DATA`, and `MODULE_CONFIG`

### Changed

- `index.html` — added B&F tab button with `tab-btn-placeholder` class and `⚠️` suffix
- `src/data/index.js` — B&F import, `ALL_DATA`/`ORIGINAL_DATA` entries, and `MODULE_CONFIG.bf`
- `src/styles/main.css` — `.bf-header` and `.bf-header-col` banner colours added

> **Note:** Source content compiled from *MRI PMX Budgeting & Forecasting (B&F) Module Taxonomy* (Open Box Software, June 2026). All content is placeholder pending SME review.

---

## [1.3.0] — 2026-06-09

### Added — Job Cost (JC) Placeholder Treatment

- **Job Cost (JC)** module now treated as WIP/Placeholder — same treatment as CAR:
  - Tab styled amber with `tab-btn-placeholder` CSS class and `⚠️` in the button label
  - Module banner now reads `Job Cost ⚠️ Placeholder Content`
  - `src/data/jc.js` — warning block added at top of file; `const PH = '[PLACEHOLDER] '` constant declared; all `desc`, `activities`, `mri_title`, `mri_prereqs`, and `mri_assoc` fields prefixed with `[PLACEHOLDER]`
  - `src/data/index.js` — `MODULE_CONFIG.jc.headerText` updated; WIP comment added above JC config entry
- Placeholder treatment makes it immediately clear in both source and UI that JC content is authored by a contributor and awaits review before client use

### Changed

- `index.html` — JC tab button updated with `tab-btn-placeholder` class and `⚠️` suffix
- `src/data/index.js` — `MODULE_CONFIG.jc.headerText` changed from `'Job Cost'` to `'Job Cost ⚠️ Placeholder Content'`
- `src/data/jc.js` — complete content rewrite: warning block, PH constant, all user-visible fields prefixed with `[PLACEHOLDER]`

---

## [1.2.0] — 2026-06-09

### Added — Corporate Accounts Receivable (CAR) Module

- New **Corporate Accounts Receivable (CAR)** module tab (`src/data/car.js`)
- 8 columns covering the full CAR functional taxonomy:
  1. Account Management
  2. Charges & Credits
  3. Payments & Receipts
  4. Batch Processing
  5. VAT & Tax
  6. Monthly Processing & Period Close
  7. Reporting
  8. Integration & System Impact
- Deep red (`#7a1a1a`) module banner — visually distinct from Accounts Payable blue
- CAR tab marked with amber `⚠️` styling and placeholder warning in the header to signal content requires review before client use
- All CAR process and sub-process fields prefixed with `[PLACEHOLDER]` in both source and UI
- CAR registered in `src/data/index.js` — included in `ALL_DATA`, `ORIGINAL_DATA`, and `MODULE_CONFIG`

### Added — Scope Tagging Feature

- New **CORE / CUSTOM / OUT OF SCOPE** tagging system for all processes and sub-processes across all modules
- **Scope filter bar** — strip below every module banner with toggles: All / ● CORE / ● CUSTOM / ● OUT OF SCOPE / Untagged
  - Live count chips showing tallies per scope for the current tab
  - Resets to "All" automatically on every tab switch
- **Scope badges on cards** — colour-coded pills on each tagged card (green = CORE, amber = CUSTOM, grey = OUT OF SCOPE)
  - Out-of-scope cards dimmed 58% with strikethrough title in view mode
  - Untagged cards show a faint `+ Tag` prompt in Edit Mode only
- **Quick-tap badge cycling** (Edit Mode) — click any badge to cycle: Untagged → CORE → CUSTOM → OUT OF SCOPE → Untagged
  - Every cycle is captured in the 20-step undo history
- **Bulk-tag column dropdown** (Edit Mode) — `⚐ Tag all ▾` button on every column header
  - Options: Tag all as CORE / CUSTOM / OUT OF SCOPE / Clear all tags
  - Sets scope on all processes **and** sub-processes in the column in one click
- **Scope badge in the detail panel** — clicking a process shows its scope alongside Process/MRI badges
- **Scope filtering in document export** (Generate Doc modal):
  - New "Include scope:" checkboxes — selectively include/exclude CORE, CUSTOM, OUT OF SCOPE, and Untagged items
  - **Scope summary table** at the top of every generated document (Total vs In-document counts per scope)
  - Inline scope badge on every process heading in Word and PDF output
- `scope` field added to the data schema — optional on all process and sub-process objects; `null` = untagged
- `state.scopeFilter` added to central state; scoped to current tab session (not persisted to localStorage versions — tags on items are persisted as part of the version snapshot)

### Changed

- `src/components/grid.js` — `makeItemEl` refactored to use a `card-title` span + scope badge layout; new `onScopeChange` and `onBulkTag` callbacks added to grid callback contract
- `src/components/panel.js` — `panel-badges` row extended with scope badge
- `src/components/genModal.js` — `buildDoc`, `downloadWord`, `downloadPDF` extended with scope filter logic and summary table generation
- `src/main.js` — `switchTab` resets `state.scopeFilter`; new `cycleScope` and `bulkTagColumn` helpers; scope filter bar event wiring added
- `src/styles/main.css` — ~150 lines of new styles for filter bar, scope badges, out-of-scope card states, bulk-tag dropdown, panel badge variants, and export summary table

---

## [1.1.0] — prior to 2026-06-09

### Added

- Column header height equalisation using double `requestAnimationFrame` for reliable cross-browser alignment
- Collaborator Setup Guide (`Collaborator-Setup-Guide.docx`)
- Version panel layout improvements

---

## [1.0.0] — initial release

### Added

- Browser-based interactive process map for MRI Software ERP implementations
- Four built-in modules: Commercial Management (CM), General Ledger (GL), Accounts Payable (AP), Residential Management (RM)
- Clickable process and sub-process cards with detail panel (Overview, Activities, MRI Prerequisites, Associated Screens)
- Edit Mode — add, edit, and remove columns, processes, and sub-processes in-browser
- Named version snapshots — save, load, rename, and delete client-specific versions (localStorage)
- 20-step undo history
- Reset to Original — restore any module or all modules to factory content
- Document export — Word (`.doc`) and PDF generation from current module or all modules
- Custom module tab creation via "+ Add Tab" button
- Vite 5.4 dev server with hot module replacement
- Vanilla JavaScript (ES modules) — no framework, no TypeScript, no backend
