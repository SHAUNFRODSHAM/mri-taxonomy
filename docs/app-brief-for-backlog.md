# App Briefing — for generating Epics / Features / User Stories

> **Paste everything below (from "PROMPT FOR CLAUDE" onward) into a new Claude chat.**
> It is fully self-contained — the reviewing Claude does not need code access.

---

## PROMPT FOR CLAUDE

You are a senior business analyst / product owner. Below is a complete description of a
web application called the **ERP Implementation Taxonomy** (built by Open Box Software for
commercial real estate ERP implementations).

Using **only** the information provided, produce a delivery backlog structured for
**Azure DevOps (Agile process)** using its work-item hierarchy:

- **Epic** → **Feature** → **User Story** → **Task** (only add Tasks where they add clarity)

Follow Azure DevOps conventions:

1. **Work item types & hierarchy** — every item has a Work Item Type (Epic / Feature /
   User Story / Task) and a **Parent** (the title of its parent). Epics = major capability
   areas; Features = shippable capabilities under an epic; User Stories in the form
   *"As a `<role>`, I want `<capability>`, so that `<benefit>`."*
2. **Fields per item** — Title, Description, and for User Stories an **Acceptance Criteria**
   field written as **Gherkin** (`Given / When / Then`, one or more scenarios).
3. **Estimation & priority** — put **Story Points** on user stories (Fibonacci: 1,2,3,5,8,13),
   a numeric **Priority** (1–4), and **Tags** (semicolon-separated, e.g.
   `business-view; linkage; MoSCoW-Must`). Encode MoSCoW as a tag.
4. **Roles** to use: Implementation Consultant, Business Analyst, Client SME / Reviewer,
   Engagement Lead, (future) Product Admin.

Write as-built behaviour for implemented capabilities; mark future/placeholder items with a
`future` or `placeholder` tag and (for future work) State = New. Keep stories testable.

**Output in two parts:**

- **Part A — Readable hierarchy:** the full Epic → Feature → User Story (→ Task) outline with
  descriptions, acceptance criteria, points, priority and tags, so it can be reviewed.
- **Part B — Azure DevOps import CSV:** a single CSV block ready for **Azure DevOps → Boards →
  Work Items → Import**, with these columns (header row exactly):

  `Work Item Type,Title,Description,Acceptance Criteria,Story Points,Priority,Tags,Parent`

  Rules for the CSV: one row per work item; order parents before children; `Parent` holds the
  parent item's **Title** (blank for Epics); wrap any field containing commas, quotes or
  newlines in double quotes and escape embedded quotes by doubling them (`""`); keep
  Acceptance Criteria as readable Gherkin (use `\n` line breaks inside the quoted cell).

Finish Part A with a one-paragraph **suggested delivery sequencing** across the epics.

---

## 1. What the product is

A browser-based, interactive **process-taxonomy mapping tool** for commercial real estate
(CRE) ERP implementations. It helps consultants run discovery and scoping engagements by
mapping a client's **business processes** against the **system processes** of an ERP
(currently MRI Software's PMX; **Yardi is planned as a second ERP** to map against).

**Primary use case:** during a discovery workshop a consultant browses the business-process
taxonomy, tailors it to the client, maps each business process to where (and how fully) the
ERP supports it, tags scope, saves a client-specific version, and exports a document.

**Users:** implementation consultants, business analysts, client subject-matter experts,
engagement leads.

**Tech (context only, not for stories):** Vite + vanilla JS (ES modules), no backend;
client-specific "versions" persist in browser localStorage; content lives in JS data files.

## 2. The three views (top-level navigation)

The app has a view switcher with three perspectives over the same engagement:

1. **💼 Value Streams (Business Process View)** — *what the business does*, organised as CRE
   "Powered" value streams (default landing view).
2. **🗂️ MRI PMX System View** — *how the ERP supports it*, organised by MRI PMX modules.
3. **🔗 Mapping** — a **coverage matrix** showing where business value streams tie into
   system modules, including gap analysis (what the ERP does *not* cover).

Each view uses the same hierarchy: **Tab → Column → Card**, with a right-hand **detail
panel** when a card is clicked.

## 3. Business Process View — CRE Powered Value Streams

Structure: **Value Stream (L1) = tab · Process Group (L2) = column · Process (L3) = card.**
L3 cards start lightweight ("needs enrichment") and are enriched during discovery.

- **Lease to Cash** *(tenant revenue engine)* — Leasing & Deal Origination · Lease
  Administration & Abstraction · Rent Billing & Recurring Charges · Recoveries / CAM
  Management · Cash Collections & AR · Lessor Lease Accounting & Revenue Recognition ·
  Renewals, Options & Lease Events
- **Quote to Cash** *(non-tenant / corporate billing)* — Customer & Contract Management ·
  Quote & Order Management · Billing & Invoicing (Non-Tenant) · Service Revenue Recognition ·
  Collections & Cash Application
- **Acquire to Retire** *(investment & asset lifecycle)* — Investment Strategy & Sourcing ·
  Underwriting & Due Diligence · Acquisition / Deal Execution · Asset Onboarding &
  Capitalization · Ongoing Asset Management · Disposition / Retirement
- **Plan to Perform** *(portfolio planning & FP&A)* — Strategic & Portfolio Planning ·
  Budgeting & Forecasting · Performance Management & Analytics
- **Source to Pay** *(procurement)* — Source to Contract · Procure to Pay · Property Expense
  Management
- **Project to Result** *(development & capital projects)* — Development & Entitlements ·
  Capital Project & Construction Mgmt · Project Close & Capitalization
- **Record to Report** *(accounting)* — Transaction Processing & Sub-ledgers · Property &
  Fund Accounting · Close & Consolidation · Financial, Regulatory & Investor Reporting
- **Treasury & Debt Management** — Cash & Liquidity Management · Debt & Capital Markets ·
  Risk & Hedging
- **Property & Facilities Operations** *(operate)* — Property Management Operations ·
  Facilities & Maintenance Management · Space & Occupancy Management · ESG & Sustainability
  Operations
- **Hire to Retire** *(supporting/enabling — workforce)* — Workforce Lifecycle

Each L3 card can carry: a description, activities, **Market variation** (UK / US /
Pan-European), **Vertical / sector detail** (Retail / Industrial / Office / Residential),
and **Standards & frameworks** (e.g. IFRS 16, ASC 842, EPRA). A card is flagged
"needs enrichment" until this detail is filled.

## 4. MRI PMX System View — modules

Organised by MRI PMX module (tab) → functional area (column) → process (card) → optional
sub-process. Each system process carries: description, activities, **MRI screen title /
navigation path**, **setup prerequisites**, and **associated MRI screens**.

- **Commercial Management (CM)** — 10 areas incl. Lease Lifecycle, Tenant Onboarding,
  Tenant Billing & Revenue, Lease Incentives, Cash Collections & AR, Operating Expense
  Recovery, Retail Tenant Management, Straight-Line Rent & Compliance, Building & Property
  Setup, Period-End Close & Reporting. *(Richest module.)*
- **General Ledger (GL)** — Financial Structure & Entity Governance, Journals & Period
  Accounting, Budget Planning & Control, Financial Close, Reporting & Analysis.
- **Accounts Payable (AP)** — Supplier Management, Invoice Approval, Invoice Management,
  Payment Execution, Reconciliation & Controls, Compliance & Statutory Reporting.
- **Residential Management (RM)** — Leasing & Prospect, Resident Lifecycle, Residential
  Billing & Collections, Security Deposit, Maintenance & Operations, Vendor & Payables,
  Month-End & Close.
- **Job Cost (JC)** — Setup, Job Management, Budget, Contract Management, Contractor
  Payments, Reporting. *(Placeholder content pending SME review.)*
- **Corporate Accounts Receivable (CAR)** — Account Management, Charges & Credits, Payments
  & Receipts, Batch Processing, VAT & Tax, Period Close, Reporting, Integration.
  *(Placeholder.)*
- **Budgeting & Forecasting (B&F)** — Process & Ownership, Structure, Creation, Assumptions,
  Variance, Reporting, Integration, Setup. *(Placeholder.)*

Some modules are **placeholder** (JC, CAR, B&F) — visibly flagged as awaiting review.

## 5. Mapping View — business ⇄ system coverage

- A **matrix**: rows = value-stream process groups; columns = MRI PMX modules.
- Each cell shows the **number of links** between that value-stream group and that system
  module; click a cell to see the specific business↔system process pairs.
- **Gap analysis:** groups with no system counterpart are flagged (e.g. Acquire-to-Retire
  investment stages, Treasury debt/risk, ESG, HR — not covered by MRI PMX). This shows
  exactly where the ERP does *not* support a value stream.
- Legend/summary shows overall coverage (e.g. "31/39 groups mapped").

## 6. The linkage model (business ⇄ system)

- Each business (L3) process can link to one or more system processes ("**Delivered in MRI
  PMX by →**"); the system process shows the reverse ("**Supports Business Processes →**").
- Clicking a link **navigates** to the counterpart in the other view and opens its detail.
- Each link carries a **coverage status**: **Full** (fully in the system) · **Partial**
  (only part of the process touches the system) · **Outside** (managed manually / outside
  the ERP). Colour-coded in the matrix.
- Links are **editable** ("Edit Links" mode): add a link via a process picker, remove a
  link, cycle its coverage. Links are **saved per client version**.
- A default/seed mapping ships out of the box and is refined per engagement.

## 7. Cross-cutting features (apply across views)

- **Filters (business view):** multi-select **Market** (UK/US/EU) and **Vertical**
  (Retail/Industrial/Office/Residential) dropdowns; the selection drives what the detail
  panel shows (one block per selected market, one colour-tagged row per selected sector).
- **Scope tagging (system view):** tag each process **CORE / CUSTOM / OUT OF SCOPE**; filter
  bar with live counts; bulk-tag a whole column; scope shown as badges and in the panel;
  out-of-scope items dimmed.
- **Edit Mode:** add / edit / remove columns, processes and sub-processes in-browser; a
  business edit form captures market/vertical/standards; a system edit form captures MRI
  screen/prereqs/associated screens.
- **Client Versions:** save a named snapshot (localStorage); load / rename / delete; each
  version captures **system content + business content + links + scope tags + module
  visibility** — i.e. one saved version = one client across all views. **Undo** (20 steps),
  and **Reset to original** factory content.
- **Module / stream visibility:** toggle which modules/tabs are visible for a client (e.g.
  hide modules out of scope); saved per version; also drives what's exported.
- **Document generation:** export to **Word** and **PDF**, for the current tab or all
  visible tabs. System docs include a scope summary table and respect scope tags; business
  docs include Market/Vertical/Standards and respect the market/vertical selection.
- **Tab overflow:** horizontal-scrolling tab bar when there are many modules/streams.

## 8. Known placeholders & future direction

- **Placeholder modules:** Job Cost, Corporate AR, and Budgeting & Forecasting contain
  provisional content flagged for SME review.
- **Enrichment:** business value-stream L3 cards start as skeletons ("needs enrichment") to
  be filled (descriptions, market/vertical/standards) during discovery.
- **Multi-ERP (future):** the System view is currently MRI PMX only; **Yardi** is planned as
  an additional ERP to map the same business processes against (implying an ERP selector and
  a second system taxonomy + link set).
- **Sharing versions (future):** versions are browser-local today; a proper export/import or
  shared-storage mechanism would let engagements be shared between machines/users.

## 9. Notable constraints / non-goals (for realistic stories)

- No backend / no authentication today; persistence is browser localStorage.
- Not a system-of-record; it's a discovery, scoping, and communication tool.
- Content accuracy depends on SME review (hence placeholder/enrichment flags).

---

*End of briefing. Ask Claude to produce the epics/features/user-stories per the PROMPT above.*
