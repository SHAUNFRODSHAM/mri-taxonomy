# Changelog

All notable changes to the MRI ERP Implementation Taxonomy are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

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
