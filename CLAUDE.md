# MRI ERP Implementation Taxonomy — CLAUDE.md

## What this project is

A browser-based interactive process map for MRI Software ERP implementations. It gives
implementation consultants a structured, clickable taxonomy of business processes across
four MRI modules — Commercial Management (CM), General Ledger (GL), Accounts Payable (AP),
and Residential Management (RM).

**The primary use case:** A consultant opens the app, navigates to a module and process,
and sees what the business does, what MRI setup is needed first, and which MRI screens
support that process. They can customise the content in Edit Mode, save named client-specific
versions, and export a Word or PDF document for client delivery.

---

## Tech stack

- **Vite 5.4** + vanilla JavaScript (ES modules, no framework)
- **No TypeScript** — plain `.js` files throughout
- **No backend** — entirely client-side; versions are persisted in `localStorage`
- CSS in `src/styles/main.css`

### Running locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Project structure

```
index.html              # Shell — tab bar, topbar, canvas. Static HTML for built-in tabs.
src/
  main.js               # App bootstrap, event wiring, tab switching, undo/redo, versions
  state.js              # Central state object + helpers (snapshot, findItem, currentData)
  versions.js           # localStorage CRUD for named version snapshots
  data/
    index.js            # Registers all modules — the ONLY file that exports ALL_DATA,
    │                   # ORIGINAL_DATA, and MODULE_CONFIG
    cm.js               # Commercial Management data
    gl.js               # General Ledger data
    ap.js               # Accounts Payable data
    rm.js               # Residential Management data
  components/
    grid.js             # Renders the column/process/sub card grid
    panel.js            # Right-side detail panel (shown on item click)
    editModal.js        # In-place edit modal for any item field
    addModal.js         # Add column / process / sub modal + add custom tab modal
    genModal.js         # Generate Doc modal — Word and PDF export
    versionMenu.js      # Versions side panel (save, load, rename, delete)
  styles/
    main.css            # All styles — layout, cards, panel, topbar, modals
```

---

## Data schema

Everything in the app is driven by the data files. Each module file exports a **flat array
of column objects**. A column contains processes; processes optionally contain subs.

```js
// Column (top-level grouping — rendered as a column header)
{
  id: 'cm-lease',                // unique string, kebab-case
  title: 'Lease Lifecycle Management',
  processes: [ /* Process[] */ ],
}

// Process (the main clickable card in a column)
{
  id: 'cm-lease-origination',   // unique string, kebab-case
  title: 'New Lease Origination',
  type: 'process',              // always 'process' on top-level items
  desc: 'What the business does and why it matters — NOT what to click in MRI.',
  activities: [
    'Business-level activity (what a person does, not a menu click)',
    'Another activity...',
  ],
  mri_title:   'Lease Setup (CM > Setup > Leases)',          // MRI name + navigation path
  mri_prereqs: [                                             // System setup dependencies
    'Buildings and suites created with correct area and status',
    'Transaction classifications configured',
  ],
  mri_assoc: [                                               // MRI screens that support this
    { name: 'CM > Setup > Leases > General Tab',  desc: 'What this screen does in context' },
    { name: 'CM > Setup > Leases > Billing Tab',  desc: 'What this screen does in context' },
  ],
  subs: [ /* Sub[] — optional */ ],
}

// Sub-process (nested under a process — same shape, no `type` field, no nested subs)
{
  id: 'cm-lease-orig-suite',
  title: 'Suite & Asset Configuration',
  desc: '...',
  activities: [ '...' ],
  mri_title: '...',
  mri_prereqs: [ '...' ],
  mri_assoc: [ { name: '...', desc: '...' } ],
  // NO subs — sub-processes cannot be nested further
}
```

### ID conventions

- Column IDs: `{module}-{area}` e.g. `cm-lease`, `gl-journals`
- Process IDs: `{module}-{area}-{topic}` e.g. `cm-lease-origination`
- Sub IDs: `{module}-{area}-{topic}-{subtopic}` e.g. `cm-lease-orig-suite`
- All IDs must be **unique across the entire module file**. Duplicates cause rendering bugs.

---

## Content writing rules — READ THIS BEFORE EDITING ANY DATA FILE

### The golden rule: business process first, MRI second

The app is a **business process taxonomy**. MRI is the supporting tool, not the subject.

| Field | What it should describe |
|---|---|
| `title` | The business process name (not an MRI menu item) |
| `desc` | What the organisation does and why — the business rationale |
| `activities` | What a person *does* in the course of this process |
| `mri_title` | What MRI calls this + the navigation path |
| `mri_prereqs` | What must be configured in MRI *before* this process can work |
| `mri_assoc` | Specific MRI screens + what each one does in the context of this process |

**✓ Good activity:** `'Negotiate and agree lease terms with the tenant prior to commencement'`
**✗ Bad activity:** `'Set management options for each property'` ← this is a click path

**✓ Good activity:** `'Run the delinquency report weekly and follow up accounts over 30 days'`
**✗ Bad activity:** `'Navigate to CM > Monthly Activities > Late Fees'` ← still a click path

### mri_assoc format

Always use the full MRI navigation path as the `name`, with a description of what that
screen *does* for this specific process:

```js
{ name: 'CM > AR Activities > Batch Entry > Cash Receipts',
  desc: 'Manual receipt entry with automatic or guided application to open charge items' }
```

Not:
```js
{ name: 'Cash Receipts', desc: 'Used to enter cash receipts' }  // too vague
```

---

## The four built-in modules

| Key | File | Columns | Focus |
|-----|------|---------|-------|
| `cm` | `src/data/cm.js` | 7 | Lease Lifecycle, Billing, Collections, CAM Recovery, Retail, FASB, Period Close |
| `gl` | `src/data/gl.js` | 5 | Financial Structure, Journals, Budgets, Period/Year Close, Reporting |
| `ap` | `src/data/ap.js` | 6 | Supplier Mgmt, Invoice Approval, Invoice Mgmt, Payments, Reconciliation, Compliance |
| `rm` | `src/data/rm.js` | 7 | Leasing, Residents, Billing, Deposits, Maintenance, Vendor/AP, Month-End |

---

## How to add a new module

Three files need updating:

### 1. Create the data file

```js
// src/data/mymodule.js
export const mymodule = [
  {
    id: 'mm-col1',
    title: 'Column Title',
    processes: [
      {
        id: 'mm-col1-proc1',
        title: 'Process Title',
        type: 'process',
        desc: 'Business description...',
        activities: ['Activity 1', 'Activity 2'],
        mri_title: 'MRI > Navigation > Path',
        mri_prereqs: ['Prereq 1'],
        mri_assoc: [{ name: 'MRI > Screen', desc: 'What it does' }],
      },
    ],
  },
];
```

### 2. Register in `src/data/index.js`

```js
import { mymodule } from './mymodule.js';

export const ALL_DATA      = { cm, gl, ap, rm, mymodule };
export const ORIGINAL_DATA = Object.freeze({
  cm: JSON.parse(JSON.stringify(cm)),
  // ... existing ...
  mymodule: JSON.parse(JSON.stringify(mymodule)),
});
export const MODULE_CONFIG = {
  // ... existing ...
  mymodule: {
    label:          'My Module Name',
    headerClass:    'mymodule-header',
    headerText:     'My Module Name',
    colHeaderClass: '',
    icon:           '📋',
  },
};
```

### 3. Add tab button in `index.html`

```html
<button class="tab-btn" data-tab="mymodule">
  <span class="tab-icon">📋</span>My Module Name
</button>
```

### 4. Add header colour in `src/styles/main.css`

```css
.mymodule-header { background: #1a4a6a; }
```

---

## Versioning system

- Versions are stored in **`localStorage`** under key `mri_taxonomy_versions`
- Each version is a full deep-copy snapshot of `ALL_DATA` + any custom module configs
- `ORIGINAL_DATA` is a deep-frozen snapshot taken at **module load time** — it is the
  factory reset and is never modified at runtime
- Versions do **not** persist across browsers or machines — they only exist in the browser
  where they were saved
- To share a version between users, the data files themselves should be edited and committed
  to git, or a version export/import feature should be built

---

## Key runtime behaviours

| Behaviour | Where it lives |
|---|---|
| Tab switching | `switchTab()` in `main.js` |
| Edit mode (add/edit/remove items) | `toggleEdit()` in `main.js`; edit controls rendered by `grid.js` |
| Undo (up to 20 steps) | `snapshot()` in `state.js` saves before each mutation; `undo()` in `main.js` restores |
| Reset to original | `resetTab()` / `resetAll()` in `main.js` — restores from `ORIGINAL_DATA` |
| Version save/load | `versions.js` for CRUD; `loadVersion()` in `main.js` to apply |
| Document export | `genModal.js` — Word (`.doc` via mso HTML) and PDF (print dialog) |
| Detail panel | `panel.js` — shown on process/sub click, displays all four data fields |

---

## Collaboration notes for Claude Code users

- **Edit data files directly** (`src/data/*.js`) for content changes — this is the primary
  way to update module content
- **Commit and push** changes to git; other collaborators pull and their Claude Code reads
  this `CLAUDE.md` to get the same context
- **Do not edit `dist/`** — it is a generated build output, not source
- **localStorage versions** are not in git and do not transfer between users — treat the
  data files as the source of truth for content
- The dev server (Vite HMR) hot-reloads data file changes instantly — no restart needed

---

## MRI module source reference

Content is based on:
- **CM:** MRI Commercial Management Web Help v10.4 (November 2016)
- **AP:** MRI Accounts Payable Training Guide
- **GL:** MRI General Ledger Training Guide
- **RM:** MRI Residential Management Training Guide

Navigation paths use the format `Module > Menu > Sub-menu > Screen` throughout.
