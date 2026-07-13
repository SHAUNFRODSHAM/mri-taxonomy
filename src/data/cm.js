// ═══════════════════════════════════════════════════════════════════════════
// Commercial Management (CM) — Module Data
//
// ⚠️  PLACEHOLDER CONTENT — THIS FILE REQUIRES CONTENT REVIEW
// Refactored (June 2026) from the deep, granular prior version into the concise
// functional taxonomy used for B&F and CAR: 12 sub-domains (columns), each with
// a small set of process cards. Every desc / activity / MRI field below is
// PLACEHOLDER text derived from the CM Module Taxonomy document and is prefixed
// with [PLACEHOLDER] so it is visible in both the source and the UI.
//
// To complete this module:
//   1. Replace every [PLACEHOLDER] value with accurate, business-first content
//      following the content writing rules in CLAUDE.md.
//   2. Remove this warning block (and the ⚠️ flags in index.js / index.html)
//      once all content has been reviewed and signed off.
//
// Source reference: MRI PMX Commercial Management (CM) Module Taxonomy
// (Open Box Software, June 2026) — §3 Functional Taxonomy (3.1–3.12).
// ═══════════════════════════════════════════════════════════════════════════

const PH = '[PLACEHOLDER] '; // prefix applied to every unreviewed field value

export const cm = [

  /* ── 1. SETUP & CONFIGURATION ────────────────────────────────────────────── */
  {
    id: 'cm-setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'cm-setup-options',
        title: 'Management & Batch Options',
        type: 'process',
        desc: PH + 'Module-wide behavioural settings that govern how CM numbers, dates, and processes transactions across the database and buildings.',
        activities: [
          PH + 'Configure Management Options (CMOPTION): site ID, master-occupant and batch auto-numbering, invoice numbering by database or building',
          PH + 'Set date controls — force transaction date beyond last rent-up date, force close prior to rent-up, prorate by calendar days',
          PH + 'Configure batch entry behaviour and GL segmentation columns',
          PH + 'Set Retail options — retail by master occupant, prorate monthly, apply cumulative',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Management Options',
        mri_prereqs: [
          PH + 'Entity and GL structure established before configuring CM options',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management', desc: PH + 'Central setup for Management Options, batch and retail behaviour' },
        ],
        subs: [],
      },
      {
        id: 'cm-setup-classifications',
        title: 'Transaction Classifications & Source Codes',
        type: 'process',
        desc: PH + 'Definition of the transaction categories and their sub-classifications that determine how charges and receipts behave and post.',
        activities: [
          PH + 'Define transaction classifications and their posting behaviour',
          PH + 'Set up source codes as sub-classifications of transactions within income categories',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Source Codes',
        mri_prereqs: [
          PH + 'Income categories and GL account mapping agreed before defining classifications',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Source Codes', desc: PH + 'Maintain transaction classifications and source-code sub-classifications' },
        ],
        subs: [],
      },
      {
        id: 'cm-setup-lookups',
        title: 'Lookup Lists & Financial Indexes',
        type: 'process',
        desc: PH + 'Maintenance of the reference lists and financial indexes that support leasing, retail, and escalation processes.',
        activities: [
          PH + 'Maintain lookup lists — NAICS/SIC codes, national tenants, retail chains, store/tenant categories, sales report types',
          PH + 'Configure financial indexes (CPI, RPI, seasonal) used for escalations',
          PH + 'Maintain contact types and sales report types (modernised via Application Studio in X.7.10+)',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Lookup Lists',
        mri_prereqs: [
          PH + 'Management Options configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Lookup Lists', desc: PH + 'Reference lists for leasing, retail and escalation processes' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. INCOME CATEGORIES & COA MAPPING ──────────────────────────────────── */
  {
    id: 'cm-income',
    title: 'Income Categories & COA Mapping',
    processes: [
      {
        id: 'cm-income-categories',
        title: 'Income Categories',
        type: 'process',
        desc: PH + 'Client-defined classification of tenant-related income streams (the INCH table) that underpin billing and reporting.',
        activities: [
          PH + 'Define income categories (INCH) for rent, late fees, percentage/turnover rent, recoveries, service charges, insurance, utilities, management fees',
          PH + 'Classify concessions, refunds, prepayments, bad-debt write-offs and vacancy income',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Income Categories',
        mri_prereqs: [
          PH + 'GL Chart of Accounts finalised so income categories can be mapped',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Income Categories', desc: PH + 'Maintain the INCH classifications of tenant income streams' },
        ],
        subs: [],
      },
      {
        id: 'cm-income-mapping',
        title: 'GL Account Mapping',
        type: 'process',
        desc: PH + 'Linking of each income category to the GL Chart of Accounts so CM transactions post correctly to the ledger.',
        activities: [
          PH + 'Map income categories to GL debit/credit accounts via source codes',
          PH + 'Map security-deposit income categories separately (typically to a separate ledger)',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Income Categories > Account Mapping',
        mri_prereqs: [
          PH + 'Income categories defined and GL accounts available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Income Categories', desc: PH + 'Account mapping of income categories to the GL Chart of Accounts' },
        ],
        subs: [],
      },
      {
        id: 'cm-income-special',
        title: 'Special Income Handling',
        type: 'process',
        desc: PH + 'Configuration of the treatment of non-standard income items such as free rent, prepayments, and miscellaneous income.',
        activities: [
          PH + 'Configure free rent / concessions / rent holidays (separate code or by not charging rent)',
          PH + 'Configure treatment of tenant prepayments',
          PH + 'Set up handling of ad-hoc / miscellaneous income streams',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Income Categories',
        mri_prereqs: [
          PH + 'Core income categories and mappings in place',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Income Categories', desc: PH + 'Configuration of concessions, prepayments and miscellaneous income' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. BUILDING & PROPERTY SETUP ────────────────────────────────────────── */
  {
    id: 'cm-building',
    title: 'Building & Property Setup',
    processes: [
      {
        id: 'cm-building-setup',
        title: 'Building Setup & Hierarchy',
        type: 'process',
        desc: PH + 'Creation and structuring of the building estate (BLDG table) and the portfolio hierarchy that underpins reporting and security.',
        activities: [
          PH + 'Create buildings (BLDG) with numbering/naming and 1:1 entity linking',
          PH + 'Establish the hierarchy: Portfolio → Region → Sub-region → Controlling Office → Property Manager → Property → Units/Leases',
          PH + 'Configure building groupings and property classifications for roll-up reporting',
        ],
        mri_title: PH + 'CM > Leasing > Building Setup',
        mri_prereqs: [
          PH + 'Entity structure established in GL before creating buildings',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Leasing > Building Setup', desc: PH + 'Building (BLDG) maintenance, hierarchy and classifications' },
        ],
        subs: [],
      },
      {
        id: 'cm-building-accounting',
        title: 'Building Accounting & Recoveries Setup',
        type: 'process',
        desc: PH + 'Building-level accounting configuration, expense-pool setup for recoveries, and tracking of valuations and special-purpose properties.',
        activities: [
          PH + 'Configure building accounting method, tax setup and cash types',
          PH + 'Configure expense pools for recoveries at building level',
          PH + 'Set up special-purpose properties (non-tenant receipts, loans, equipment, land) and ViewPoint reporting where licensed',
          PH + 'Track property valuations and appraisals',
        ],
        mri_title: PH + 'CM > Leasing > Building Setup > Accounting',
        mri_prereqs: [
          PH + 'Buildings created and income categories mapped',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Leasing > Building Setup', desc: PH + 'Building accounting, recoveries setup and valuation tracking' },
        ],
        subs: [],
      },
      {
        id: 'cm-building-suites',
        title: 'Suite & Square Footage Management',
        type: 'process',
        desc: PH + 'Maintenance of suites (SUIT table) and their square-footage metrics, which drive occupancy, vacancy, and pro-rata recovery calculations.',
        activities: [
          PH + 'Maintain suites (SUIT) and square-footage history (BSQF)',
          PH + 'Define suite types (storage, ATMs, kiosks) and square-footage types (rentable, usable, gross, common)',
          PH + 'Track suite-level tax parcels; use Manage Suites preview (Application Studio, X.7.13)',
        ],
        mri_title: PH + 'CM > Manage Suites',
        mri_prereqs: [
          PH + 'Buildings created before adding suites',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Manage Suites', desc: PH + 'Suite search, details and square-footage history' },
          { name: PH + 'App Menu > Commercial Management > Leasing > Suite Maintenance', desc: PH + 'Suite (SUIT) maintenance and square-footage types' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 4. LEASE MANAGEMENT ─────────────────────────────────────────────────── */
  {
    id: 'cm-lease',
    title: 'Lease Management',
    processes: [
      {
        id: 'cm-lease-setup',
        title: 'Lease Setup & Master Occupant',
        type: 'process',
        desc: PH + 'Creation of lease agreements (LEAS) and their master occupant (MOCCP), capturing the terms that drive billing, occupancy and reporting.',
        activities: [
          PH + 'Create leases (LEAS) via manual entry, LeaseFlow import, or MRI Contract Intelligence (MCI)',
          PH + 'Set up the master occupant (MOCCP) — tenant entity, shared across renewals, new ID for brand-new leases',
          PH + 'Capture lease general information (dates, term, legal vs trading name, classification) and billing information',
        ],
        mri_title: PH + 'CM > Manage Leases',
        mri_prereqs: [
          PH + 'Buildings and suites created; income categories configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Manage Leases', desc: PH + 'Lease search, lease details and Raise Charge/Credit (X.7 preview)' },
          { name: PH + 'App Menu > Commercial Management > Leasing > Lease Setup', desc: PH + 'Lease (LEAS) and master-occupant (MOCCP) creation and maintenance' },
        ],
        subs: [],
      },
      {
        id: 'cm-lease-admin',
        title: 'Lease Administration',
        type: 'process',
        desc: PH + 'Ongoing lease events — renewals, transfers, space changes and vacates — handled through the Lease Administration wizard and approval workflow.',
        activities: [
          PH + 'Process renewals, transfers, space additions, vacates and space changes via the Lease Administration wizard',
          PH + 'Manage occupancy status (Active, MTM, Vacated, Expired, Prospective) and month-to-month handling',
          PH + 'Apply alternate stop-bill dates for early vacates; route changes through MCI Approvals Management',
        ],
        mri_title: PH + 'CM > Leasing > Lease Administration',
        mri_prereqs: [
          PH + 'Leases created and active before administration events',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Leasing > Lease Administration', desc: PH + 'Renewals, transfers, space additions and vacates wizard' },
        ],
        subs: [],
      },
      {
        id: 'cm-lease-special',
        title: 'Specialised Lease Types',
        type: 'process',
        desc: PH + 'Handling of multi-space, prospective, and sub-let lease arrangements that fall outside a standard single-suite lease.',
        activities: [
          PH + 'Set up additional-space leases spanning multiple suites or buildings',
          PH + 'Track prospect / speculative leases for pipeline and B&F workbooks',
          PH + 'Track sub-leasing arrangements and sub-tenants',
        ],
        mri_title: PH + 'CM > Manage Leases',
        mri_prereqs: [
          PH + 'Base lease setup understood before specialised structures',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Manage Leases', desc: PH + 'Multi-space, prospect and sub-lease handling (Application Studio preview)' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 5. BILLING & CHARGES ────────────────────────────────────────────────── */
  {
    id: 'cm-billing',
    title: 'Billing & Charges',
    processes: [
      {
        id: 'cm-billing-recurring',
        title: 'Recurring Charges (RENTUP)',
        type: 'process',
        desc: PH + 'Generation of periodic tenant charges from lease terms via the RENTUP process, with configurable frequency and regional handling.',
        activities: [
          PH + 'Run RENTUP (MRI_RENTUP) to calculate and create recurring charges (rent, service charges, insurance)',
          PH + 'Configure billing frequency (monthly/quarterly/annual/custom) and advance vs arrears',
          PH + 'Apply prorate by calendar days; handle UK additional frequencies and Australian head-lease processing',
        ],
        mri_title: PH + 'CM > Monthly Activities > RENTUP',
        mri_prereqs: [
          PH + 'Leases with billing information and recurring charges configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Monthly Activities > RENTUP', desc: PH + 'Monthly rent-up that calculates and posts recurring charges' },
        ],
        subs: [],
      },
      {
        id: 'cm-billing-adjustments',
        title: 'One-off Charges & Adjustments',
        type: 'process',
        desc: PH + 'Ad-hoc charges and downward adjustments — late fees, concessions, write-offs, refunds and the bad-debt reserve.',
        activities: [
          PH + 'Raise one-time charges via batch entry; calculate late fees (flat, rate-based or hybrid)',
          PH + 'Apply concessions, credits and free rent; process bad-debt write-offs',
          PH + 'Calculate monthly bad-debt reserve; process refunds (optionally transferred to AP as an open invoice)',
        ],
        mri_title: PH + 'CM > Batch Activities > Charges & Credits',
        mri_prereqs: [
          PH + 'Income categories and source codes configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities', desc: PH + 'Batch entry of one-off charges, credits and adjustments' },
        ],
        subs: [],
      },
      {
        id: 'cm-billing-advanced',
        title: 'Straight-Lining & Multi-Currency',
        type: 'process',
        desc: PH + 'Accounting-standard rent recognition (straight-lining) and multi-currency billing for international portfolios.',
        activities: [
          PH + 'Configure straight-lining of rent for FASB13 / ASC 842 / IFRS 16 compliance',
          PH + 'Set up multi-currency billing with split-currency support at building/lease/charge level',
        ],
        mri_title: PH + 'CM > Monthly Activities > Straight-Line Rent',
        mri_prereqs: [
          PH + 'Applicable accounting standard and reporting currency agreed',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Monthly Activities', desc: PH + 'Straight-line rent processing and multi-currency billing setup' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 6. CASH RECEIPTS & PAYMENT PROCESSING ───────────────────────────────── */
  {
    id: 'cm-cash',
    title: 'Cash Receipts & Payment Processing',
    processes: [
      {
        id: 'cm-cash-receipts',
        title: 'Cash Receipts & Application',
        type: 'process',
        desc: PH + 'Entry of tenant payments and their application to open charges, including handling of advance payments.',
        activities: [
          PH + 'Enter tenant payments via batch cash receipts',
          PH + 'Apply payments using configurable application rules against open charges',
          PH + 'Track tenant prepayments / advance payments',
        ],
        mri_title: PH + 'CM > Batch Activities > Cash Receipts',
        mri_prereqs: [
          PH + 'Open charges present on tenant ledgers',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities > Cash Receipts', desc: PH + 'Batch entry and application of tenant payments' },
        ],
        subs: [],
      },
      {
        id: 'cm-cash-methods',
        title: 'Payment Methods & Lockbox',
        type: 'process',
        desc: PH + 'Configuration of electronic payment channels and automated lockbox processing for tenant receipts.',
        activities: [
          PH + 'Configure payment methods (EFT, SEPA, debit order, direct debit, cash, cheque)',
          PH + 'Set up the Tenant Connect legacy payment process',
          PH + 'Configure CMEL (Commercial Management Electronic Lockbox) for automated payment processing',
        ],
        mri_title: PH + 'CM > Batch Activities > Electronic Lockbox',
        mri_prereqs: [
          PH + 'Bank details and payment-channel agreements in place',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities', desc: PH + 'Payment-method configuration and electronic lockbox (CMEL)' },
        ],
        subs: [],
      },
      {
        id: 'cm-cash-recon',
        title: 'Batch Reconciliation & Reversals',
        type: 'process',
        desc: PH + 'Review, validation and posting of receipt batches, plus correction of posted payments through reversals.',
        activities: [
          PH + 'Review, validate and post receipt batches',
          PH + 'Process standard payment reversals for corrections',
        ],
        mri_title: PH + 'CM > Batch Activities > Batch Entry',
        mri_prereqs: [
          PH + 'Receipts entered in an open batch',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities', desc: PH + 'Batch reconciliation, posting and payment reversals' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. SECURITY DEPOSITS ────────────────────────────────────────────────── */
  {
    id: 'cm-deposits',
    title: 'Security Deposits',
    processes: [
      {
        id: 'cm-deposits-billing',
        title: 'Deposit Billing & Receipt',
        type: 'process',
        desc: PH + 'Billing and receipt of tenant security deposits, typically mapped to a separate income category and ledger.',
        activities: [
          PH + 'Bill and receive security deposits (BILDEP)',
          PH + 'Receive deposits without billing (direct capture without a charge)',
          PH + 'Map deposits to a separate income category / ledger',
        ],
        mri_title: PH + 'CM > Batch Activities > Security Deposits',
        mri_prereqs: [
          PH + 'Security-deposit income categories configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities > Security Deposits', desc: PH + 'Security deposit billing (BILDEP) and receipt' },
        ],
        subs: [],
      },
      {
        id: 'cm-deposits-interest',
        title: 'Deposit Interest & Adjustments',
        type: 'process',
        desc: PH + 'Calculation of interest on held deposits, deposit adjustments, and tracking of alternative deposit instruments.',
        activities: [
          PH + 'Calculate and refund security-deposit interest (refund types RF, AR, FF)',
          PH + 'Process security-deposit adjustments (CMSDADJ)',
          PH + 'Track bank guarantees as an EU-specific deposit alternative',
        ],
        mri_title: PH + 'CM > Batch Activities > Security Deposits > Adjustments',
        mri_prereqs: [
          PH + 'Deposits received and recorded',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities > Security Deposits', desc: PH + 'Deposit interest, adjustments and bank-guarantee tracking' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. RECOVERIES & SERVICE CHARGES ─────────────────────────────────────── */
  {
    id: 'cm-recov',
    title: 'Recoveries & Service Charges',
    processes: [
      {
        id: 'cm-recov-setup',
        title: 'Recovery Setup & Expense Pools',
        type: 'process',
        desc: PH + 'Configuration of expense pools, participation rules and pro-rata share methods that drive tenant cost recovery.',
        activities: [
          PH + 'Build standard (non-retail) recovery calculations using the Formula Builder',
          PH + 'Define recovery groups / expense pools (operating, tax, insurance, CAM)',
          PH + 'Configure expense participation (gross-up, occupancy thresholds, eligible expenses) and pro-rata share (rentable/usable/custom SF)',
        ],
        mri_title: PH + 'CM > Recoveries > Formula Builder',
        mri_prereqs: [
          PH + 'Building expense pools and square footage established',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Recoveries', desc: PH + 'Formula Builder and expense-pool configuration' },
        ],
        subs: [],
      },
      {
        id: 'cm-recov-recon',
        title: 'Estimates & Reconciliation',
        type: 'process',
        desc: PH + 'The two-step recovery process: billing estimated (on-account) charges and reconciling to actuals at year end.',
        activities: [
          PH + 'Bill estimated (on-account) recovery charges',
          PH + 'Run the Recovery Billing Report (MRI_BILLREC) in preview and update modes',
          PH + 'Reconcile estimates vs actuals at year end and handle retroactive recovery amounts',
        ],
        mri_title: PH + 'CM > Recoveries > Standard Recovery Billing Worksheet',
        mri_prereqs: [
          PH + 'Recovery setup complete and actual expenses posted',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Recoveries', desc: PH + 'Recovery billing worksheet, estimates and year-end reconciliation' },
        ],
        subs: [],
      },
      {
        id: 'cm-recov-service',
        title: 'Direct & Regional Service Charges',
        type: 'process',
        desc: PH + 'Pass-through direct charges and country-specific service-charge handling for EMEA regimes.',
        activities: [
          PH + 'Process direct-charge recoveries (metered / sub-metered utilities pass-through)',
          PH + 'Apply the Service Charges module (EMEA) country packs — UK, France, Germany, Italy',
          PH + 'Build custom recovery formulas for non-standard conditions',
        ],
        mri_title: PH + 'CM > Recoveries > Service Charges',
        mri_prereqs: [
          PH + 'Relevant country pack licensed and configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Recoveries', desc: PH + 'Direct-charge recoveries and EMEA service-charge country packs' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 9. RETAIL MANAGEMENT ────────────────────────────────────────────────── */
  {
    id: 'cm-retail',
    title: 'Retail Management',
    processes: [
      {
        id: 'cm-retail-percentage',
        title: 'Percentage & Turnover Rent',
        type: 'process',
        desc: PH + 'Calculation of sales-linked rent using percentage and turnover methods with breakpoint tiers.',
        activities: [
          PH + 'Configure percentage rent and turnover rent with natural/artificial/cumulative breakpoints',
          PH + 'Set lease options — breakpoints, percentages, offsets/credits',
          PH + 'Run PCALC to calculate and post percentage-rent charges to the tenant ledger',
        ],
        mri_title: PH + 'CM > Retail > PCALC (% Rent)',
        mri_prereqs: [
          PH + 'Retail licensed; sales data captured for the period',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Retail > PCALC', desc: PH + 'Percentage-rent calculation and posting' },
        ],
        subs: [],
      },
      {
        id: 'cm-retail-sales',
        title: 'Sales Reporting & Estimation',
        type: 'process',
        desc: PH + 'Capture of tenant sales figures and the analytical reporting that supports percentage-rent projections.',
        activities: [
          PH + 'Capture monthly sales, annual turnover certificates and trading-hours compliance',
          PH + 'Estimate sales for percentage-rent projections',
          PH + 'Collect Tenant Connect sales entry; produce Gross Sales / Net Sales / Comparative Sales reports',
        ],
        mri_title: PH + 'CM > Retail > Sales Entry',
        mri_prereqs: [
          PH + 'Retail lease options and reporting categories configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Retail > Sales Entry', desc: PH + 'Sales figure capture and retail sales reporting' },
        ],
        subs: [],
      },
      {
        id: 'cm-retail-setup',
        title: 'Retail Setup & Categories',
        type: 'process',
        desc: PH + 'Reference setup that underpins retail sales capture and percentage-rent calculation.',
        activities: [
          PH + 'Configure reporting categories and building defaults',
          PH + 'Set up retail by master occupant (combining sales histories across shared leases)',
          PH + 'Maintain retail lookup lists (NAICS, SIC, retail chains, national tenants, store/tenant categories)',
        ],
        mri_title: PH + 'CM > Retail > Advanced Retail',
        mri_prereqs: [
          PH + 'Lookup lists and income categories available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Retail', desc: PH + 'Retail reference setup, categories and master-occupant grouping' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 10. CPI & ESCALATIONS ───────────────────────────────────────────────── */
  {
    id: 'cm-cpi',
    title: 'CPI & Escalations',
    processes: [
      {
        id: 'cm-cpi-escalations',
        title: 'CPI / RPI Escalations',
        type: 'process',
        desc: PH + 'Index-linked rent escalations applied through the monthly CPI process.',
        activities: [
          PH + 'Apply CPI (and UK RPI) linked rent escalations',
          PH + 'Manage escalation schedules — fixed steps, index-linked, hybrid',
          PH + 'Run the monthly "Working with CPI Increases" process',
        ],
        mri_title: PH + 'CM > Monthly Activities > CPI Increases',
        mri_prereqs: [
          PH + 'Financial indexes configured with effective months and base years',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Monthly Activities > CPI Increases', desc: PH + 'Monthly CPI/RPI escalation processing' },
        ],
        subs: [],
      },
      {
        id: 'cm-cpi-setup',
        title: 'Index Setup & Caps',
        type: 'process',
        desc: PH + 'Configuration of the financial indexes and cap/floor limits that govern escalation amounts.',
        activities: [
          PH + 'Configure financial indexes (CPI/RPI) with effective months and base years',
          PH + 'Set CPI limitation percent (cap and floor)',
          PH + 'Track and carry forward unused cap amounts',
        ],
        mri_title: PH + 'CM > Setup & Maintenance > Financial Indexes',
        mri_prereqs: [
          PH + 'Index sources and escalation clauses agreed',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Commercial Management > Financial Indexes', desc: PH + 'CPI/RPI index configuration, caps and floors' },
        ],
        subs: [],
      },
      {
        id: 'cm-cpi-renewals',
        title: 'Renewal Option Management',
        type: 'process',
        desc: PH + 'Tracking and management of lease renewal options that interact with escalation and rent-review terms.',
        activities: [
          PH + 'Track and manage lease renewal options',
        ],
        mri_title: PH + 'CM > Leasing > Lease Administration > Options',
        mri_prereqs: [
          PH + 'Lease options captured on the lease',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Leasing > Lease Administration', desc: PH + 'Renewal option tracking and management' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 11. BATCH PROCESSING ────────────────────────────────────────────────── */
  {
    id: 'cm-batch',
    title: 'Batch Processing',
    processes: [
      {
        id: 'cm-batch-entry',
        title: 'Batch Entry',
        type: 'process',
        desc: PH + 'Entry of cash receipts, charges, credits and adjustments through the CM batch entry workflow.',
        activities: [
          PH + 'Enter cash receipts, charges, credits and adjustments in batches',
          PH + 'Use auto-numbered batch IDs for unique batch identification',
          PH + 'Use streamlined (X.7 Next Gen) batch entry via Application Studio',
        ],
        mri_title: PH + 'CM > Batch Activities > Batch Entry',
        mri_prereqs: [
          PH + 'Batch options and source codes configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities > Batch Entry', desc: PH + 'Batch entry of receipts, charges, credits and adjustments' },
        ],
        subs: [],
      },
      {
        id: 'cm-batch-integration',
        title: 'Enterprise Ledger & Imports',
        type: 'process',
        desc: PH + 'Batch integration with the Enterprise Ledger (segmented JEs) and bulk import of externally-sourced transactions.',
        activities: [
          PH + 'Apply GL segmentation on batches (X.7.10+ with Enterprise Ledger)',
          PH + 'Import batches of charges/receipts from external sources',
          PH + 'Process security-deposit batch refunds (RF, AR, FF; X.7.12+)',
        ],
        mri_title: PH + 'CM > Batch Activities > Import Batches',
        mri_prereqs: [
          PH + 'Enterprise Ledger segmentation configured where used',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Batch Activities', desc: PH + 'Enterprise Ledger segmentation and external batch imports' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 12. MONTHLY ACTIVITIES, RECONCILIATION & REPORTING ──────────────────── */
  {
    id: 'cm-monthly',
    title: 'Monthly Activities, Reconciliation & Reporting',
    processes: [
      {
        id: 'cm-monthly-processing',
        title: 'Monthly Processing',
        type: 'process',
        desc: PH + 'The recurring month-end cycle of charge creation, fee calculation, printing and journal generation.',
        activities: [
          PH + 'Run RENTUP to create recurring charges; calculate fees and interest (management fees, late fees, deposit interest)',
          PH + 'Process CPI increases and the monthly bad-debt reserve',
          PH + 'Print statements, invoices and late letters; create CM-to-GL journal entries',
        ],
        mri_title: PH + 'CM > Monthly Activities',
        mri_prereqs: [
          PH + 'Prior period closed; leases and charges current',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Monthly Activities', desc: PH + 'RENTUP, fee/interest calculation, printing and journal creation' },
        ],
        subs: [],
      },
      {
        id: 'cm-monthly-close',
        title: 'Period Close & Reconciliation',
        type: 'process',
        desc: PH + 'Month-end reconciliation and the CM period close, which must precede the GL close.',
        activities: [
          PH + 'Use the CM Month End Reconciliation AI tool (X.7.14+) for AI-assisted reconciliation',
          PH + 'Confirm all CM postings are complete and reconciled before close',
          PH + 'Close the CM period ahead of the GL close',
        ],
        mri_title: PH + 'CM > Monthly Activities > End of Month',
        mri_prereqs: [
          PH + 'All batches posted and journals created for the period',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Monthly Activities > End of Month', desc: PH + 'CM month-end reconciliation and period close' },
        ],
        subs: [],
      },
      {
        id: 'cm-monthly-reporting',
        title: 'Dashboards & Reporting',
        type: 'process',
        desc: PH + 'Operational and executive reporting across occupancy, AR and portfolio performance.',
        activities: [
          PH + 'Review the Executive dashboard (occupancy, delinquency, top tenants) and Operations dashboard (leasing activity, follow-ups, make-ready)',
          PH + 'Run key reports — Rent Roll (MRI_CMROLL), Aged Delinquencies, Expirations, Ledger Summary',
          PH + 'Produce tenant statements, vacancy, debtors, security-deposit and tenant-movement reports; build custom reports via Application Studio',
        ],
        mri_title: PH + 'CM > Reports',
        mri_prereqs: [
          PH + 'Period data posted and reconciled',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Commercial Management > Reports', desc: PH + 'Rent Roll, Aged Delinquencies, Expirations and Ledger Summary' },
          { name: PH + 'App Menu > Commercial Management > Home', desc: PH + 'Executive and Operations dashboards' },
        ],
        subs: [],
      },
    ],
  },

];
