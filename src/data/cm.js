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
        desc: 'The foundational rules that govern how CM behaves across the whole database — how records are numbered, how strictly transaction dates are enforced, and how charges are prorated. Set once at implementation, these options quietly shape every billing and posting process that follows.',
        activities: [
          'Agree the site-wide numbering approach for master occupants, batches and invoices (numbered by database or by building)',
          'Decide the date-control policy — whether transactions can post beyond the last rent-up date, and whether a prior period can be closed before rent-up',
          'Determine how part-period charges are prorated for mid-month move-ins and move-outs',
          'Where retail applies, agree how retail sales are grouped and accumulated (by master occupant, prorated monthly, cumulative)',
        ],
        mri_title: 'Management Options (CM > Setup & Maintenance > Commercial Management > Management Options — CMOPTION)',
        mri_prereqs: [
          'Legal entity and GL structure established, as CM options reference entity-level settings',
          'Numbering conventions and the period-close policy agreed with finance',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Management Options', desc: 'Site-wide switches (CMOPTION) for numbering, date enforcement, proration and posting behaviour' },
          { name: 'CM > Setup & Maintenance > Commercial Management > Batch Entry Options', desc: 'Default behaviour and GL segmentation columns applied to CM batches' },
        ],
        subs: [],
      },
      {
        id: 'cm-setup-classifications',
        title: 'Transaction Classifications & Source Codes',
        type: 'process',
        desc: 'The scheme that categorises every charge and receipt so income is reported consistently and posts to the right place in the ledger. A well-structured set of classifications underpins accurate rent rolls, clean income analysis and a GL that reconciles without effort.',
        activities: [
          'Define the transaction classifications the business uses to group income and adjustments (rent, recoveries, fees, credits)',
          'Break each classification into source codes so income can be analysed at a finer level for reporting',
          'Confirm how each classification behaves — whether it is billable, recoverable, or a pure adjustment',
        ],
        mri_title: 'Source Codes (CM > Setup & Maintenance > Commercial Management > Source Codes)',
        mri_prereqs: [
          'Income categories agreed and mapped to the GL Chart of Accounts',
          'Income-reporting requirements understood so classifications support the required breakdown',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Transaction Classifications', desc: 'Defines the transaction categories and how each behaves when charged or received' },
          { name: 'CM > Setup & Maintenance > Commercial Management > Source Codes', desc: 'Sub-classifications of income within each transaction classification' },
        ],
        subs: [],
      },
      {
        id: 'cm-setup-lookups',
        title: 'Lookup Lists & Financial Indexes',
        type: 'process',
        desc: 'The reference data that supports leasing, retail and escalation — from tenant and industry classifications to the published indexes used to uplift rents. Keeping these lists current makes data entry consistent and lets escalation runs calculate automatically from the right figures.',
        activities: [
          'Maintain the classification lists used across leasing and retail (tenant types, store categories, national tenants, retail chains, industry codes)',
          'Load and keep current the financial indexes (CPI, RPI, seasonal) that drive rent escalations',
          'Review published index values each period so escalation processing uses the correct figures',
        ],
        mri_title: 'Lookup Lists (CM > Setup & Maintenance > Commercial Management > Lookup Lists)',
        mri_prereqs: [
          'Management Options configured',
          'Source of published index values (e.g. national statistics office) identified for periodic updates',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Lookup Lists', desc: 'Reference lists for tenant, retail and industry classifications' },
          { name: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes', desc: 'CPI/RPI and seasonal index values used by escalation processing' },
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
        desc: 'Recording the commercial lease and the tenant that holds it, capturing the terms — dates, demised space, rent and recovery arrangements — that everything else in CM reads from. Accurate lease setup is the single most important data-quality step in the module; billing, recoveries and reporting are only ever as good as the lease behind them.',
        activities: [
          'Capture the agreed lease terms — commencement, expiry and break dates, demised suites, and the rent and recovery arrangements',
          'Set up the master occupant to represent the tenant, reusing it across renewals and linking related leases',
          'Record legal and trading names, tenant classification and key contacts',
          'Choose the right creation route for the volume and complexity — manual entry, LeaseFlow abstraction, or MRI Contract Intelligence',
        ],
        mri_title: 'Manage Leases (CM > Manage Leases — LEAS / MOCCP)',
        mri_prereqs: [
          'Buildings and suites set up so the lease can be attached to its demised space',
          'Income categories and recurring-charge codes configured before billing terms are entered',
        ],
        mri_assoc: [
          { name: 'CM > Manage Leases', desc: 'Create and maintain the lease (LEAS) and master occupant (MOCCP), including terms and billing information' },
          { name: 'CM > Leasing > Lease Setup', desc: 'Detailed lease creation across the general, billing and recovery tabs' },
        ],
        subs: [],
      },
      {
        id: 'cm-lease-admin',
        title: 'Lease Administration',
        type: 'process',
        desc: 'Managing the events that occur across a lease\'s life — renewals, transfers, space changes and vacates — so occupancy, billing and reporting stay accurate as circumstances change. These mid-term changes are frequent and, if mishandled, are one of the most common sources of billing errors and tenant disputes.',
        activities: [
          'Process renewals, extensions and rent reviews as leases reach their key dates',
          'Handle transfers, space additions and reductions, and full or partial vacates',
          'Keep occupancy status current (active, month-to-month, vacated, expired) so the rent roll and vacancy reporting stay reliable',
          'Apply early-vacate stop-bill dates and route material changes through the approval workflow',
        ],
        mri_title: 'Lease Administration (CM > Leasing > Lease Administration)',
        mri_prereqs: [
          'Active lease and master-occupant records in place',
          'Critical dates recorded so renewals and reviews are flagged in good time',
        ],
        mri_assoc: [
          { name: 'CM > Leasing > Lease Administration', desc: 'Wizard-driven renewals, transfers, space changes and vacates' },
          { name: 'CM > Manage Leases', desc: 'Review and adjust lease terms following an administration event' },
        ],
        subs: [],
      },
      {
        id: 'cm-lease-special',
        title: 'Specialised Lease Types',
        type: 'process',
        desc: 'Handling lease arrangements that go beyond a single tenant in a single suite — multi-space leases, prospective/pipeline leases and sub-lettings — so the estate reflects real occupancy and the leasing pipeline feeds planning. These structures matter for accurate space accounting and for forward-looking budgeting.',
        activities: [
          'Set up leases that span multiple suites or buildings under a single agreement',
          'Track prospective and speculative leases so the leasing pipeline is visible and can feed budgeting workbooks',
          'Record sub-letting arrangements and the sub-tenants occupying space under a head lease',
        ],
        mri_title: 'Manage Leases (CM > Manage Leases)',
        mri_prereqs: [
          'Standard lease setup understood, with the building and suite structure already in place',
          'A convention agreed for representing prospective leases so they are excluded from live billing',
        ],
        mri_assoc: [
          { name: 'CM > Manage Leases', desc: 'Multi-space, prospective and sub-lease structures' },
          { name: 'CM > Leasing > Lease Setup', desc: 'Configure additional-space and sub-lease relationships' },
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
        desc: 'The periodic generation of tenant rent and other recurring charges directly from lease terms — the core revenue-producing process of CM. Each billing cycle, the rent-up turns the lease into the charges that hit the tenant ledger and ultimately the GL.',
        activities: [
          'Review recurring-charge schedules on leases for accuracy before the billing run',
          'Run the periodic rent-up to generate rent, service-charge and insurance charges from lease terms',
          'Confirm the billing frequency and whether charges are raised in advance or arrears for each lease',
          'Check proration for mid-period move-ins and apply any regional billing rules before posting',
        ],
        mri_title: 'Create Recurring Charges / RENTUP (CM > Monthly Activities > Create Recurring Charges — MRI_RENTUP)',
        mri_prereqs: [
          'Leases with complete, accurate recurring-charge and billing-frequency setup',
          'Prior period closed and the billing calendar / last rent-up date correct',
        ],
        mri_assoc: [
          { name: 'CM > Monthly Activities > Create Recurring Charges (RENTUP)', desc: 'Calculates and posts recurring charges from active lease terms' },
          { name: 'CM > Manage Leases', desc: 'Recurring-charge schedules that RENTUP reads when generating charges' },
        ],
        subs: [],
      },
      {
        id: 'cm-billing-adjustments',
        title: 'One-off Charges & Adjustments',
        type: 'process',
        desc: 'The ad-hoc charges and downward corrections that sit alongside recurring rent — one-off charges, late fees, concessions, write-offs and refunds — plus the bad-debt reserve. These keep the tenant ledger accurate between billing runs and reflect commercial concessions and credit-control decisions.',
        activities: [
          'Raise one-off charges for costs not covered by the recurring schedule',
          'Calculate and apply late fees to overdue accounts using the agreed method (flat, rate-based or hybrid)',
          'Grant concessions, credits and free-rent adjustments where commercially agreed',
          'Write off uncollectable balances and maintain the bad-debt reserve; process refunds, transferring to AP for payment where required',
        ],
        mri_title: 'Batch Entry — Charges & Credits (CM > Batch Activities > Charges & Credits)',
        mri_prereqs: [
          'Income categories and source codes configured for one-off and adjustment items',
          'Authorisation limits agreed for concessions, write-offs and refunds',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities > Charges & Credits', desc: 'Batch entry of one-off charges, credits and adjustments to the tenant ledger' },
          { name: 'CM > Monthly Activities > Bad Debt Reserve', desc: 'Periodic bad-debt reserve calculation' },
        ],
        subs: [],
      },
      {
        id: 'cm-billing-advanced',
        title: 'Straight-Lining & Multi-Currency',
        type: 'process',
        desc: 'The accounting-standard treatment of rent — straight-lining under FASB 13 / ASC 842 / IFRS 16 — and support for billing tenants in multiple currencies. Together these ensure reported rental income is compliant and that international portfolios can bill and report in the correct currency.',
        activities: [
          'Configure straight-line rent so recognised income is smoothed across the lease term per the applicable standard',
          'Review straight-line schedules and adjustments as leases are added or amended',
          'Set up multi-currency billing where leases or charges are denominated in a currency other than the entity\'s base',
        ],
        mri_title: 'Straight-Line Rent (CM > Monthly Activities > Straight-Line Rent)',
        mri_prereqs: [
          'Applicable accounting standard confirmed with finance',
          'Currencies and an exchange-rate source configured where multi-currency billing applies',
        ],
        mri_assoc: [
          { name: 'CM > Monthly Activities > Straight-Line Rent', desc: 'Calculates straight-lined rent recognition for reporting compliance' },
          { name: 'CM > Manage Leases', desc: 'Lease terms and currency that drive straight-lining and multi-currency billing' },
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
        desc: 'The configuration that determines how much of a property\'s operating costs each tenant contributes — expense pools, participation rules and pro-rata share methods. This setup is what makes automated recovery billing possible, and defensible when a tenant queries their charge.',
        activities: [
          'Group recoverable property costs into expense pools (operating, tax, insurance, CAM)',
          'Define how each tenant participates — eligible expense types, gross-up and occupancy thresholds, and any caps or exclusions per the lease',
          'Set the pro-rata share basis (rentable, usable or a custom measure) used to apportion pooled costs',
          'Build recovery formulas that reflect the lease terms across the tenant population',
        ],
        mri_title: 'Formula Builder (CM > Recoveries > Formula Builder)',
        mri_prereqs: [
          'Building expense pools and square-footage measures established',
          'Lease recovery clauses abstracted so participation, gross-up and caps can be configured accurately',
        ],
        mri_assoc: [
          { name: 'CM > Recoveries > Formula Builder', desc: 'Defines expense pools, participation rules and pro-rata share for cost recovery' },
          { name: 'CM > Leasing > Building Setup', desc: 'Building-level expense pools and square footage referenced by recovery formulas' },
        ],
        subs: [],
      },
      {
        id: 'cm-recov-recon',
        title: 'Estimates & Reconciliation',
        type: 'process',
        desc: 'The two-step recovery cycle: billing tenants estimated (on-account) charges through the year, then reconciling to actual costs at year end and issuing the balancing charge or credit. This is where recovery income is trued up, and where accuracy directly affects tenant relationships.',
        activities: [
          'Bill estimated recovery charges on account for the coming period',
          'Preview recovery calculations before committing charges to the ledger',
          'At year end, compare actual pooled costs to amounts billed and calculate each tenant\'s balancing charge or credit',
          'Handle prior-period (retroactive) adjustments where costs or participation change after billing',
        ],
        mri_title: 'Standard Recovery Billing (CM > Recoveries > Standard Recovery Billing Worksheet — MRI_BILLREC)',
        mri_prereqs: [
          'Recovery setup complete — pools, participation and pro-rata share configured',
          'Actual expenses posted for the reconciliation period',
        ],
        mri_assoc: [
          { name: 'CM > Recoveries > Standard Recovery Billing Worksheet', desc: 'Preview and update recovery billing (MRI_BILLREC) for estimates and reconciliation' },
          { name: 'CM > Monthly Activities', desc: 'Posting of recovery charges and balancing adjustments to the tenant ledger' },
        ],
        subs: [],
      },
      {
        id: 'cm-recov-service',
        title: 'Direct & Regional Service Charges',
        type: 'process',
        desc: 'Recoveries that fall outside the standard pooled model — direct pass-through of metered costs and the country-specific service-charge regimes used across EMEA. These handle utilities billed on consumption and the statutory service-charge practices of individual markets.',
        activities: [
          'Pass through directly-attributable costs such as sub-metered utilities to the tenants who incurred them',
          'Apply the relevant country service-charge pack (UK, France, Germany, Italy) where local practice differs from the standard model',
          'Configure custom recovery formulas for non-standard or negotiated arrangements',
        ],
        mri_title: 'Service Charges (CM > Recoveries > Service Charges)',
        mri_prereqs: [
          'Relevant EMEA service-charge country pack licensed and enabled',
          'Meter / consumption data source available for direct-charge recoveries',
        ],
        mri_assoc: [
          { name: 'CM > Recoveries > Service Charges', desc: 'Country-specific (EMEA) service-charge processing and direct-charge recoveries' },
          { name: 'CM > Recoveries > Formula Builder', desc: 'Custom recovery formulas for non-standard arrangements' },
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
