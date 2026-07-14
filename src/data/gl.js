// ═══════════════════════════════════════════════════════════════════════════
// General Ledger (GL) — Module Data
//
// Structured on the GL Module Taxonomy (§3 Functional Taxonomy): 10 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// GL is the core accounting engine and financial single source of truth. Every
// sub-ledger (CM, RM, CAR, AP, JC, IA) posts journal entries INTO the GL, which
// then produces consolidated financial statements. GL always closes LAST, after
// all sub-ledgers. A client can run a standalone GL without a CM licence.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI GL SME before client delivery.
//
// Source reference: MRI PMX General Ledger (GL) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const gl = [

  /* ── 1. ENTITY SETUP & STRUCTURE ─────────────────────────────────────────── */
  {
    id: 'gl-entity',
    title: 'Entity Setup & Structure',
    processes: [
      {
        id: 'gl-framework-entity',
        title: 'Entities & Entity Types',
        type: 'process',
        desc: 'Setting up the legal entities that are the primary organising unit of the GL, and the entity types that let them roll up for consolidated reporting. Everything in the ledger is organised by entity, so this structure underpins security, processing and reporting.',
        activities: [
          'Create entities with their fiscal year, base currency and chart of accounts (via ledger code)',
          'Classify entities by type (GEN owner, FUN fund, POR portfolio, PRO property) for roll-up',
          'Group entities and apply account filtering to restrict accounts at entity level',
        ],
        mri_title: 'Entities (Setup and Maintenance > General Ledger > Entities)',
        mri_prereqs: [
          'Ledger code and chart of accounts available to assign to each entity',
          'Fiscal-year and base-currency conventions agreed',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger > Entities', desc: 'Legal-entity setup — fiscal year, currency, ledger code' },
          { name: 'Setup and Maintenance > General Ledger > Entity Types', desc: 'GEN/FUN/POR/PRO classifications for roll-up' },
        ],
        subs: [
          {
            id: 'gl-framework-entity-entities',
            title: 'Entities',
            desc: 'The legal-entity records that organise the ledger.',
            activities: [
              'Create entities with fiscal year and base currency',
              'Assign each entity its ledger code / chart of accounts',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Entities',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Entities', desc: 'Entity record maintenance' },
            ],
          },
          {
            id: 'gl-framework-entity-types',
            title: 'Entity Types & Groups',
            desc: 'Classifications and groupings that drive multi-entity roll-up and processing.',
            activities: [
              'Set entity types (GEN/FUN/POR/PRO)',
              'Group entities for reporting and processing',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Entity Types',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Entity Types', desc: 'Entity type and group setup' },
            ],
          },
        ],
      },
      {
        id: 'gl-entity-ownership',
        title: 'Ownership, Roll-ups & Departments',
        type: 'process',
        desc: 'Reflecting part-ownership in the numbers, reporting the same data at different levels, and tagging transactions by cost centre. Ownership percentages and roll-up hierarchies are what make consolidated portfolio and fund reporting accurate.',
        activities: [
          'Record ownership / minority interest so a part-held building rolls up at its owned percentage',
          'Define roll-up hierarchies to report the same GL data at property, fund and sector level',
          'Set up departments (cost centres) and GL projects, and entity attribute tabs (asset managers/clients)',
        ],
        mri_title: 'Entities — Ownership & Departments (Setup and Maintenance > General Ledger)',
        mri_prereqs: [
          'Entities and entity types established',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Ownership / minority-interest option' },
          { name: 'Setup and Maintenance > General Ledger > Departments', desc: 'Department (cost centre) field for GL transactions' },
        ],
        subs: [
          {
            id: 'gl-entity-ownership-interest',
            title: 'Ownership & Minority Interest',
            desc: 'Accounting for shared/part-owned buildings at the correct percentage.',
            activities: [
              'Record ownership percentages per entity/building',
              'Confirm roll-ups reflect the owned share',
            ],
            mri_title: 'Setup and Maintenance > Management Options > General Ledger',
            mri_assoc: [
              { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Ownership option' },
            ],
          },
          {
            id: 'gl-entity-ownership-rollup',
            title: 'Roll-ups & Departments',
            desc: 'Reporting hierarchies and cost-centre tagging.',
            activities: [
              'Build property/fund/sector roll-up hierarchies',
              'Set up departments and GL projects',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Departments',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Departments', desc: 'Department and roll-up setup' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 2. CHART OF ACCOUNTS & LEDGER CODES ─────────────────────────────────── */
  {
    id: 'gl-coa',
    title: 'Chart of Accounts & Ledger Codes',
    processes: [
      {
        id: 'gl-framework-coa',
        title: 'Chart of Accounts & Ledger Codes',
        type: 'process',
        desc: 'Designing the account structure that classifies every financial transaction. The ledger code defines a chart of accounts\' format; the chart itself is the set of accounts an entity posts to. A clean, well-considered chart is the foundation of meaningful financial reporting.',
        activities: [
          'Define ledger codes (account length/format) — retaining the MRI default "MR" code',
          'Build the chart of accounts with account types (asset, liability, equity, income, expense) and the primary retained-earnings account',
          'Assign a chart to each entity (one per entity; a chart can be shared across entities) and set up alternate/reporting charts to consolidate multiple charts',
        ],
        mri_title: 'Chart of Accounts (Setup and Maintenance > General Ledger > Charts of Accounts)',
        mri_prereqs: [
          'Account-numbering convention and account types agreed with finance',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger > Ledger Codes', desc: 'Ledger code (chart format) definition' },
          { name: 'Setup and Maintenance > General Ledger > Charts of Accounts', desc: 'Account structure, types and retained-earnings account' },
        ],
        subs: [
          {
            id: 'gl-framework-coa-ledgercodes',
            title: 'Ledger Codes & Format',
            desc: 'The ledger code that defines account length/format for a chart.',
            activities: [
              'Define ledger codes and account format',
              'Retain the default "MR" ledger code',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Ledger Codes',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Ledger Codes', desc: 'Ledger code setup' },
            ],
          },
          {
            id: 'gl-framework-coa-accounts',
            title: 'Accounts & Alternate Chart',
            desc: 'The account set, account types, and alternate reporting chart.',
            activities: [
              'Build accounts with types and retained-earnings account',
              'Map to an alternate chart for consolidation',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Charts of Accounts',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Charts of Accounts', desc: 'Chart and alternate-chart setup' },
            ],
          },
        ],
      },
      {
        id: 'gl-coa-access',
        title: 'Account Access & Migration',
        type: 'process',
        desc: 'Controlling who can post to which accounts, and safely re-mapping the chart when it changes. Account access groups enforce segregation; chart migration protects historical data when accounts are restructured.',
        activities: [
          'Group accounts into access groups for user security',
          'Set up GL job codes that link to Job Cost',
          'Run chart-of-accounts migration (GHIS, JOURNAL, GPRI, BUDGETS tables) when re-mapping accounts',
        ],
        mri_title: 'Account Access & Migration (Setup and Maintenance > General Ledger)',
        mri_prereqs: [
          'Chart of accounts established before defining access groups or migrating',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger > Charts of Accounts', desc: 'Account access groups' },
          { name: 'Setup and Maintenance > General Ledger > Job Codes', desc: 'GL job codes linking to Job Cost' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. JOURNAL ENTRY MANAGEMENT ─────────────────────────────────────────── */
  {
    id: 'gl-journals',
    title: 'Journal Entry Management',
    processes: [
      {
        id: 'gl-journals-operational',
        title: 'Manual & Multi-Entity Journals',
        type: 'process',
        desc: 'The core act of recording balanced financial transactions in the ledger — manual entries, multi- and inter-entity journals, and auto-reversing entries. Every journal must balance (debits = credits) and answers the who/what/when/where/why/how of a transaction.',
        activities: [
          'Enter manual journals, holding them unposted until reviewed, then posting to GL',
          'Create multi-entity and inter-entity journals (VAT clearing, sweepings, interest, fund payments) that keep accounts balanced',
          'Set up auto-reversing entries and choose the basis (accrual, cash, or both)',
        ],
        mri_title: 'Journal Entry Management (General Ledger > Journal Entry Management)',
        mri_prereqs: [
          'Entities and chart of accounts configured',
          'Basis codes and inter-entity accounts set up where used',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Add and post manual journal entries' },
          { name: 'General Ledger > Journal Processing > Add Journal Entry', desc: 'Multi-entity, auto-reversing and basis-code journals' },
        ],
        subs: [
          {
            id: 'gl-journals-operational-manual',
            title: 'Manual Entry & Posting',
            desc: 'Direct journal entry and the unposted → posted workflow.',
            activities: [
              'Enter balanced manual journals',
              'Review, then post to GL',
            ],
            mri_title: 'General Ledger > Journal Entry Management',
            mri_assoc: [
              { name: 'General Ledger > Journal Entry Management', desc: 'Manual JE entry and posting' },
            ],
          },
          {
            id: 'gl-journals-operational-interentity',
            title: 'Multi / Inter-Entity & Reversing',
            desc: 'Journals spanning entities, inter-entity movements and auto-reversing entries.',
            activities: [
              'Post multi-/inter-entity journals that stay balanced',
              'Configure auto-reversing entries and basis codes',
            ],
            mri_title: 'General Ledger > Journal Processing > Add Journal Entry',
            mri_assoc: [
              { name: 'General Ledger > Journal Processing', desc: 'Multi/inter-entity and reversing journals' },
            ],
          },
        ],
      },
      {
        id: 'gl-journals-subledger',
        title: 'Sub-Ledger Journals & Audit',
        type: 'process',
        desc: 'Receiving the automated journals every sub-ledger posts into the GL, and maintaining the audit trail over all journal activity. This is where the GL earns its "single source of truth" status — and where external auditors look first.',
        activities: [
          'Receive and review automated sub-ledger journals from CM, RM, CAR, AP, JC and IA',
          'Use source codes to identify the origin of each journal',
          'Enforce JE audit (USERID tracking), autonumbering and attachments for a clean audit trail',
        ],
        mri_title: 'Sub-Ledger Journals (General Ledger > Journal Entry Management)',
        mri_prereqs: [
          'Sub-ledgers configured to post to GL; source codes defined',
          'Require-JE-audit and autonumbering management options set',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Review of sub-ledger-originated journals' },
          { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Require JE audit and autonumbering options' },
        ],
        subs: [
          {
            id: 'gl-journals-subledger-auto',
            title: 'Sub-Ledger Journals',
            desc: 'Automated journals created from the sub-ledgers, tied back to their detail.',
            activities: [
              'Review sub-ledger journals posted to GL',
              'Use source codes to trace origin',
            ],
            mri_title: 'General Ledger > Journal Entry Management',
            mri_assoc: [
              { name: 'General Ledger > Journal Entry Management', desc: 'Sub-ledger journal review' },
            ],
          },
          {
            id: 'gl-journals-subledger-audit',
            title: 'JE Audit & Autonumbering',
            desc: 'Audit-trail controls over who actioned what, with autonumbering and attachments.',
            activities: [
              'Enforce JE audit (USERID) tracking',
              'Enable autonumbering and attach supporting documents',
            ],
            mri_title: 'Setup and Maintenance > Management Options > General Ledger',
            mri_assoc: [
              { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'JE audit and autonumbering' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. RECURRING ENTRIES & ALLOCATIONS ──────────────────────────────────── */
  {
    id: 'gl-recurring',
    title: 'Recurring Entries & Allocations',
    processes: [
      {
        id: 'gl-recurring-entries',
        title: 'Recurring Journals & Templates',
        type: 'process',
        desc: 'Automating regular, repeating journals so they are not re-keyed each period. Recurring entries and reusable templates cut month-end effort and reduce keying error.',
        activities: [
          'Set up recurring journals for regular identical transactions (generated based on the Last Period Created value at GL close)',
          'Build reusable JE templates and create entries from templates, allocations, accrued expenses or purchase orders',
        ],
        mri_title: 'Recurring Journals (General Ledger > Journal Entry Management)',
        mri_prereqs: [
          'Accounts and entities configured; recurring pattern agreed',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Recurring journal and template setup' },
        ],
        subs: [],
      },
      {
        id: 'gl-recurring-allocations',
        title: 'GL Allocations & Loan Schedules',
        type: 'process',
        desc: 'Splitting costs across entities or properties when the amounts vary period to period, and holding loan repayment schedules. Allocations handle shared costs (e.g. a landscaper billed differently each month) fairly and automatically.',
        activities: [
          'Set up GL allocations to split variable costs across entities/properties',
          'Maintain loan schedules on the recurring entry template page',
        ],
        mri_title: 'GL Allocations (General Ledger > Journal Entry Management > Allocations)',
        mri_prereqs: [
          'Recurring entry templates available',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Allocations and loan schedules' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 5. PRIOR PERIOD / YEAR & BALANCE FORWARD ────────────────────────────── */
  {
    id: 'gl-priorperiod',
    title: 'Prior Period / Year & Balance Forward',
    processes: [
      {
        id: 'gl-priorperiod-adjust',
        title: 'Prior Period / Prior Year Entries',
        type: 'process',
        desc: 'Making adjustments to already-closed periods or years — a controlled activity usually reserved for head office. PMX has no hard prior-period block by default, so the control is a business process rather than a system lock.',
        activities: [
          'Post prior-period and prior-year adjustments (saved to the GPRI temp table until posted)',
          'Restrict who can post PP/PY entries (typically head office / financial managers)',
        ],
        mri_title: 'PP/PY Entries (General Ledger > Journal Entry Management > PP/PY)',
        mri_prereqs: [
          'Authority controls agreed — PMX has no hard prior-period block by default',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Prior-period and prior-year entry' },
        ],
        subs: [],
      },
      {
        id: 'gl-priorperiod-balfwd',
        title: 'Balance Forward & Report Reprinting',
        type: 'process',
        desc: 'Correcting opening balances for a new year and managing the reporting consequences of any back-dated change. Any new transaction in a period makes previously-printed reports stale, so affected reports must be reprinted.',
        activities: [
          'Fix the starting balance for a new year via balance-forward records',
          'Reprint all affected-period financial reports after any prior-period change (GPRI temp table clears once posted)',
        ],
        mri_title: 'Balance Forward (General Ledger > Journal Entry Management)',
        mri_prereqs: [
          'Prior-period/year adjustment posted',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Balance-forward records' },
          { name: 'General Ledger > Reports', desc: 'Reprint affected-period financial reports' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 6. GL SEGMENTATION ──────────────────────────────────────────────────── */
  {
    id: 'gl-segmentation',
    title: 'GL Segmentation',
    processes: [
      {
        id: 'gl-segmentation-setup',
        title: 'Segmentation Setup',
        type: 'process',
        desc: 'Enabling and defining the segments that tag transactions for granular reporting beyond the account code. Segmentation lets the business report at, say, unit level without proliferating GL accounts.',
        activities: [
          'Enable GL segmentation (management option) to allow segment information on journals and invoices',
          'Define segment types — up to 20 user-defined segments, plus MRI table segments (BLDG, SUIT, LEAS, RMPROP, UNIT)',
          'Adopt enhanced segmentation (default from X.7.4) and plan the old→new migration',
        ],
        mri_title: 'GL Segmentation (Setup and Maintenance > Management Options > General Ledger)',
        mri_prereqs: [
          'Reporting requirements identified to decide the segment scheme',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Enable GL segmentation' },
          { name: 'Setup and Maintenance > General Ledger > Segments', desc: 'Segment type definitions' },
        ],
        subs: [],
      },
      {
        id: 'gl-segmentation-use',
        title: 'Segment Filtering & Reporting',
        type: 'process',
        desc: 'Using segments in day-to-day entry and reporting — filtering one segment by another, and understanding the current limitations. Segments cannot yet be made mandatory, so data quality relies on process.',
        activities: [
          'Filter one user-defined segment by another (e.g. SUIT filtered by BLDG)',
          'Apply segmentation on the new-experience JE and PP/PY pages',
          'Report at transaction level by segment for granular analysis, noting segments cannot currently be mandatory',
        ],
        mri_title: 'Segmentation in JE Pages (General Ledger > Journal Entry Management)',
        mri_prereqs: [
          'Segment types defined and segmentation enabled',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Segment entry and filtering on journals' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. BUDGETING IN THE GL ──────────────────────────────────────────────── */
  {
    id: 'gl-budgets',
    title: 'Budgeting in the GL',
    processes: [
      {
        id: 'gl-budgets-planning',
        title: 'GL Budgets & Import',
        type: 'process',
        desc: 'Holding budget figures by account, entity and period directly in the GL — the lighter-weight alternative to the full B&F module. This supports budget-to-actual reporting for clients that budget at GL level.',
        activities: [
          'Enter or import GL budgets by account, entity and period (BUDGETS table)',
          'Maintain multiple budget types (original, revised) and attach budget notes',
        ],
        mri_title: 'Budgets (General Ledger > Utilities > Budgets / Budget Import)',
        mri_prereqs: [
          'Chart of accounts and entities established',
        ],
        mri_assoc: [
          { name: 'General Ledger > Utilities > Budgets', desc: 'GL budget entry by account/entity/period' },
          { name: 'General Ledger > Utilities > Budget Import', desc: 'Import budgets from spreadsheet' },
        ],
        subs: [
          {
            id: 'gl-budgets-planning-entry',
            title: 'Budget Entry & Import',
            desc: 'Entering or importing GL budget figures.',
            activities: [
              'Enter budgets by account/entity/period',
              'Import budgets from spreadsheet',
            ],
            mri_title: 'General Ledger > Utilities > Budgets',
            mri_assoc: [
              { name: 'General Ledger > Utilities > Budget Import', desc: 'Budget entry and import' },
            ],
          },
          {
            id: 'gl-budgets-planning-types',
            title: 'Budget Types & Notes',
            desc: 'Multiple budget versions and supporting notes.',
            activities: [
              'Maintain original and revised budget types',
              'Attach budget notes (BUDNOTE)',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Budget Types',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Budget Types', desc: 'Budget type and note setup' },
            ],
          },
        ],
      },
      {
        id: 'gl-budgets-revision',
        title: 'PO Budget Control & B&F Integration',
        type: 'process',
        desc: 'Controlling commitments against budget and connecting GL budgeting to the B&F module. PO budget control stops over-commitment; B&F integration keeps GL actuals and approved budgets in step.',
        activities: [
          'Apply purchase-order budget control (PBUD table) to prevent over-commitment',
          'Use enterprise GL budgeting (ADVGL BudgetDetail) for advanced needs',
          'Run budget-to-actual / forecast reports and integrate with the B&F module (GL feeds actuals; receives approved budgets)',
        ],
        mri_title: 'Budget Control & Reporting (General Ledger > Utilities / Reports)',
        mri_prereqs: [
          'GL budgets in place; B&F configured where integrated',
        ],
        mri_assoc: [
          { name: 'General Ledger > Reports', desc: 'Forecast / budget-to-actual reporting' },
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'B&F integration — actuals out, approved budgets in' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. BANK ACCOUNTS, CASH & RECONCILIATION ─────────────────────────────── */
  {
    id: 'gl-bank',
    title: 'Bank Accounts, Cash & Reconciliation',
    processes: [
      {
        id: 'gl-bank-setup',
        title: 'Bank & Cash Setup',
        type: 'process',
        desc: 'Setting up the MRI bank/cash accounts and the cash maps that tell the system where money and retainage sit per entity. This underpins receipting, payments and retainage across the whole platform.',
        activities: [
          'Set up cash accounts / MRI banks (typically one per entity, or per property / pooled)',
          'Configure entity cash maps for retainage and cash-account mapping',
        ],
        mri_title: 'Bank Accounts & Cash Maps (Setup and Maintenance > General Ledger)',
        mri_prereqs: [
          'Entities and chart of accounts established',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger', desc: 'Bank account and entity cash-map setup' },
        ],
        subs: [],
      },
      {
        id: 'gl-bank-recon',
        title: 'Reconciliation & Multi-Currency Cash',
        type: 'process',
        desc: 'Reconciling MRI banks to the real bank and handling cash in more than one currency. Reliable bank rec is a core financial control; multi-currency handling supports international portfolios.',
        activities: [
          'Reconcile MRI banks to real banks (via AP bank rec), using auto-clearing and an AR clearing account where appropriate',
          'Handle multi-currency cash (e.g. ZAR base with EUR transactions) with translation for group reporting',
          'Use the Validate Cash Account Balance option as required (often disabled for inter-entity funded positions)',
        ],
        mri_title: 'Bank Reconciliation (Accounts Payable > Bank Reconciliation)',
        mri_prereqs: [
          'Bank accounts and cash maps configured',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Bank Reconciliation', desc: 'Reconcile MRI banks to real banks; auto-clearing' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 9. PERIOD & YEAR-END CLOSE ──────────────────────────────────────────── */
  {
    id: 'gl-close',
    title: 'Period & Year-End Close',
    processes: [
      {
        id: 'gl-close-period',
        title: 'Month-End Close',
        type: 'process',
        desc: 'Closing the accounting period once every sub-ledger is closed. GL always closes last, so this is the final control gate that locks the month\'s numbers.',
        activities: [
          'Confirm AP, CM, CAR, RM and all sub-ledgers are closed first',
          'Run the GL soft close to ease month-end, then the period close',
          'Use period rollover to block tenant/payment/cash-book posting while keeping GL/supplier open',
        ],
        mri_title: 'Closing (General Ledger > Closing)',
        mri_prereqs: [
          'All sub-ledgers closed for the period',
          'Recurring JEs generated based on Last Period Created',
        ],
        mri_assoc: [
          { name: 'General Ledger > Closing', desc: 'Period close, soft close and rollover' },
        ],
        subs: [
          {
            id: 'gl-close-period-process',
            title: 'Period Close & Soft Close',
            desc: 'The month-end close sequence, including soft close.',
            activities: [
              'Run soft close to ease month-end',
              'Close the period after sub-ledgers',
            ],
            mri_title: 'General Ledger > Closing',
            mri_assoc: [
              { name: 'General Ledger > Closing', desc: 'Period and soft close' },
            ],
          },
          {
            id: 'gl-close-period-rollover',
            title: 'Period Rollover',
            desc: 'Blocking sub-ledger posting while keeping GL/supplier open.',
            activities: [
              'Roll the period to block tenant/payment/cash-book posting',
              'Keep GL and supplier ledgers open as needed',
            ],
            mri_title: 'General Ledger > Closing',
            mri_assoc: [
              { name: 'General Ledger > Closing', desc: 'Period rollover' },
            ],
          },
        ],
      },
      {
        id: 'gl-close-year',
        title: 'Fiscal Year-End Close',
        type: 'process',
        desc: 'Closing the fiscal year — zeroing income-statement accounts to retained earnings and distributing the result. This resets the ledger for the new year and finalises the annual result.',
        activities: [
          'Run the year-end close: income-statement accounts zeroed to retained earnings',
          'Distribute percentages to secondary retained-earnings accounts and post any special (post-close) journals',
          'Use the Balance by Entity option to ensure all entities balance at close',
        ],
        mri_title: 'Year-End Close (General Ledger > Closing > Year-End)',
        mri_prereqs: [
          'All periods in the year closed; retained-earnings accounts configured',
        ],
        mri_assoc: [
          { name: 'General Ledger > Closing', desc: 'Fiscal year-end close' },
          { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Balance by Entity option' },
        ],
        subs: [
          {
            id: 'gl-close-year-process',
            title: 'Year-End Process',
            desc: 'Zeroing income accounts to retained earnings and distributing the result.',
            activities: [
              'Zero income-statement accounts to retained earnings',
              'Distribute to secondary retained earnings',
            ],
            mri_title: 'General Ledger > Closing > Year-End',
            mri_assoc: [
              { name: 'General Ledger > Closing', desc: 'Year-end processing' },
            ],
          },
          {
            id: 'gl-close-year-special',
            title: 'Special Journals & Balancing',
            desc: 'Post-close special journals and entity balancing.',
            activities: [
              'Post special (post-close) journals',
              'Apply Balance by Entity to ensure entities balance',
            ],
            mri_title: 'Setup and Maintenance > Management Options > General Ledger',
            mri_assoc: [
              { name: 'Setup and Maintenance > Management Options > General Ledger', desc: 'Balance by Entity' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 10. FINANCIAL REPORTING, FORMATS & INQUIRY ──────────────────────────── */
  {
    id: 'gl-reporting',
    title: 'Financial Reporting, Formats & Inquiry',
    processes: [
      {
        id: 'gl-reporting-management',
        title: 'Financial Statements & Formats',
        type: 'process',
        desc: 'Producing the core financial statements and defining how they lay out. Financial formats control the shape of the Balance Sheet and Income Statement; the standard reports deliver the numbers the business runs on.',
        activities: [
          'Define financial formats that set the layout of financial statements',
          'Produce the Balance Sheet, Income Statement and Trial Balance (MRI_TRBAL)',
          'Run the General Ledger Report (MRI_GENLEDG) and Comparative Income Statement',
        ],
        mri_title: 'Reports (General Ledger > Reports)',
        mri_prereqs: [
          'Period activity posted; financial formats defined',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger > Financial Formats', desc: 'Financial statement layout definition' },
          { name: 'General Ledger > Reports', desc: 'Balance Sheet, Income Statement, Trial Balance, GL Report' },
        ],
        subs: [
          {
            id: 'gl-reporting-management-formats',
            title: 'Financial Formats',
            desc: 'Defining the layout of the financial statements.',
            activities: [
              'Set up financial format definitions',
              'Map accounts into statement lines',
            ],
            mri_title: 'Setup and Maintenance > General Ledger > Financial Formats',
            mri_assoc: [
              { name: 'Setup and Maintenance > General Ledger > Financial Formats', desc: 'Financial format setup' },
            ],
          },
          {
            id: 'gl-reporting-management-statements',
            title: 'Core Statements',
            desc: 'The Balance Sheet, Income Statement, Trial Balance and GL Report.',
            activities: [
              'Produce BS, IS and Trial Balance',
              'Run the GL Report and Comparative Income Statement',
            ],
            mri_title: 'General Ledger > Reports',
            mri_assoc: [
              { name: 'General Ledger > Reports', desc: 'Core financial statements' },
            ],
          },
        ],
      },
      {
        id: 'gl-reporting-inquiry',
        title: 'GL Inquiry & Transaction Analysis',
        type: 'process',
        desc: 'Drilling into the detail behind the numbers — from a balance down to the individual journal and its sub-ledger source. Inquiry is how finance answers "what makes up this figure?" without running a report.',
        activities: [
          'Use GL Inquiry to drill into GL detail',
          'Drill through to AP and other sub-ledger detail behind a posting',
        ],
        mri_title: 'GL Inquiry (General Ledger > Utilities > GL Inquiry)',
        mri_prereqs: [
          'Transactions posted to the GL',
        ],
        mri_assoc: [
          { name: 'General Ledger > Utilities > GL Inquiry', desc: 'Drill into GL and sub-ledger detail' },
        ],
        subs: [],
      },
      {
        id: 'gl-reporting-schedule',
        title: 'Consolidation, Dashboard & Distribution',
        type: 'process',
        desc: 'Reporting across the group and getting output to stakeholders — consolidation via alternate charts, the financial dashboard, multi-currency translation and report distribution. Note group consolidation is frequently finished outside PMX (e.g. Excel).',
        activities: [
          'Produce consolidation reporting (Consolidated / Primary Group By; alternate chart to combine multiple charts)',
          'Report P&L across dimensions — group, entity, property, building, floor and fund — with currency translation',
          'Use the Financial Dashboard (planned performance widgets) and distribute reports',
        ],
        mri_title: 'Consolidation & Dashboard (General Ledger > Reports / Financial Dashboard)',
        mri_prereqs: [
          'Alternate/reporting chart mapped where consolidating multiple charts',
        ],
        mri_assoc: [
          { name: 'General Ledger > Reports', desc: 'Consolidation and multi-dimensional P&L reporting' },
          { name: 'General Ledger > Financial Dashboard', desc: 'Planned-performance and consolidated widgets' },
        ],
        subs: [
          {
            id: 'gl-reporting-schedule-consol',
            title: 'Consolidation Reporting',
            desc: 'Group reporting via alternate charts and reporting dimensions.',
            activities: [
              'Combine charts via an alternate reporting chart',
              'Report P&L at group/entity/property/fund level',
            ],
            mri_title: 'General Ledger > Reports',
            mri_assoc: [
              { name: 'General Ledger > Reports', desc: 'Consolidation reporting' },
            ],
          },
          {
            id: 'gl-reporting-schedule-dashboard',
            title: 'Dashboard & Distribution',
            desc: 'The financial dashboard and report distribution.',
            activities: [
              'Use planned-performance dashboard widgets',
              'Distribute reports and apply currency translation',
            ],
            mri_title: 'General Ledger > Financial Dashboard',
            mri_assoc: [
              { name: 'General Ledger > Financial Dashboard', desc: 'Financial dashboard and distribution' },
            ],
          },
        ],
      },
    ],
  },

];
