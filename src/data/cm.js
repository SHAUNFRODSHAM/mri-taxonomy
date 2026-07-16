// ═══════════════════════════════════════════════════════════════════════════
// Commercial Management (CM) — Module Data
//
// Structured on the concise functional taxonomy used for B&F and CAR:
// 12 sub-domains (columns) → process cards → sub-processes. Content is drafted
// from the CM Module Taxonomy document (§3 Functional Taxonomy, 3.1–3.12) and
// written business-first per the rules in CLAUDE.md.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI CM SME before client delivery.
//
// Source reference: MRI PMX Commercial Management (CM) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

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
        subs: [
          {
            id: 'cm-setup-options-mgmt',
            title: 'Management Options (CMOPTION)',
            desc: 'The core site-wide switches that control how CM numbers records and enforces transaction dates across the whole database.',
            activities: [
              'Set master-occupant, batch and invoice numbering (by database or building)',
              'Configure date controls — last rent-up date enforcement and prior-period close policy',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Management Options',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Management Options', desc: 'The CMOPTION switch panel' },
            ],
          },
          {
            id: 'cm-setup-options-batch',
            title: 'Batch Entry Options',
            desc: 'Defaults that govern how CM batches behave and post, including GL segmentation where the Enterprise Ledger is in use.',
            activities: [
              'Configure default batch entry behaviour',
              'Define GL segmentation columns applied to batches',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Batch Entry Options',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Batch Entry Options', desc: 'Batch behaviour and GL segmentation defaults' },
            ],
          },
          {
            id: 'cm-setup-options-retail',
            title: 'Retail Options',
            desc: 'Settings that control how retail sales are grouped and accumulated for percentage-rent calculation.',
            activities: [
              'Set retail by master occupant to combine sales across shared leases',
              'Configure monthly proration and cumulative application',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Retail Options',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Retail Options', desc: 'Retail grouping and accumulation settings' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-setup-class-trans',
            title: 'Transaction Classifications',
            desc: 'The top-level categories that group every charge and receipt and determine its posting behaviour.',
            activities: [
              'Define the classifications used to group income and adjustments',
              'Confirm whether each classification is billable, recoverable or an adjustment',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Transaction Classifications',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Transaction Classifications', desc: 'Maintain transaction categories and behaviour' },
            ],
          },
          {
            id: 'cm-setup-class-source',
            title: 'Source Codes',
            desc: 'The finer sub-classifications within each transaction classification that allow income to be analysed in detail.',
            activities: [
              'Set up source codes beneath each classification',
              'Map source codes so income reports at the required level of detail',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Source Codes',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Source Codes', desc: 'Maintain source-code sub-classifications' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-setup-lookups-lists',
            title: 'Lookup Lists',
            desc: 'The classification lists that keep leasing and retail data entry consistent.',
            activities: [
              'Maintain tenant types, store categories, national tenants and retail chains',
              'Maintain industry codes (NAICS/SIC) and sales report types',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Lookup Lists',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Lookup Lists', desc: 'Reference classification lists' },
            ],
          },
          {
            id: 'cm-setup-lookups-indexes',
            title: 'Financial Indexes',
            desc: 'The published indexes (CPI, RPI, seasonal) loaded into CM to drive automated rent escalations.',
            activities: [
              'Load index values with effective months and base years',
              'Review published figures each period before escalation runs',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes', desc: 'CPI/RPI/seasonal index maintenance' },
            ],
          },
        ],
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
        desc: 'The catalogue of tenant income streams (the INCH table) that classifies every charge the business raises. These categories are the vocabulary of CM billing and reporting — getting the list right shapes how income is analysed and how cleanly it posts to the ledger.',
        activities: [
          'Define the income categories the business bills — rent, late fees, percentage/turnover rent, recoveries, service charges, insurance, utilities, management fees',
          'Classify the credit-side items — concessions, refunds, prepayments, bad-debt write-offs and vacancy',
          'Align category naming with the income breakdown finance needs for reporting',
        ],
        mri_title: 'Income Categories (CM > Setup & Maintenance > Commercial Management > Income Categories — INCH)',
        mri_prereqs: [
          'GL Chart of Accounts finalised so each income category has an account to map to',
          'Income-reporting requirements agreed with finance',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Maintain the INCH classifications of tenant income streams' },
        ],
        subs: [
          {
            id: 'cm-income-categories-core',
            title: 'Core Income Categories',
            desc: 'The billable income streams that make up the bulk of tenant charges.',
            activities: [
              'Define rent, recoveries, service-charge and fee categories',
              'Align naming with the required income reporting',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Core income category maintenance' },
            ],
          },
          {
            id: 'cm-income-categories-adjust',
            title: 'Adjustment Categories',
            desc: 'The credit-side categories used for concessions, refunds, write-offs and vacancy.',
            activities: [
              'Classify concessions, refunds and bad-debt write-offs',
              'Agree the treatment of prepayments and vacancy',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Adjustment / credit category maintenance' },
            ],
          },
        ],
      },
      {
        id: 'cm-income-mapping',
        title: 'GL Account Mapping',
        type: 'process',
        desc: 'The wiring between each income category and the GL Chart of Accounts, so every CM charge and receipt posts to the correct debit and credit accounts. Accurate mapping is what lets the CM sub-ledger reconcile to the GL without manual intervention.',
        activities: [
          'Map each income category to its GL debit and credit accounts via source codes',
          'Map security-deposit categories separately, typically to their own ledger',
          'Validate the mapping with a test posting before go-live',
        ],
        mri_title: 'Income Category Account Mapping (CM > Setup & Maintenance > Commercial Management > Income Categories > Account Mapping)',
        mri_prereqs: [
          'Income categories defined and the GL accounts they map to created',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Account mapping of income categories to the GL Chart of Accounts' },
        ],
        subs: [
          {
            id: 'cm-income-mapping-accounts',
            title: 'GL Account Mapping',
            desc: 'Linking income categories to their GL debit and credit accounts via source codes.',
            activities: [
              'Map each category to debit/credit accounts',
              'Test a posting to confirm the mapping is correct',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories > Account Mapping',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'GL account mapping' },
            ],
          },
          {
            id: 'cm-income-mapping-deposit',
            title: 'Deposit Ledger Mapping',
            desc: 'Mapping security-deposit categories to their own ledger so deposits stay separate from income.',
            activities: [
              'Map deposit categories to the separate deposit ledger',
              'Confirm deposits are excluded from income reporting',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Security-deposit category mapping' },
            ],
          },
        ],
      },
      {
        id: 'cm-income-special',
        title: 'Special Income Handling',
        type: 'process',
        desc: 'How CM treats income that doesn\'t follow the standard bill-and-collect pattern — free rent and concessions, tenant prepayments, and ad-hoc miscellaneous income. Configuring these correctly keeps the ledger accurate when the commercial reality is more nuanced than straight rent.',
        activities: [
          'Set up free rent, concessions and rent holidays (a dedicated code or by suppressing the charge)',
          'Configure how tenant prepayments are held and later applied',
          'Set up handling for ad-hoc and miscellaneous income streams',
        ],
        mri_title: 'Income Categories (CM > Setup & Maintenance > Commercial Management > Income Categories)',
        mri_prereqs: [
          'Core income categories and their GL mappings already in place',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Configuration of concessions, prepayments and miscellaneous income' },
        ],
        subs: [
          {
            id: 'cm-income-special-freerent',
            title: 'Free Rent & Concessions',
            desc: 'Handling incentive periods where rent is reduced or not charged.',
            activities: [
              'Set up free-rent and concession codes or charge suppression',
              'Ensure incentives are reflected correctly in reporting',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Free-rent and concession configuration' },
            ],
          },
          {
            id: 'cm-income-special-prepay',
            title: 'Prepayments & Miscellaneous',
            desc: 'Holding tenant prepayments and handling ad-hoc income outside the standard categories.',
            activities: [
              'Configure how prepayments are held and applied',
              'Set up miscellaneous income handling',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Income Categories',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Income Categories', desc: 'Prepayment and miscellaneous income setup' },
            ],
          },
        ],
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
        desc: 'Creating the building estate (the BLDG table) and the portfolio hierarchy that everything else hangs off — reporting roll-ups, security and operational ownership all read from this structure. Get the hierarchy right at implementation and downstream reporting falls into place.',
        activities: [
          'Create buildings (BLDG) with agreed numbering/naming and their 1:1 entity link',
          'Establish the hierarchy: Portfolio → Region → Sub-region → Controlling Office → Property Manager → Property → Units/Leases',
          'Configure building groupings and property classifications for roll-up reporting',
        ],
        mri_title: 'Building Setup (CM > Leasing > Building Setup — BLDG)',
        mri_prereqs: [
          'Entity structure established in GL before buildings are created (buildings link 1:1 to an entity)',
          'Portfolio hierarchy and classification scheme agreed with the business',
        ],
        mri_assoc: [
          { name: 'CM > Leasing > Building Setup', desc: 'Building (BLDG) maintenance, hierarchy and classifications' },
        ],
        subs: [
          {
            id: 'cm-building-setup-bldg',
            title: 'Building Records (BLDG)',
            desc: 'The individual building records and their link to the owning entity.',
            activities: [
              'Create buildings with numbering/naming conventions',
              'Link each building 1:1 to its GL entity',
            ],
            mri_title: 'CM > Leasing > Building Setup',
            mri_assoc: [
              { name: 'CM > Leasing > Building Setup', desc: 'Building (BLDG) record maintenance' },
            ],
          },
          {
            id: 'cm-building-setup-hierarchy',
            title: 'Hierarchy & Classifications',
            desc: 'The portfolio hierarchy and classification scheme that drive roll-up reporting and security.',
            activities: [
              'Establish the portfolio → region → property hierarchy',
              'Configure groupings and classifications for reporting',
            ],
            mri_title: 'CM > Leasing > Building Setup > Hierarchy',
            mri_assoc: [
              { name: 'CM > Leasing > Building Setup', desc: 'Hierarchy, groupings and classifications' },
            ],
          },
        ],
      },
      {
        id: 'cm-building-accounting',
        title: 'Building Accounting & Recoveries Setup',
        type: 'process',
        desc: 'The accounting configuration a building needs before it can transact — accounting method, tax and cash types — plus the building-level expense pools that feed recoveries and the tracking of valuations and special-purpose properties. This is where a building is made ready to bill and recover.',
        activities: [
          'Configure the building accounting method, tax setup and cash types',
          'Set up building-level expense pools that recoveries draw on',
          'Set up special-purpose properties (non-tenant receipts, loans, equipment, land) and ViewPoint reporting where licensed',
          'Record property valuations and appraisals',
        ],
        mri_title: 'Building Accounting (CM > Leasing > Building Setup > Accounting)',
        mri_prereqs: [
          'Buildings created and income categories mapped to the GL',
          'Tax treatment and cash types agreed for the jurisdiction',
        ],
        mri_assoc: [
          { name: 'CM > Leasing > Building Setup', desc: 'Building accounting, recoveries setup and valuation tracking' },
        ],
        subs: [
          {
            id: 'cm-building-accounting-method',
            title: 'Accounting & Tax Setup',
            desc: 'The accounting method, tax treatment and cash types that govern how a building transacts.',
            activities: [
              'Set the accounting method and cash types',
              'Configure tax treatment for the jurisdiction',
            ],
            mri_title: 'CM > Leasing > Building Setup > Accounting',
            mri_assoc: [
              { name: 'CM > Leasing > Building Setup', desc: 'Building accounting and tax setup' },
            ],
          },
          {
            id: 'cm-building-accounting-pools',
            title: 'Expense Pools & Valuations',
            desc: 'Building-level expense pools for recoveries, plus special-purpose property and valuation tracking.',
            activities: [
              'Configure expense pools that feed recoveries',
              'Set up special-purpose properties and track valuations',
            ],
            mri_title: 'CM > Leasing > Building Setup > Recoveries',
            mri_assoc: [
              { name: 'CM > Leasing > Building Setup', desc: 'Expense-pool and valuation setup' },
            ],
          },
        ],
      },
      {
        id: 'cm-building-suites',
        title: 'Suite & Square Footage Management',
        type: 'process',
        desc: 'Maintaining the lettable spaces (the SUIT table) and their square-footage metrics. Suite areas drive occupancy and vacancy reporting and the pro-rata shares used in recoveries, so accurate square footage has a direct financial impact.',
        activities: [
          'Maintain suites (SUIT) and their square-footage history (BSQF)',
          'Define suite types (storage, ATMs, kiosks) and square-footage types (rentable, usable, gross, common)',
          'Track suite-level tax parcels',
        ],
        mri_title: 'Manage Suites (CM > Manage Suites — SUIT / BSQF)',
        mri_prereqs: [
          'Buildings created before suites can be added',
          'Square-footage measurement standard agreed (rentable/usable basis)',
        ],
        mri_assoc: [
          { name: 'CM > Manage Suites', desc: 'Suite search, details and square-footage history' },
          { name: 'CM > Leasing > Suite Maintenance', desc: 'Suite (SUIT) maintenance and square-footage types' },
        ],
        subs: [
          {
            id: 'cm-building-suites-suit',
            title: 'Suite Records (SUIT)',
            desc: 'The lettable spaces within each building, including specialist space types.',
            activities: [
              'Maintain suite records and suite types',
              'Track suite-level tax parcels',
            ],
            mri_title: 'CM > Manage Suites',
            mri_assoc: [
              { name: 'CM > Manage Suites', desc: 'Suite (SUIT) maintenance' },
            ],
          },
          {
            id: 'cm-building-suites-sqft',
            title: 'Square Footage (BSQF)',
            desc: 'The area metrics that drive occupancy, vacancy and pro-rata recovery calculations.',
            activities: [
              'Maintain rentable, usable, gross and common area',
              'Keep square-footage history current as space changes',
            ],
            mri_title: 'CM > Manage Suites > Square Footage',
            mri_assoc: [
              { name: 'CM > Leasing > Suite Maintenance', desc: 'Square-footage types and history (BSQF)' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-lease-setup-lease',
            title: 'Lease Record (LEAS)',
            desc: 'The lease agreement itself — commencement, expiry and break dates, demised suites and the rent and recovery terms that drive billing.',
            activities: [
              'Record lease dates, demised space and rent/recovery terms',
              'Set the billing arrangements (frequency, advance/arrears, recurring charges)',
            ],
            mri_title: 'CM > Manage Leases > Lease Details',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Lease (LEAS) general, billing and recovery information' },
            ],
          },
          {
            id: 'cm-lease-setup-moccp',
            title: 'Master Occupant (MOCCP)',
            desc: 'The tenant entity that holds the lease — reused across renewals and linked to related leases for consolidated reporting.',
            activities: [
              'Create or reuse the master occupant for the tenant',
              'Record legal and trading names, classification and key contacts',
            ],
            mri_title: 'CM > Manage Leases > Master Occupant',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Master occupant (MOCCP) maintenance' },
            ],
          },
          {
            id: 'cm-lease-setup-abstract',
            title: 'Lease Abstraction & Creation Route',
            desc: 'Choosing how the lease is captured — manual entry, LeaseFlow abstraction or MRI Contract Intelligence — to suit the volume and complexity involved.',
            activities: [
              'Select the creation route for the portfolio (manual / LeaseFlow / MCI)',
              'Validate abstracted terms against the signed lease',
            ],
            mri_title: 'CM > Leasing > Lease Setup',
            mri_assoc: [
              { name: 'CM > Leasing > Lease Setup', desc: 'Lease creation and abstraction entry point' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-lease-admin-renewal',
            title: 'Renewals & Rent Reviews',
            desc: 'Extending or renewing leases and applying rent reviews as leases reach their key dates.',
            activities: [
              'Process renewals and extensions at expiry or break',
              'Apply agreed rent reviews and updated terms',
            ],
            mri_title: 'CM > Leasing > Lease Administration > Renewals',
            mri_assoc: [
              { name: 'CM > Leasing > Lease Administration', desc: 'Renewal and rent-review wizard' },
            ],
          },
          {
            id: 'cm-lease-admin-space',
            title: 'Transfers & Space Changes',
            desc: 'Moving a tenant between spaces or adding/reducing demised area within an existing lease.',
            activities: [
              'Process transfers between suites or buildings',
              'Add or reduce demised space and adjust the associated charges',
            ],
            mri_title: 'CM > Leasing > Lease Administration > Space Changes',
            mri_assoc: [
              { name: 'CM > Leasing > Lease Administration', desc: 'Transfer and space-change wizard' },
            ],
          },
          {
            id: 'cm-lease-admin-vacate',
            title: 'Vacates & Occupancy Status',
            desc: 'Recording full or partial vacates and keeping occupancy status current so the rent roll and vacancy reporting stay accurate.',
            activities: [
              'Process full or partial vacates with the correct stop-bill date',
              'Maintain occupancy status (active, month-to-month, vacated, expired)',
            ],
            mri_title: 'CM > Leasing > Lease Administration > Vacates',
            mri_assoc: [
              { name: 'CM > Leasing > Lease Administration', desc: 'Vacate processing and occupancy status' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-lease-special-multi',
            title: 'Multi-Space Leases',
            desc: 'Leases where a single agreement spans multiple suites or buildings.',
            activities: [
              'Attach additional suites/buildings to one lease',
              'Ensure billing and recoveries apportion correctly across the spaces',
            ],
            mri_title: 'CM > Manage Leases > Additional Spaces',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Additional-space lease configuration' },
            ],
          },
          {
            id: 'cm-lease-special-prospect',
            title: 'Prospective / Speculative Leases',
            desc: 'Pipeline leases held for planning that must be kept out of live billing until executed.',
            activities: [
              'Record prospective leases for pipeline visibility',
              'Feed speculative leases into budgeting workbooks',
            ],
            mri_title: 'CM > Manage Leases > Prospective Leases',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Prospective / speculative lease tracking' },
            ],
          },
          {
            id: 'cm-lease-special-sublet',
            title: 'Sub-Leasing',
            desc: 'Tracking sub-tenants occupying space under a head lease.',
            activities: [
              'Record sub-letting arrangements against the head lease',
              'Track the sub-tenants and their occupied space',
            ],
            mri_title: 'CM > Manage Leases > Sub-Leases',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Sub-lease and sub-tenant tracking' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-billing-recurring-schedule',
            title: 'Recurring-Charge Schedules',
            desc: 'The per-lease schedules of rent and recurring charges that the rent-up run reads from.',
            activities: [
              'Review recurring-charge schedules for accuracy before the run',
              'Confirm charge start/stop dates and amounts against the lease',
            ],
            mri_title: 'CM > Manage Leases > Recurring Charges',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Recurring-charge schedule maintenance' },
            ],
          },
          {
            id: 'cm-billing-recurring-rentup',
            title: 'RENTUP Run',
            desc: 'The periodic process that calculates and posts recurring charges to the tenant ledger.',
            activities: [
              'Run the rent-up for the billing period',
              'Review the output before committing charges to the ledger',
            ],
            mri_title: 'CM > Monthly Activities > Create Recurring Charges (RENTUP)',
            mri_assoc: [
              { name: 'CM > Monthly Activities > Create Recurring Charges (RENTUP)', desc: 'The MRI_RENTUP rent-up process' },
            ],
          },
          {
            id: 'cm-billing-recurring-freq',
            title: 'Frequency, Advance/Arrears & Proration',
            desc: 'The billing-cadence rules that determine when and how each charge is raised.',
            activities: [
              'Set billing frequency and advance vs arrears per lease',
              'Apply calendar-day proration and any regional billing rules',
            ],
            mri_title: 'CM > Manage Leases > Billing Information',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Billing frequency and proration settings' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-billing-adj-oneoff',
            title: 'One-off Charges',
            desc: 'Ad-hoc charges for costs not covered by the recurring schedule.',
            activities: [
              'Raise one-off charges via batch entry',
              'Assign the correct income category and source code',
            ],
            mri_title: 'CM > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'CM > Batch Activities > Charges & Credits', desc: 'One-off charge entry' },
            ],
          },
          {
            id: 'cm-billing-adj-latefee',
            title: 'Late Fees',
            desc: 'Charges applied to overdue accounts using the agreed calculation method.',
            activities: [
              'Calculate late fees (flat, rate-based or hybrid)',
              'Apply late fees to overdue tenant accounts',
            ],
            mri_title: 'CM > Monthly Activities > Calculate Late Fees',
            mri_assoc: [
              { name: 'CM > Monthly Activities', desc: 'Late-fee calculation' },
            ],
          },
          {
            id: 'cm-billing-adj-credit',
            title: 'Concessions, Credits & Write-offs',
            desc: 'Downward adjustments to the tenant ledger — commercial concessions, credits and bad-debt write-offs.',
            activities: [
              'Apply concessions, credits and free-rent adjustments where agreed',
              'Write off uncollectable balances within authorisation limits',
            ],
            mri_title: 'CM > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'CM > Batch Activities > Charges & Credits', desc: 'Credit and write-off entry' },
            ],
          },
          {
            id: 'cm-billing-adj-refund',
            title: 'Refunds & Bad-Debt Reserve',
            desc: 'Tenant refunds and the periodic bad-debt reserve that protects income against expected losses.',
            activities: [
              'Process refunds, transferring to AP for payment where required',
              'Calculate and maintain the monthly bad-debt reserve',
            ],
            mri_title: 'CM > Monthly Activities > Bad Debt Reserve',
            mri_assoc: [
              { name: 'CM > Monthly Activities > Bad Debt Reserve', desc: 'Bad-debt reserve and refund processing' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-billing-adv-sl',
            title: 'Straight-Line Rent',
            desc: 'Smoothing recognised rental income across the lease term under the applicable accounting standard (FASB 13 / ASC 842 / IFRS 16).',
            activities: [
              'Configure straight-line schedules per the applicable standard',
              'Review and adjust schedules as leases change',
            ],
            mri_title: 'CM > Monthly Activities > Straight-Line Rent',
            mri_assoc: [
              { name: 'CM > Monthly Activities > Straight-Line Rent', desc: 'Straight-line rent calculation' },
            ],
          },
          {
            id: 'cm-billing-adv-fx',
            title: 'Multi-Currency Billing',
            desc: 'Billing tenants in a currency other than the entity base, with split-currency support down to charge level.',
            activities: [
              'Configure billing currency at building/lease/charge level',
              'Maintain the exchange-rate source used for conversion',
            ],
            mri_title: 'CM > Manage Leases > Currency',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Lease-level currency configuration' },
            ],
          },
        ],
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
        desc: 'Receiving tenant payments and applying them to the right open charges. Clean, accurate application is what keeps tenant balances trustworthy and arrears reporting meaningful.',
        activities: [
          'Enter tenant payments through batch cash receipts',
          'Apply payments to open charges using the agreed application rules',
          'Hold and track advance payments / prepayments until they are due',
        ],
        mri_title: 'Cash Receipts (CM > Batch Activities > Cash Receipts)',
        mri_prereqs: [
          'Open charges present on tenant ledgers',
          'Payment-application order agreed with finance',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities > Cash Receipts', desc: 'Batch entry and application of tenant payments' },
        ],
        subs: [
          {
            id: 'cm-cash-receipts-entry',
            title: 'Receipt Entry',
            desc: 'Capturing tenant payments into a receipt batch.',
            activities: [
              'Enter receipts against tenant accounts',
              'Record the payment reference and method',
            ],
            mri_title: 'CM > Batch Activities > Cash Receipts',
            mri_assoc: [
              { name: 'CM > Batch Activities > Cash Receipts', desc: 'Receipt batch entry' },
            ],
          },
          {
            id: 'cm-cash-receipts-apply',
            title: 'Payment Application',
            desc: 'Applying received payments to open charges per the configured rules, including prepayment handling.',
            activities: [
              'Apply payments to open charges by the agreed order',
              'Hold unmatched amounts as prepayments',
            ],
            mri_title: 'CM > Batch Activities > Cash Receipts > Application',
            mri_assoc: [
              { name: 'CM > Batch Activities > Cash Receipts', desc: 'Payment application and prepayment handling' },
            ],
          },
        ],
      },
      {
        id: 'cm-cash-methods',
        title: 'Payment Methods & Lockbox',
        type: 'process',
        desc: 'The electronic payment channels tenants use and the automated lockbox that ingests bank files. These reduce manual receipting and speed up cash application at volume.',
        activities: [
          'Configure the payment methods in use (EFT, SEPA, debit order, direct debit, cash, cheque)',
          'Set up the Tenant Connect portal payment process',
          'Configure CMEL (Commercial Management Electronic Lockbox) for automated payment ingestion',
        ],
        mri_title: 'Electronic Lockbox (CM > Batch Activities > Electronic Lockbox — CMEL)',
        mri_prereqs: [
          'Bank details and payment-channel agreements in place',
          'Lockbox file format agreed with the bank',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities', desc: 'Payment-method configuration and electronic lockbox (CMEL)' },
        ],
        subs: [
          {
            id: 'cm-cash-methods-config',
            title: 'Payment Methods',
            desc: 'The tenant payment channels the business accepts and how they are configured.',
            activities: [
              'Configure EFT, SEPA, direct debit, cash and cheque methods',
              'Enable the Tenant Connect portal payment route',
            ],
            mri_title: 'CM > Batch Activities > Payment Methods',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'Payment-method configuration' },
            ],
          },
          {
            id: 'cm-cash-methods-lockbox',
            title: 'Electronic Lockbox (CMEL)',
            desc: 'Automated ingestion and matching of bank lockbox files.',
            activities: [
              'Configure the CMEL lockbox file import',
              'Review and clear exceptions from the automated match',
            ],
            mri_title: 'CM > Batch Activities > Electronic Lockbox',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'Electronic lockbox (CMEL) processing' },
            ],
          },
        ],
      },
      {
        id: 'cm-cash-recon',
        title: 'Batch Reconciliation & Reversals',
        type: 'process',
        desc: 'Checking that a receipt batch balances before it posts, and correcting posted payments through reversals when needed. This is the control step that stops entry errors reaching the ledger.',
        activities: [
          'Review and validate receipt batches so totals agree before posting',
          'Post balanced batches to the tenant ledger and GL',
          'Process payment reversals to correct misapplied or erroneous receipts',
        ],
        mri_title: 'Batch Entry (CM > Batch Activities > Batch Entry)',
        mri_prereqs: [
          'Receipts entered in an open batch',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities', desc: 'Batch reconciliation, posting and payment reversals' },
        ],
        subs: [
          {
            id: 'cm-cash-recon-post',
            title: 'Batch Review & Posting',
            desc: 'Validating and posting receipt batches once they balance.',
            activities: [
              'Reconcile the batch total before posting',
              'Post the batch to the tenant ledger and GL',
            ],
            mri_title: 'CM > Batch Activities > Batch Entry',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'Batch review and posting' },
            ],
          },
          {
            id: 'cm-cash-recon-reversal',
            title: 'Payment Reversals',
            desc: 'Correcting posted payments that were misapplied or entered in error.',
            activities: [
              'Reverse the incorrect payment',
              'Re-apply the receipt to the correct charge',
            ],
            mri_title: 'CM > Batch Activities > Reversals',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'Payment reversal processing' },
            ],
          },
        ],
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
        desc: 'Billing and receiving the security deposits tenants lodge against their lease. Deposits are the tenant\'s money held on account, so they are kept on a separate ledger and never treated as income.',
        activities: [
          'Bill and receive security deposits (BILDEP)',
          'Receive deposits directly where no charge is raised',
          'Ensure deposits post to the separate deposit ledger, not income',
        ],
        mri_title: 'Security Deposits (CM > Batch Activities > Security Deposits — BILDEP)',
        mri_prereqs: [
          'Security-deposit income categories configured and mapped to the deposit ledger',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities > Security Deposits', desc: 'Security deposit billing (BILDEP) and receipt' },
        ],
        subs: [
          {
            id: 'cm-deposits-billing-bill',
            title: 'Deposit Billing (BILDEP)',
            desc: 'Raising a deposit charge and receiving the tenant\'s payment against it.',
            activities: [
              'Bill the deposit and receive payment',
              'Confirm the deposit posts to the deposit ledger',
            ],
            mri_title: 'CM > Batch Activities > Security Deposits',
            mri_assoc: [
              { name: 'CM > Batch Activities > Security Deposits', desc: 'Deposit billing (BILDEP)' },
            ],
          },
          {
            id: 'cm-deposits-billing-direct',
            title: 'Direct Deposit Receipt',
            desc: 'Capturing a deposit directly where no billing charge is raised.',
            activities: [
              'Receive the deposit without a charge',
              'Record it against the correct tenant and ledger',
            ],
            mri_title: 'CM > Batch Activities > Security Deposits',
            mri_assoc: [
              { name: 'CM > Batch Activities > Security Deposits', desc: 'Direct deposit capture' },
            ],
          },
        ],
      },
      {
        id: 'cm-deposits-interest',
        title: 'Deposit Interest & Adjustments',
        type: 'process',
        desc: 'Maintaining deposits once held — calculating any interest due, adjusting balances, and tracking alternative instruments such as bank guarantees. This keeps deposit liabilities accurate through to the point they are refunded or applied.',
        activities: [
          'Calculate and refund security-deposit interest (refund types RF, AR, FF)',
          'Process deposit adjustments (CMSDADJ)',
          'Track bank guarantees as an EU-specific deposit alternative',
        ],
        mri_title: 'Security Deposit Adjustments (CM > Batch Activities > Security Deposits > Adjustments — CMSDADJ)',
        mri_prereqs: [
          'Deposits received and recorded on the deposit ledger',
          'Interest terms and rates agreed where interest is payable',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities > Security Deposits', desc: 'Deposit interest, adjustments and bank-guarantee tracking' },
        ],
        subs: [
          {
            id: 'cm-deposits-interest-calc',
            title: 'Interest & Adjustments',
            desc: 'Calculating interest on held deposits and processing balance adjustments.',
            activities: [
              'Calculate and refund deposit interest (RF/AR/FF)',
              'Process deposit adjustments (CMSDADJ)',
            ],
            mri_title: 'CM > Batch Activities > Security Deposits > Adjustments',
            mri_assoc: [
              { name: 'CM > Batch Activities > Security Deposits', desc: 'Interest calculation and adjustments' },
            ],
          },
          {
            id: 'cm-deposits-interest-guarantee',
            title: 'Bank Guarantees',
            desc: 'Tracking bank guarantees held in place of a cash deposit (common in the EU).',
            activities: [
              'Record bank-guarantee details and expiry',
              'Track guarantees alongside cash deposits',
            ],
            mri_title: 'CM > Batch Activities > Security Deposits',
            mri_assoc: [
              { name: 'CM > Batch Activities > Security Deposits', desc: 'Bank-guarantee tracking' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-recov-setup-pools',
            title: 'Expense Pools',
            desc: 'Grouping recoverable property costs into the pools tenants contribute to (operating, tax, insurance, CAM).',
            activities: [
              'Define expense pools at building level',
              'Assign eligible expense types to each pool',
            ],
            mri_title: 'CM > Recoveries > Formula Builder > Expense Pools',
            mri_assoc: [
              { name: 'CM > Recoveries > Formula Builder', desc: 'Expense-pool definition' },
            ],
          },
          {
            id: 'cm-recov-setup-participation',
            title: 'Participation & Caps',
            desc: 'How each tenant participates in a pool — gross-up, occupancy thresholds and any caps or exclusions from the lease.',
            activities: [
              'Configure gross-up and occupancy thresholds',
              'Apply lease-specific caps, floors and exclusions',
            ],
            mri_title: 'CM > Recoveries > Formula Builder > Participation',
            mri_assoc: [
              { name: 'CM > Recoveries > Formula Builder', desc: 'Expense participation rules' },
            ],
          },
          {
            id: 'cm-recov-setup-share',
            title: 'Pro-Rata Share Basis',
            desc: 'The measure used to apportion pooled costs across tenants (rentable, usable or custom square footage).',
            activities: [
              'Set the pro-rata share basis for each pool',
              'Validate share percentages against occupied area',
            ],
            mri_title: 'CM > Recoveries > Formula Builder > Pro-Rata Share',
            mri_assoc: [
              { name: 'CM > Recoveries > Formula Builder', desc: 'Pro-rata share configuration' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-recov-recon-estimate',
            title: 'On-Account Estimates',
            desc: 'Billing tenants estimated recovery charges on account through the year, ahead of actual costs being known.',
            activities: [
              'Calculate and bill estimated recovery charges for the period',
              'Preview the recovery worksheet before committing charges',
            ],
            mri_title: 'CM > Recoveries > Standard Recovery Billing Worksheet',
            mri_assoc: [
              { name: 'CM > Recoveries > Standard Recovery Billing Worksheet', desc: 'On-account estimate billing (MRI_BILLREC)' },
            ],
          },
          {
            id: 'cm-recov-recon-yearend',
            title: 'Year-End Reconciliation',
            desc: 'Truing up estimated charges against actual pooled costs and issuing each tenant a balancing charge or credit.',
            activities: [
              'Compare actual pooled costs to amounts billed on account',
              'Issue balancing charges/credits and handle retroactive adjustments',
            ],
            mri_title: 'CM > Recoveries > Standard Recovery Billing Worksheet',
            mri_assoc: [
              { name: 'CM > Recoveries > Standard Recovery Billing Worksheet', desc: 'Reconciliation (update) run' },
            ],
          },
        ],
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
        subs: [
          {
            id: 'cm-recov-service-direct',
            title: 'Direct-Charge Recoveries',
            desc: 'Passing directly-attributable costs — such as sub-metered utilities — straight through to the tenants who incurred them.',
            activities: [
              'Capture meter/consumption data per tenant',
              'Raise direct pass-through charges for the period',
            ],
            mri_title: 'CM > Recoveries > Service Charges > Direct Charges',
            mri_assoc: [
              { name: 'CM > Recoveries > Service Charges', desc: 'Direct-charge (metered) recoveries' },
            ],
          },
          {
            id: 'cm-recov-service-emea',
            title: 'EMEA Service-Charge Packs',
            desc: 'Country-specific service-charge regimes (UK, France, Germany, Italy) applied where local practice differs from the standard model.',
            activities: [
              'Enable the relevant country service-charge pack',
              'Configure custom formulas for non-standard arrangements',
            ],
            mri_title: 'CM > Recoveries > Service Charges',
            mri_assoc: [
              { name: 'CM > Recoveries > Service Charges', desc: 'EMEA country service-charge processing' },
            ],
          },
        ],
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
        desc: 'Rent that flexes with a retail tenant\'s trading performance — percentage and turnover rent calculated against reported sales, over agreed breakpoints. This is how landlords share in the upside of a successful retail location.',
        activities: [
          'Configure percentage and turnover rent with natural, artificial or cumulative breakpoints',
          'Set the lease options — breakpoints, percentages and any offsets/credits',
          'Run PCALC to calculate and post percentage-rent charges to the tenant ledger',
        ],
        mri_title: 'PCALC — Percentage Rent (CM > Retail > PCALC)',
        mri_prereqs: [
          'Retail module licensed and enabled',
          'Sales data captured for the period being calculated',
        ],
        mri_assoc: [
          { name: 'CM > Retail > PCALC', desc: 'Percentage-rent calculation and posting' },
        ],
        subs: [
          {
            id: 'cm-retail-percentage-breakpoints',
            title: 'Breakpoints & Lease Options',
            desc: 'The percentage-rent terms on the lease — breakpoints, percentages and offsets.',
            activities: [
              'Configure natural/artificial/cumulative breakpoints',
              'Set percentages, offsets and credits per the lease',
            ],
            mri_title: 'CM > Retail > Lease Options',
            mri_assoc: [
              { name: 'CM > Retail', desc: 'Percentage-rent lease options' },
            ],
          },
          {
            id: 'cm-retail-percentage-pcalc',
            title: 'PCALC Run',
            desc: 'Calculating and posting percentage rent from reported sales.',
            activities: [
              'Run PCALC for the period',
              'Review and post the calculated percentage-rent charges',
            ],
            mri_title: 'CM > Retail > PCALC',
            mri_assoc: [
              { name: 'CM > Retail > PCALC', desc: 'Percentage-rent calculation (update mode posts charges)' },
            ],
          },
        ],
      },
      {
        id: 'cm-retail-sales',
        title: 'Sales Reporting & Estimation',
        type: 'process',
        desc: 'Capturing the tenant sales figures that percentage rent depends on, and the reporting that turns them into insight and projections. Reliable sales data is the foundation of both accurate turnover rent and landlord asset-management decisions.',
        activities: [
          'Capture monthly sales, annual turnover certificates and trading-hours compliance',
          'Estimate sales where actuals are outstanding, to project percentage rent',
          'Collect Tenant Connect sales entry and run Gross Sales / Net Sales / Comparative Sales reports',
        ],
        mri_title: 'Sales Entry (CM > Retail > Sales Entry)',
        mri_prereqs: [
          'Retail lease options and reporting categories configured',
        ],
        mri_assoc: [
          { name: 'CM > Retail > Sales Entry', desc: 'Sales figure capture and retail sales reporting' },
        ],
        subs: [
          {
            id: 'cm-retail-sales-capture',
            title: 'Sales Capture',
            desc: 'Recording tenant sales figures, whether keyed or submitted via Tenant Connect.',
            activities: [
              'Capture monthly sales and turnover certificates',
              'Import Tenant Connect sales submissions',
            ],
            mri_title: 'CM > Retail > Sales Entry',
            mri_assoc: [
              { name: 'CM > Retail > Sales Entry', desc: 'Sales figure capture' },
            ],
          },
          {
            id: 'cm-retail-sales-reporting',
            title: 'Sales Reporting & Estimation',
            desc: 'Analytical reporting on sales and estimation where actuals are outstanding.',
            activities: [
              'Run Gross/Net/Comparative sales reports',
              'Estimate sales to project percentage rent',
            ],
            mri_title: 'CM > Retail > Sales Reports',
            mri_assoc: [
              { name: 'CM > Retail', desc: 'Retail sales reporting and estimation' },
            ],
          },
        ],
      },
      {
        id: 'cm-retail-setup',
        title: 'Retail Setup & Categories',
        type: 'process',
        desc: 'The reference setup that underpins retail sales capture and percentage-rent calculation — reporting categories, building defaults, and the grouping of sales by master occupant. Configured once, it keeps retail data consistent across the estate.',
        activities: [
          'Configure retail reporting categories and building defaults',
          'Set up retail by master occupant to combine sales histories across shared leases',
          'Maintain retail lookup lists (NAICS, SIC, retail chains, national tenants, store/tenant categories)',
        ],
        mri_title: 'Advanced Retail (CM > Retail > Advanced Retail)',
        mri_prereqs: [
          'Lookup lists and income categories available',
        ],
        mri_assoc: [
          { name: 'CM > Retail', desc: 'Retail reference setup, categories and master-occupant grouping' },
        ],
        subs: [
          {
            id: 'cm-retail-setup-categories',
            title: 'Reporting Categories & Defaults',
            desc: 'The categories and building defaults that structure retail sales capture.',
            activities: [
              'Configure reporting categories and building defaults',
              'Set retail-by-master-occupant grouping',
            ],
            mri_title: 'CM > Retail > Advanced Retail',
            mri_assoc: [
              { name: 'CM > Retail', desc: 'Retail reporting categories and defaults' },
            ],
          },
          {
            id: 'cm-retail-setup-lookups',
            title: 'Retail Lookup Lists',
            desc: 'The retail-specific reference lists used to classify tenants and stores.',
            activities: [
              'Maintain NAICS/SIC, retail chains and national tenants',
              'Maintain store and tenant categories',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Lookup Lists',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Lookup Lists', desc: 'Retail lookup-list maintenance' },
            ],
          },
        ],
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
        desc: 'Uplifting rents in line with a published index (CPI, or RPI in the UK) or an agreed schedule. Automating escalations ensures increases are applied on time and consistently, protecting real rental income against inflation.',
        activities: [
          'Apply CPI/RPI-linked rent escalations as they fall due',
          'Manage escalation schedules — fixed steps, index-linked or hybrid',
          'Run the monthly CPI increases process and review the resulting uplifts',
        ],
        mri_title: 'CPI Increases (CM > Monthly Activities > CPI Increases)',
        mri_prereqs: [
          'Financial indexes configured with effective months and base years',
          'Escalation clauses abstracted onto the leases',
        ],
        mri_assoc: [
          { name: 'CM > Monthly Activities > CPI Increases', desc: 'Monthly CPI/RPI escalation processing' },
        ],
        subs: [
          {
            id: 'cm-cpi-escalations-schedule',
            title: 'Escalation Schedules',
            desc: 'The per-lease escalation basis — fixed steps, index-linked or hybrid.',
            activities: [
              'Configure the escalation basis on each lease',
              'Confirm review dates and effective months',
            ],
            mri_title: 'CM > Manage Leases > Escalations',
            mri_assoc: [
              { name: 'CM > Manage Leases', desc: 'Lease escalation schedule setup' },
            ],
          },
          {
            id: 'cm-cpi-escalations-run',
            title: 'CPI/RPI Run',
            desc: 'The monthly process that applies index-linked uplifts to rents.',
            activities: [
              'Run the CPI/RPI increase process for the period',
              'Review and post the resulting rent uplifts',
            ],
            mri_title: 'CM > Monthly Activities > CPI Increases',
            mri_assoc: [
              { name: 'CM > Monthly Activities > CPI Increases', desc: 'CPI/RPI escalation run' },
            ],
          },
        ],
      },
      {
        id: 'cm-cpi-setup',
        title: 'Index Setup & Caps',
        type: 'process',
        desc: 'The index values and the cap/floor limits that bound how far a rent can move at review. This setup enforces the commercial limits negotiated in the lease, so escalations never exceed what was agreed.',
        activities: [
          'Configure the financial indexes (CPI/RPI) with effective months and base years',
          'Set cap and floor percentages that limit escalation amounts',
          'Track and carry forward unused cap amounts between reviews',
        ],
        mri_title: 'Financial Indexes (CM > Setup & Maintenance > Commercial Management > Financial Indexes)',
        mri_prereqs: [
          'Index sources identified and escalation clauses agreed',
        ],
        mri_assoc: [
          { name: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes', desc: 'CPI/RPI index configuration, caps and floors' },
        ],
        subs: [
          {
            id: 'cm-cpi-setup-indexes',
            title: 'Index Configuration',
            desc: 'Setting up the CPI/RPI indexes with their effective months and base years.',
            activities: [
              'Configure index definitions and base years',
              'Maintain effective-month settings',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes', desc: 'Index configuration' },
            ],
          },
          {
            id: 'cm-cpi-setup-caps',
            title: 'Caps, Floors & Carry-Forward',
            desc: 'The limits that bound escalation amounts, including carrying forward unused cap.',
            activities: [
              'Set cap and floor limitation percentages',
              'Track and carry forward unused cap amounts',
            ],
            mri_title: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes',
            mri_assoc: [
              { name: 'CM > Setup & Maintenance > Commercial Management > Financial Indexes', desc: 'Cap/floor and carry-forward settings' },
            ],
          },
        ],
      },
      {
        id: 'cm-cpi-renewals',
        title: 'Renewal Option Management',
        type: 'process',
        desc: 'Tracking the renewal and rent-review options embedded in leases so their key dates are never missed. These options often trigger escalations or renegotiations, making timely tracking a direct revenue-protection activity.',
        activities: [
          'Record renewal and review options with their trigger and notice dates',
          'Monitor upcoming option dates and prompt action in good time',
        ],
        mri_title: 'Lease Options (CM > Leasing > Lease Administration > Options)',
        mri_prereqs: [
          'Lease options and critical dates captured on the lease',
        ],
        mri_assoc: [
          { name: 'CM > Leasing > Lease Administration', desc: 'Renewal option tracking and management' },
        ],
        subs: [
          {
            id: 'cm-cpi-renewals-track',
            title: 'Option Tracking',
            desc: 'Recording and monitoring renewal/review options and their key dates.',
            activities: [
              'Record option trigger and notice dates',
              'Monitor upcoming options and prompt action',
            ],
            mri_title: 'CM > Leasing > Lease Administration > Options',
            mri_assoc: [
              { name: 'CM > Leasing > Lease Administration', desc: 'Renewal option tracking' },
            ],
          },
        ],
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
        desc: 'The common entry point through which receipts, charges, credits and adjustments reach the ledger in controlled, balanced batches. Batching gives a review-and-post control point rather than transactions hitting the ledger one at a time.',
        activities: [
          'Enter receipts, charges, credits and adjustments into batches',
          'Rely on auto-numbered batch IDs for unique identification and audit',
          'Use the streamlined (X.7 Next Gen) batch entry where available',
        ],
        mri_title: 'Batch Entry (CM > Batch Activities > Batch Entry)',
        mri_prereqs: [
          'Batch options and source codes configured',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities > Batch Entry', desc: 'Batch entry of receipts, charges, credits and adjustments' },
        ],
        subs: [
          {
            id: 'cm-batch-entry-capture',
            title: 'Batch Capture',
            desc: 'Entering transactions into a batch for later review and posting.',
            activities: [
              'Enter receipts, charges, credits and adjustments',
              'Confirm the auto-numbered batch ID and totals',
            ],
            mri_title: 'CM > Batch Activities > Batch Entry',
            mri_assoc: [
              { name: 'CM > Batch Activities > Batch Entry', desc: 'Transaction batch capture' },
            ],
          },
        ],
      },
      {
        id: 'cm-batch-integration',
        title: 'Enterprise Ledger & Imports',
        type: 'process',
        desc: 'Bringing external transactions into CM in bulk and posting segmented journal entries to the Enterprise Ledger. This supports high-volume operations and richer GL analysis than standard postings allow.',
        activities: [
          'Apply GL segmentation on batches where the Enterprise Ledger is in use',
          'Import batches of charges/receipts from external sources',
          'Process security-deposit batch refunds (RF, AR, FF)',
        ],
        mri_title: 'Import Batches (CM > Batch Activities > Import Batches)',
        mri_prereqs: [
          'Enterprise Ledger segmentation configured where used',
          'External file format agreed for imported batches',
        ],
        mri_assoc: [
          { name: 'CM > Batch Activities', desc: 'Enterprise Ledger segmentation and external batch imports' },
        ],
        subs: [
          {
            id: 'cm-batch-integration-import',
            title: 'External Batch Imports',
            desc: 'Bulk-importing externally-sourced charges and receipts.',
            activities: [
              'Import charge/receipt batches from external files',
              'Validate imported batches before posting',
            ],
            mri_title: 'CM > Batch Activities > Import Batches',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'External batch import' },
            ],
          },
          {
            id: 'cm-batch-integration-egl',
            title: 'Enterprise Ledger Segmentation',
            desc: 'Posting segmented journal entries to the Enterprise Ledger for richer GL analysis.',
            activities: [
              'Apply GL segmentation columns on batches',
              'Confirm segmented JEs post correctly to the EGL',
            ],
            mri_title: 'CM > Batch Activities > Batch Entry',
            mri_assoc: [
              { name: 'CM > Batch Activities', desc: 'Enterprise Ledger segmentation' },
            ],
          },
        ],
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
        desc: 'The recurring month-end cycle that turns the month\'s activity into charges, tenant communications and GL journals. Running this sequence reliably each period is what keeps billing timely and the ledger current.',
        activities: [
          'Run RENTUP to create recurring charges and calculate fees and interest (management, late, deposit)',
          'Process CPI increases and the monthly bad-debt reserve',
          'Print statements, invoices and late letters, then create the CM-to-GL journal entries',
        ],
        mri_title: 'Monthly Activities (CM > Monthly Activities)',
        mri_prereqs: [
          'Prior period closed and leases/charges current',
        ],
        mri_assoc: [
          { name: 'CM > Monthly Activities', desc: 'RENTUP, fee/interest calculation, printing and journal creation' },
        ],
        subs: [
          {
            id: 'cm-monthly-processing-charges',
            title: 'Charge & Fee Runs',
            desc: 'The month\'s charge creation and fee/interest calculations.',
            activities: [
              'Run RENTUP and CPI increases',
              'Calculate management fees, late fees and deposit interest',
            ],
            mri_title: 'CM > Monthly Activities',
            mri_assoc: [
              { name: 'CM > Monthly Activities', desc: 'Charge and fee processing' },
            ],
          },
          {
            id: 'cm-monthly-processing-output',
            title: 'Printing & Journals',
            desc: 'Producing tenant documents and posting the month\'s journals to the GL.',
            activities: [
              'Print statements, invoices and late letters',
              'Create the CM-to-GL journal entries',
            ],
            mri_title: 'CM > Monthly Activities > Create Journal Entries',
            mri_assoc: [
              { name: 'CM > Monthly Activities', desc: 'Printing and journal creation' },
            ],
          },
        ],
      },
      {
        id: 'cm-monthly-close',
        title: 'Period Close & Reconciliation',
        type: 'process',
        desc: 'Reconciling the CM sub-ledger and closing the period — which must happen before the GL closes. This is the control gate that confirms the month\'s tenant activity is complete and agrees to the ledger.',
        activities: [
          'Reconcile the CM sub-ledger to the GL, using the Month End Reconciliation AI tool where available',
          'Confirm all CM postings for the period are complete and balanced',
          'Close the CM period ahead of the GL close',
        ],
        mri_title: 'End of Month (CM > Monthly Activities > End of Month)',
        mri_prereqs: [
          'All batches posted and journals created for the period',
        ],
        mri_assoc: [
          { name: 'CM > Monthly Activities > End of Month', desc: 'CM month-end reconciliation and period close' },
        ],
        subs: [
          {
            id: 'cm-monthly-close-recon',
            title: 'Sub-Ledger Reconciliation',
            desc: 'Agreeing the CM sub-ledger to the GL before close.',
            activities: [
              'Reconcile CM balances to GL control accounts',
              'Investigate and clear any differences',
            ],
            mri_title: 'CM > Monthly Activities > End of Month',
            mri_assoc: [
              { name: 'CM > Monthly Activities > End of Month', desc: 'Month-end reconciliation' },
            ],
          },
          {
            id: 'cm-monthly-close-period',
            title: 'Period Close',
            desc: 'Closing the CM period in the correct sequence, ahead of the GL close.',
            activities: [
              'Confirm postings are complete and balanced',
              'Close CM before the GL period close',
            ],
            mri_title: 'CM > Monthly Activities > End of Month',
            mri_assoc: [
              { name: 'CM > Monthly Activities > End of Month', desc: 'CM period close' },
            ],
          },
        ],
      },
      {
        id: 'cm-monthly-reporting',
        title: 'Dashboards & Reporting',
        type: 'process',
        desc: 'The operational and executive reporting that turns CM data into decisions — occupancy, arrears, expirations and portfolio performance. This is where the module\'s value surfaces for asset managers and leadership.',
        activities: [
          'Review the Executive dashboard (occupancy, delinquency, top tenants) and Operations dashboard (leasing activity, follow-ups, make-ready)',
          'Run the key reports — Rent Roll (MRI_CMROLL), Aged Delinquencies, Expirations, Ledger Summary',
          'Produce tenant statements, vacancy, debtors, deposit and tenant-movement reports, and build custom reports via Application Studio',
        ],
        mri_title: 'Reports (CM > Reports)',
        mri_prereqs: [
          'Period data posted and reconciled',
        ],
        mri_assoc: [
          { name: 'CM > Reports', desc: 'Rent Roll, Aged Delinquencies, Expirations and Ledger Summary' },
          { name: 'CM > Home', desc: 'Executive and Operations dashboards' },
        ],
        subs: [
          {
            id: 'cm-monthly-reporting-dashboards',
            title: 'Dashboards',
            desc: 'The at-a-glance Executive and Operations dashboards.',
            activities: [
              'Review occupancy, delinquency and top-tenant views',
              'Track leasing activity, follow-ups and make-ready',
            ],
            mri_title: 'CM > Home',
            mri_assoc: [
              { name: 'CM > Home', desc: 'Executive and Operations dashboards' },
            ],
          },
          {
            id: 'cm-monthly-reporting-reports',
            title: 'Key Reports',
            desc: 'The core CM reports used operationally and for delivery.',
            activities: [
              'Run Rent Roll, Aged Delinquencies, Expirations and Ledger Summary',
              'Produce tenant statements and build custom reports',
            ],
            mri_title: 'CM > Reports',
            mri_assoc: [
              { name: 'CM > Reports', desc: 'Core CM reporting suite' },
            ],
          },
        ],
      },
    ],
  },

];
