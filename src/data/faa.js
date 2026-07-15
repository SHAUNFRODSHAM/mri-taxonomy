// ═══════════════════════════════════════════════════════════════════════════
// Fixed Asset Accounting (FAA) — Module Data
//
// Structured on the FAA Module Taxonomy (§3 Functional Taxonomy): 9 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// FAA is MRI's specialist fixed-asset solution (formerly Asset4000) that
// automates the full asset lifecycle — acquisition/capitalisation, depreciation,
// lifecycle transactions and disposal — with multi-book/multi-currency and full
// audit trail. It is architecturally DISTINCT from the native PMX sub-ledgers:
// it connects to PMX via a connection set up and migrated by MRI Global
// Professional Services (GPS). It receives cost data (AP invoices, Job Cost
// CWIP), calculates depreciation and posts journals back to GL.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI FAA SME before client delivery.
//
// Source reference: MRI PMX Fixed Asset Accounting (FAA) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const faa = [

  /* ── 1. SYSTEMS LANDSCAPE & SETUP ────────────────────────────────────────── */
  {
    id: 'faa-setup',
    title: 'Systems Landscape & Setup',
    processes: [
      {
        id: 'faa-setup-config',
        title: 'System Configuration & Roles',
        type: 'process',
        desc: 'The core FAA system setup and the access controls around it — categories, transaction types, user roles and segregation of duties. Because depreciation errors are silent and compounding, disciplined setup and control here is essential.',
        activities: [
          'Configure core FAA (asset categories, transaction types)',
          'Set up user roles and role-based access aligned to the asset-management team',
          'Enforce segregation of duties across creation, approval and posting of asset transactions',
        ],
        mri_title: 'System Configuration (FAA > System Configuration)',
        mri_prereqs: [
          'FAA licensed and provisioned',
        ],
        mri_assoc: [
          { name: 'FAA > System Configuration', desc: 'Core setup — categories and transaction types' },
        ],
        subs: [
          {
            id: 'faa-setup-config-system',
            title: 'System Configuration',
            desc: 'Core FAA configuration of categories and transaction types.',
            activities: [
              'Configure asset categories',
              'Define transaction types',
            ],
            mri_title: 'FAA > System Configuration',
            mri_assoc: [
              { name: 'FAA > System Configuration', desc: 'System configuration' },
            ],
          },
          {
            id: 'faa-setup-config-roles',
            title: 'Roles & Segregation of Duties',
            desc: 'Role-based access and separation of creation/approval/posting.',
            activities: [
              'Assign roles and permissions',
              'Separate creation, approval and posting duties',
            ],
            mri_title: 'FAA > System Configuration',
            mri_assoc: [
              { name: 'FAA > System Configuration', desc: 'Roles and access control' },
            ],
          },
        ],
      },
      {
        id: 'faa-setup-connection',
        title: 'GPS Connection & Consolidation',
        type: 'process',
        desc: 'Standing up the PMX↔FAA connection and consolidating fragmented asset registers into one. The connection must be set up and migrated by MRI Global Professional Services (GPS) — a hard prerequisite for pre-10.7 upgrades.',
        activities: [
          'Engage MRI Global Professional Services (GPS) to set up/migrate the PMX↔FAA connection',
          'Consolidate current asset registers (GL, spreadsheets, standalone) into the centralised FAA register',
        ],
        mri_title: 'PMX↔FAA Connection (managed by MRI Global Professional Services)',
        mri_prereqs: [
          'MRI GPS engagement scheduled (required for upgrades from pre-10.7)',
        ],
        mri_assoc: [
          { name: 'FAA > System Configuration', desc: 'Consolidation of existing registers into FAA' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. ASSET REGISTER & CLASSIFICATION ──────────────────────────────────── */
  {
    id: 'faa-register',
    title: 'Asset Register & Classification',
    processes: [
      {
        id: 'faa-register-structure',
        title: 'Register Structure & Categories',
        type: 'process',
        desc: 'The centralised asset register and the categories that classify assets for reporting, depreciation and compliance. A single, well-segmented register replaces fragmented spreadsheets and standalone systems.',
        activities: [
          'Establish a centralised register across entities and portfolios with flexible segmentation',
          'Configure asset categories (land, buildings, equipment, fit-out) for classification',
        ],
        mri_title: 'Asset Register (FAA > Assets)',
        mri_prereqs: [
          'System configuration complete (categories defined)',
        ],
        mri_assoc: [
          { name: 'FAA > Assets', desc: 'Centralised asset register and categorisation' },
        ],
        subs: [],
      },
      {
        id: 'faa-register-hierarchy',
        title: 'Hierarchy & Component Accounting',
        type: 'process',
        desc: 'Arranging assets in parent/child hierarchies and splitting buildings into components (lifts, HVAC, structure), each with its own depreciation profile. Component accounting is critical for IAS 16 componentisation.',
        activities: [
          'Build parent-child asset hierarchies (e.g. building vs its components)',
          'Split buildings into major components, each with a separate depreciation profile',
        ],
        mri_title: 'Asset Register — Hierarchy (FAA > Assets)',
        mri_prereqs: [
          'Asset categories configured',
        ],
        mri_assoc: [
          { name: 'FAA > Assets', desc: 'Parent/child hierarchy and component accounting' },
        ],
        subs: [],
      },
      {
        id: 'faa-register-identify',
        title: 'Identification, Location & Attributes',
        type: 'process',
        desc: 'The identity, whereabouts and full attribute history of each asset — codes/tags, location, and the auditable record (cost, supplier, serial, warranty, status). This is what makes physical audit and a complete asset record possible.',
        activities: [
          'Assign unique codes/tags/barcodes with naming standards; support bar-code scanning for physical audit',
          'Track asset location (property, unit, room) and handle movements',
          'Maintain full attributes (cost, supplier, serial, warranty, status, history) and navigate via the Asset Browser',
        ],
        mri_title: 'Asset Browser (FAA > Asset Browser)',
        mri_prereqs: [
          'Assets created in the register',
        ],
        mri_assoc: [
          { name: 'FAA > Asset Browser', desc: 'Navigate, view, tag and locate assets' },
          { name: 'FAA > Assets', desc: 'Asset attributes and document management' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. ACQUISITION & CAPITALISATION ─────────────────────────────────────── */
  {
    id: 'faa-acquisition',
    title: 'Acquisition & Capitalisation',
    processes: [
      {
        id: 'faa-acquisition-policy',
        title: 'Capitalisation Policy',
        type: 'process',
        desc: 'The configurable threshold that decides what is capitalised vs expensed — the policy FAA defines and AP applies at invoice entry. Getting this right is what keeps capex and opex correctly split at source.',
        activities: [
          'Define the capitalisation threshold (may vary by category/entity) that distinguishes capex from expense',
          'Communicate the policy so AP applies it when coding invoices',
        ],
        mri_title: 'Capitalisation Policy (FAA > System Configuration)',
        mri_prereqs: [
          'Asset categories established',
        ],
        mri_assoc: [
          { name: 'FAA > System Configuration', desc: 'Capitalisation threshold configuration' },
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'AP applies the capitalisation threshold at invoice entry' },
        ],
        subs: [],
      },
      {
        id: 'faa-acquisition-create',
        title: 'Asset Creation & CWIP',
        type: 'process',
        desc: 'Bringing assets onto the register — from AP invoices, Job Cost, manual entry or import — and accumulating capital work-in-progress until projects complete. GL defines the WIP accounts; FAA manages the CWIP-to-asset capitalisation.',
        activities: [
          'Create assets from capitalised AP invoices, Job Cost, manual entry or external-file import',
          'Accumulate capital WIP (CWIP) and transfer completed projects to finished assets',
          'Route capital additions through the configurable approval workflow',
        ],
        mri_title: 'Asset Creation (FAA > Assets)',
        mri_prereqs: [
          'Capitalisation policy set; GL WIP accounts defined; Job Cost CWIP available where used',
        ],
        mri_assoc: [
          { name: 'FAA > Assets', desc: 'Asset creation, single input screen and approval' },
          { name: 'Job Cost > Manage Jobs', desc: 'CWIP-to-asset capitalisation from completed projects' },
        ],
        subs: [
          {
            id: 'faa-acquisition-create-create',
            title: 'Asset Creation',
            desc: 'Creating assets from AP, Job Cost, manual entry or import.',
            activities: [
              'Create assets from AP invoices and Job Cost',
              'Import assets from external files; use the single input screen',
            ],
            mri_title: 'FAA > Assets',
            mri_assoc: [
              { name: 'FAA > Assets', desc: 'Asset creation' },
            ],
          },
          {
            id: 'faa-acquisition-create-cwip',
            title: 'CWIP & Approval',
            desc: 'Capital WIP accumulation and the capex approval workflow.',
            activities: [
              'Accumulate CWIP and capitalise on completion',
              'Route additions through the approval workflow',
            ],
            mri_title: 'FAA > Assets',
            mri_assoc: [
              { name: 'FAA > Assets', desc: 'CWIP and approval workflow' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. DEPRECIATION ─────────────────────────────────────────────────────── */
  {
    id: 'faa-depreciation',
    title: 'Depreciation',
    processes: [
      {
        id: 'faa-depreciation-methods',
        title: 'Methods, Useful Life & Residuals',
        type: 'process',
        desc: 'The depreciation basis for each asset — method, useful life and residual value. These parameters drive the depreciable base, so they must be set accurately and reviewed periodically.',
        activities: [
          'Apply standard/user-definable methods (straight-line, reducing balance) by asset, group and period',
          'Configure and maintain useful lives',
          'Track and periodically review residual values for a correct depreciable base',
        ],
        mri_title: 'Depreciation (FAA > Depreciation)',
        mri_prereqs: [
          'Assets created with cost and category',
        ],
        mri_assoc: [
          { name: 'FAA > Depreciation', desc: 'Methods, useful lives and residual values' },
        ],
        subs: [],
      },
      {
        id: 'faa-depreciation-posting',
        title: 'Posting & Forecasting',
        type: 'process',
        desc: 'Running depreciation and looking ahead — automated calculation/posting across periods and books, plus forecasting for budgeting. Automation eliminates manual journals; forecasts feed the B&F opex budget.',
        activities: [
          'Calculate and post depreciation automatically for any period/range across multiple books',
          'Forecast depreciation for budgeting and planning (feeds the B&F opex budget)',
          'Retain costs for past periods and generate for current/future periods',
        ],
        mri_title: 'Depreciation — Posting (FAA > Depreciation)',
        mri_prereqs: [
          'Depreciation methods, useful lives and residuals configured',
        ],
        mri_assoc: [
          { name: 'FAA > Depreciation', desc: 'Automated depreciation calculation and posting' },
          { name: 'Budgeting and Forecasting > GL Workbook', desc: 'Depreciation forecast feeds the opex budget' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 5. MULTI-BOOK, MULTI-CURRENCY & COMPLIANCE ──────────────────────────── */
  {
    id: 'faa-multibook',
    title: 'Multi-Book, Multi-Currency & Compliance',
    processes: [
      {
        id: 'faa-multibook-books',
        title: 'Multi-Book & Accounting Standards',
        type: 'process',
        desc: 'Holding parallel sets of figures against each asset (IFRS, tax) for reporting under multiple standards. Multi-book is what lets one register satisfy IFRS, US GAAP, GASB and local tax simultaneously.',
        activities: [
          'Maintain multiple books (IFRS, tax) with separate figures per asset',
          'Configure book codes for parallel reporting',
          'Comply with IFRS, IAS 16 (PP&E), IAS 40 (Investment Property), US GAAP, GASB, SOX and FASB',
        ],
        mri_title: 'Book Code Configuration (FAA > Book Codes)',
        mri_prereqs: [
          'Applicable accounting standards agreed with finance',
        ],
        mri_assoc: [
          { name: 'FAA > Book Codes', desc: 'Multi-book configuration for parallel reporting' },
        ],
        subs: [],
      },
      {
        id: 'faa-multibook-currency',
        title: 'Multi-Currency & Audit Trail',
        type: 'process',
        desc: 'Managing assets across currencies and companies, with a full audit file behind every action. Multi-currency supports regional consolidation; the audit trail underpins SOX compliance.',
        activities: [
          'Manage assets in multiple currencies with translation/consolidation across regions',
          'Support multi-company and multi-lingual operation',
          'Maintain a full audit file (which records changed, before/after detail) for SOX',
        ],
        mri_title: 'Multi-Currency & Audit (FAA > System Configuration)',
        mri_prereqs: [
          'Currencies and companies configured',
        ],
        mri_assoc: [
          { name: 'FAA > System Configuration', desc: 'Multi-currency/company and audit-trail settings' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 6. ASSET LIFECYCLE TRANSACTIONS ─────────────────────────────────────── */
  {
    id: 'faa-lifecycle',
    title: 'Asset Lifecycle Transactions',
    processes: [
      {
        id: 'faa-lifecycle-transfers',
        title: 'Transfers & Revaluations',
        type: 'process',
        desc: 'Moving assets between entities/locations and restating their carrying value. Inter-entity transfers create intercompany GL entries; revaluations record gains/losses (with CM valuation data feeding the accounting treatment).',
        activities: [
          'Process inter-entity and location transfers (transfer rules drive GL intercompany accounting)',
          'Run revaluations and record revaluation gains/losses (from CM valuation data)',
        ],
        mri_title: 'Transactions — Transfers/Revaluations (FAA > Transactions)',
        mri_prereqs: [
          'Assets on the register; GL intercompany accounting design aligned with transfer rules',
        ],
        mri_assoc: [
          { name: 'FAA > Transactions', desc: 'Transfers and revaluations' },
        ],
        subs: [],
      },
      {
        id: 'faa-lifecycle-adjust',
        title: 'Enhancements, Splits, Relifes & Impairment',
        type: 'process',
        desc: 'The mid-life adjustments to an asset — improvements, cost adjustments, splits, useful-life resets and impairments. These keep the register accurate as assets are enhanced, reclassified or impaired.',
        activities: [
          'Record enhancements/refurbishments (expensed vs capitalised) and cost adjustments',
          'Perform asset splits (partial sale/reclassification) allocating cost and depreciation',
          'Relife assets (reset useful life) and identify/record impairments and reversals',
        ],
        mri_title: 'Transactions — Adjustments (FAA > Transactions)',
        mri_prereqs: [
          'Assets on the register with depreciation running',
        ],
        mri_assoc: [
          { name: 'FAA > Transactions', desc: 'Enhancements, splits, relifes and impairment' },
        ],
        subs: [
          {
            id: 'faa-lifecycle-adjust-enhance',
            title: 'Enhancements & Cost Adjustments',
            desc: 'Improvements/refurbishments and asset cost adjustments.',
            activities: [
              'Record enhancements (expensed vs capitalised)',
              'Adjust asset cost values',
            ],
            mri_title: 'FAA > Transactions',
            mri_assoc: [
              { name: 'FAA > Transactions', desc: 'Enhancements and cost adjustments' },
            ],
          },
          {
            id: 'faa-lifecycle-adjust-impair',
            title: 'Splits, Relifes & Impairment',
            desc: 'Asset splits, useful-life resets and impairment recording.',
            activities: [
              'Split assets and reallocate cost/depreciation',
              'Relife assets and record impairments/reversals',
            ],
            mri_title: 'FAA > Transactions',
            mri_assoc: [
              { name: 'FAA > Transactions', desc: 'Splits, relifes and impairment' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 7. DISPOSALS ────────────────────────────────────────────────────────── */
  {
    id: 'faa-disposals',
    title: 'Disposals',
    processes: [
      {
        id: 'faa-disposals-main',
        title: 'Disposals & Write-Offs',
        type: 'process',
        desc: 'Removing assets from the register at end of life and recognising the accounting result. CM often initiates the disposal operationally; FAA processes the accounting — automatic gain/loss on disposal.',
        activities: [
          'Process full disposals with automatic gain/loss recognition',
          'Process partial disposals (proportional removal of value)',
          'Write off obsolete/scrapped assets and track disposal authorisation and proceeds',
        ],
        mri_title: 'Transactions — Disposals (FAA > Transactions)',
        mri_prereqs: [
          'Disposal authorisation obtained; CM disposal initiated where applicable',
        ],
        mri_assoc: [
          { name: 'FAA > Transactions', desc: 'Full/partial disposal, write-offs and authorisation' },
        ],
        subs: [
          {
            id: 'faa-disposals-main-full',
            title: 'Full & Partial Disposal',
            desc: 'Disposing of all or part of an asset with gain/loss recognition.',
            activities: [
              'Process full disposal with automatic gain/loss',
              'Process partial disposal proportionally',
            ],
            mri_title: 'FAA > Transactions',
            mri_assoc: [
              { name: 'FAA > Transactions', desc: 'Full and partial disposal' },
            ],
          },
          {
            id: 'faa-disposals-main-writeoff',
            title: 'Write-Offs & Authorisation',
            desc: 'Writing off scrapped assets and tracking disposal authorisation/proceeds.',
            activities: [
              'Write off obsolete or scrapped assets',
              'Track disposal authorisation and proceeds',
            ],
            mri_title: 'FAA > Transactions',
            mri_assoc: [
              { name: 'FAA > Transactions', desc: 'Write-offs and disposal authorisation' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 8. REPORTING & ANALYTICS ────────────────────────────────────────────── */
  {
    id: 'faa-reporting',
    title: 'Reporting & Analytics',
    processes: [
      {
        id: 'faa-reporting-register',
        title: 'Asset & Depreciation Reports',
        type: 'process',
        desc: 'The core register and depreciation reporting, plus the exportable fixed asset register that interfaces with finance/ERP systems. These give the complete status, history and depreciation picture across books.',
        activities: [
          'Run asset register reports (status, history, location)',
          'Run depreciation reports by period/range across multiple books, plus capex and disposals',
          'Export the Fixed Asset Register to spreadsheet packages and finance/ERP systems',
        ],
        mri_title: 'Reports (FAA > Reports)',
        mri_prereqs: [
          'Assets and depreciation posted for the period',
        ],
        mri_assoc: [
          { name: 'FAA > Reports', desc: 'Asset register and depreciation reporting/export' },
        ],
        subs: [],
      },
      {
        id: 'faa-reporting-audit',
        title: 'Audit, Forecasting & Capex Control',
        type: 'process',
        desc: 'The assurance and forward-looking side of FAA reporting — audit trails, depreciation forecasting/modelling and capex control. These support audit compliance and capital planning.',
        activities: [
          'Produce full audit-trail/historical reports for audit compliance',
          'Run depreciation forecasting and modelling',
          'Support capital-expenditure control and physical asset auditing',
        ],
        mri_title: 'Reports — Audit & Forecast (FAA > Reports)',
        mri_prereqs: [
          'Asset transactions and depreciation history available',
        ],
        mri_assoc: [
          { name: 'FAA > Reports', desc: 'Audit reports, forecasting and capex control' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 9. INTEGRATION & SYSTEM IMPACT ──────────────────────────────────────── */
  {
    id: 'faa-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'faa-integration-gl',
        title: 'GL, AP & Job Cost Integration',
        type: 'process',
        desc: 'The inbound cost feeds and outbound journal posting that connect FAA to the accounting core — AP capitalised invoices and Job Cost CWIP in; depreciation/revaluation/disposal journals out to GL.',
        activities: [
          'Post depreciation, revaluation and disposal journals to the GL',
          'Create assets from capitalised AP invoices (per the capitalisation threshold)',
          'Capitalise completed Job Cost CWIP into finished assets',
        ],
        mri_title: 'Integration (FAA ↔ GL / AP / Job Cost)',
        mri_prereqs: [
          'GPS-managed PMX↔FAA connection in place; GL WIP accounts defined',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'FAA journals posted to GL' },
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'Asset creation from capitalised AP invoices' },
        ],
        subs: [],
      },
      {
        id: 'faa-integration-other',
        title: 'CM, B&F & External Interfaces',
        type: 'process',
        desc: 'The wider connections — CM valuation/disposal data into FAA accounting, depreciation forecasts into B&F, and standard interfaces to spreadsheets and ERP systems, all over the GPS-managed connection.',
        activities: [
          'Take CM valuation/disposal data into the FAA accounting treatment',
          'Feed depreciation forecasts into the B&F opex budget',
          'Use standard interfaces to Excel and leading finance/ERP systems (via the GPS-managed connection)',
        ],
        mri_title: 'Integration (FAA ↔ CM / B&F / external)',
        mri_prereqs: [
          'GPS-managed connection configured',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > GL Workbook', desc: 'Depreciation forecast into the opex budget' },
        ],
        subs: [],
      },
    ],
  },

];
