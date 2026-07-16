// ═══════════════════════════════════════════════════════════════════════════
// Investment Accounting (IA) — Module Data
//
// Structured on the IA Module Taxonomy (§3 Functional Taxonomy): 9 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// IA is the investor & consolidation layer that sits ABOVE the GL. It builds the
// portfolio structure from GL entities (with ownership %), performs multi-tier
// consolidation, tracks investor capital positions, and calculates waterfall
// distributions. Three pillars: Consolidated Financials, Investor Accounting,
// and the Waterfall Engine.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI IA SME before client delivery.
//
// Source reference: MRI PMX Investment Accounting (IA) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const ia = [

  /* ── 1. INVESTMENT STRUCTURE & ENTITY SETUP ──────────────────────────────── */
  {
    id: 'ia-structure',
    title: 'Investment Structure & Entity Setup',
    processes: [
      {
        id: 'ia-structure-portfolio',
        title: 'Portfolio Structure & Ownership',
        type: 'process',
        desc: 'Building the investment portfolio from GL entities, with the ownership percentages that drive consolidation. IA layers investor capital and consolidation on top of the GL entity structure, visualised as a parent/subsidiary ownership tree.',
        activities: [
          'Build the portfolio structure using GL entities with parent/subsidiary relationships',
          'Set user-defined ownership % per entity relationship (auto-calculated on the Commitment tab)',
          'Review the entity relationship tree in Investment Inquiry',
        ],
        mri_title: 'Investment Structure (Investment Accounting > Investment Structure)',
        mri_prereqs: [
          'GL entities established with accurate trial-balance data',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investment Structure', desc: 'Portfolio structure, ownership % and entity tree' },
        ],
        subs: [],
      },
      {
        id: 'ia-structure-legal',
        title: 'Entity Types, Legal Form & Share Classes',
        type: 'process',
        desc: 'Classifying entities and reflecting their legal form and capital structure — SPVs, trusts, partnerships, JVs, REITs, and multiple share classes. The accounting treatment follows the legal form and ownership relationships.',
        activities: [
          'Classify entities via IA entity types and handle minority/non-controlling interests',
          'Support legal forms — SPVs, trusts, partnerships, listed entities, JVs, REITs',
          'Configure multiple share/unit classes with different return profiles, voting rights and fee structures',
        ],
        mri_title: 'Investment Structure — Entity Types (Investment Accounting)',
        mri_prereqs: [
          'Portfolio structure built with ownership percentages',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investment Structure', desc: 'Entity types, legal form and share classes' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. ACCOUNT MAPPING & CONSOLIDATION SETUP ────────────────────────────── */
  {
    id: 'ia-consolidation',
    title: 'Account Mapping & Consolidation Setup',
    processes: [
      {
        id: 'ia-consolidation-mapping',
        title: 'Account Mapping & Methods',
        type: 'process',
        desc: 'The saved account maps and consolidation methods that turn many entity trial balances into one consolidated view. Good mapping design is critical for accurate consolidation; the method (full/proportionate/equity) depends on control vs influence.',
        activities: [
          'Build user-defined, saved account maps applied across multiple entity relationships (map all trial balances to one chart)',
          'Choose consolidation methods — full, proportionate, or equity pick-up rollup',
          'Configure subtotal groups with the Effect-on-NAV field (Increase/Decrease/None)',
        ],
        mri_title: 'Account Mapping (Investment Accounting > Account Mapping)',
        mri_prereqs: [
          'GL trial-balance/account data available; consolidation method agreed (IFRS 10/11)',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Account Mapping', desc: 'Saved account maps for entity relationships' },
        ],
        subs: [],
      },
      {
        id: 'ia-consolidation-eliminations',
        title: 'Eliminations & Multi-Tier Consolidation',
        type: 'process',
        desc: 'The intercompany eliminations and multi-tier roll-up that produce a true consolidated position. Manual elimination entries adjust the consolidated view only — they never touch the underlying entity ledgers.',
        activities: [
          'Configure automatic intercompany elimination rules at each consolidation tier',
          'Enter manual elimination/adjusting entries that adjust the consolidated view only',
          'Run automatic multi-tier roll-up across the fund structure (parent-child, ownership %, NCI accounts)',
        ],
        mri_title: 'Elimination & Adjusting Entry (Investment Accounting > Elimination and Adjusting Entry)',
        mri_prereqs: [
          'Account maps and consolidation group configuration in place',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Elimination and Adjusting Entry', desc: 'Manual elimination/adjusting entries' },
          { name: 'Investment Accounting > Consolidations', desc: 'Multi-tier consolidation roll-up' },
        ],
        subs: [
          {
            id: 'ia-consolidation-eliminations-rules',
            title: 'Elimination Rules & Entries',
            desc: 'Automatic intercompany eliminations and manual adjusting entries.',
            activities: [
              'Configure elimination rules per tier',
              'Post manual eliminations (consolidated view only)',
            ],
            mri_title: 'Investment Accounting > Elimination and Adjusting Entry',
            mri_assoc: [
              { name: 'Investment Accounting > Elimination and Adjusting Entry', desc: 'Eliminations and adjustments' },
            ],
          },
          {
            id: 'ia-consolidation-eliminations-tiers',
            title: 'Multi-Tier & Subtotal Groups',
            desc: 'Multi-tier roll-up and subtotal-group / NAV configuration.',
            activities: [
              'Run multi-tier consolidation across the structure',
              'Configure subtotal groups and Effect-on-NAV',
            ],
            mri_title: 'Investment Accounting > Consolidations',
            mri_assoc: [
              { name: 'Investment Accounting > Consolidations', desc: 'Multi-tier consolidation' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 3. CONSOLIDATED FINANCIAL REPORTING ─────────────────────────────────── */
  {
    id: 'ia-reporting-consol',
    title: 'Consolidated Financial Reporting',
    processes: [
      {
        id: 'ia-reporting-consol-statements',
        title: 'Consolidated Statements',
        type: 'process',
        desc: 'The consolidated financial statements produced across the portfolio using GL financial formats — Balance Sheet, Income Statement and Trial Balance, including comparatives and a cross-tab parent/subsidiary view. This replaces months of manual spreadsheet consolidation.',
        activities: [
          'Produce the consolidated Balance Sheet, Income Statement and Trial Balance (incl. cross-tab by entity)',
          'Produce comparative Balance Sheet with notes and comparative Income (with IA Consolidated Data)',
          'Use GL financial formats so consolidated reports match the entity statements',
        ],
        mri_title: 'Consolidations (Investment Accounting > Consolidations)',
        mri_prereqs: [
          'Account maps, eliminations and consolidation groups configured',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Consolidations', desc: 'Consolidated financial statements' },
        ],
        subs: [],
      },
      {
        id: 'ia-reporting-consol-audit',
        title: 'Single-Click Consolidation & Audit',
        type: 'process',
        desc: 'Automating consolidated statement generation to a single click, with detailed/summary audit reports and drill-down for assurance. This is what compresses reporting cycles from weeks to hours.',
        activities: [
          'Generate consolidated financial statements via single-click consolidation',
          'Produce the Consolidated Financials Audit report (detailed and summary) with drill-down',
        ],
        mri_title: 'Consolidations — Audit (Investment Accounting > Consolidations)',
        mri_prereqs: [
          'Consolidation setup complete',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Consolidations', desc: 'Single-click consolidation and audit reports' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 4. INVESTOR ACCOUNTING & CAPITAL TRACKING ───────────────────────────── */
  {
    id: 'ia-investor',
    title: 'Investor Accounting & Capital Tracking',
    processes: [
      {
        id: 'ia-investor-setup',
        title: 'Investor Setup & Commitments',
        type: 'process',
        desc: 'Recording investors and their commitments — the foundation of investor accounting. Each commitment drives an auto-calculated ownership % and is the reference point for capital calls and distributions.',
        activities: [
          'Set up investor records (searchable via MRI Go by name/ID)',
          'Record commitment amounts per investor with auto-calculated ownership % on the Commitment tab',
        ],
        mri_title: 'Investor Setup (Investment Accounting > Investor Setup)',
        mri_prereqs: [
          'Investment structure and entities established',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investor Setup', desc: 'Investor records and commitments' },
        ],
        subs: [],
      },
      {
        id: 'ia-investor-capital',
        title: 'Capital Calls, Contributions & Distributions',
        type: 'process',
        desc: 'Tracking the flow of investor capital — calls against commitments, contributions in, and distributions out — plus sweat-equity participants. The contribution effective date drives the waterfall start date, so accuracy here matters.',
        activities: [
          'Raise capital calls against commitments and track uncalled/outstanding commitments',
          'Record contributions (multi-level uploads; the effective date drives waterfall start) and distributions',
          'Handle investor invoicing/payment and sweat-equity participants (they feed the waterfall like any investor)',
        ],
        mri_title: 'Investor Inquiry (Investment Accounting > Investor Inquiry)',
        mri_prereqs: [
          'Investors set up with commitments',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investor Inquiry', desc: 'Capital calls, contributions and distributions (Investments tab)' },
        ],
        subs: [
          {
            id: 'ia-investor-capital-calls',
            title: 'Capital Calls & Contributions',
            desc: 'Calling capital against commitments and recording contributions.',
            activities: [
              'Raise capital calls; track uncalled commitments',
              'Record contributions with effective dates',
            ],
            mri_title: 'Investment Accounting > Investor Inquiry',
            mri_assoc: [
              { name: 'Investment Accounting > Investor Inquiry', desc: 'Capital calls and contributions' },
            ],
          },
          {
            id: 'ia-investor-capital-distributions',
            title: 'Distributions & Sweat Equity',
            desc: 'Recording distributions and sweat-equity participants.',
            activities: [
              'Record investor distributions (multi-level uploads)',
              'Enter sweat-equity participants for the waterfall',
            ],
            mri_title: 'Investment Accounting > Investor Inquiry',
            mri_assoc: [
              { name: 'Investment Accounting > Investor Inquiry', desc: 'Distributions and sweat equity' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. WATERFALL ENGINE (DISTRIBUTION CALCULATION) ──────────────────────── */
  {
    id: 'ia-waterfall',
    title: 'Waterfall Engine',
    processes: [
      {
        id: 'ia-waterfall-structure',
        title: 'Deal Structures & Return Types',
        type: 'process',
        desc: 'Defining the waterfall deal structure and the return types/hurdles that govern how cash is split between LPs and GP. The engine is only available after a commitment/capital call/contribution exists, and default return types copy into a deal on the first capital call.',
        activities: [
          'Set up complex waterfall deal structures (available after a commitment/capital call/contribution is added)',
          'Configure return types and hurdles — Preferred Return, GP Catch-Up, IRR/XIRR, Multiple, Return of Capital, fees, multiple tiers',
          'Maintain default waterfall return types (copied into a new deal on the first capital call)',
        ],
        mri_title: 'Waterfalls (Investment Accounting > Investments > Waterfalls)',
        mri_prereqs: [
          'A commitment, capital call or contribution added for the entity',
          'Default waterfall return types configured in Setup & Maintenance',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Deal structures, return types and hurdles' },
        ],
        subs: [
          {
            id: 'ia-waterfall-structure-deals',
            title: 'Deal Structures',
            desc: 'Setting up the waterfall deal structure for a fund/deal.',
            activities: [
              'Create the deal structure after first capital activity',
              'Confirm default return types copied in',
            ],
            mri_title: 'Investment Accounting > Investments > Waterfalls',
            mri_assoc: [
              { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Deal structure setup' },
            ],
          },
          {
            id: 'ia-waterfall-structure-returns',
            title: 'Return Types & Hurdles',
            desc: 'Preferred return, catch-up, IRR/XIRR, multiples and tiers.',
            activities: [
              'Configure return types and accrual/compounding',
              'Set hurdle tiers, splits and side letters',
            ],
            mri_title: 'Investment Accounting > Investments > Waterfalls',
            mri_assoc: [
              { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Return types and hurdles' },
            ],
          },
        ],
      },
      {
        id: 'ia-waterfall-calc',
        title: 'Cash Flows, Calculation & Distributions',
        type: 'process',
        desc: 'Sourcing the cash flows, calculating the waterfall and posting the resulting distributions. Create Distributions posts and locks the calculation so it is included in future runs.',
        activities: [
          'Set up cash flows (operating/capital accounts, additional cash flows) sourced by account/group',
          'Calculate distributions and view results (incl. View Pref Summary drill-down)',
          'Create distributions to post and lock the waterfall, and save the calculation output',
        ],
        mri_title: 'Waterfalls — Calculate (Investment Accounting > Investments > Waterfalls)',
        mri_prereqs: [
          'Deal structure, return types and cash-flow sources configured',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Calculate, view results and create distributions' },
        ],
        subs: [
          {
            id: 'ia-waterfall-calc-cashflow',
            title: 'Cash Flow Setup & Calculation',
            desc: 'Sourcing cash flows and running the waterfall calculation.',
            activities: [
              'Configure operating/capital/additional cash flows',
              'Calculate and view results (Pref Summary)',
            ],
            mri_title: 'Investment Accounting > Investments > Waterfalls',
            mri_assoc: [
              { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Cash flow setup and calculation' },
            ],
          },
          {
            id: 'ia-waterfall-calc-distribute',
            title: 'Create & Save Distributions',
            desc: 'Posting/locking distributions and saving the calculation output.',
            activities: [
              'Create distributions and lock the waterfall',
              'Save calculation output for future runs',
            ],
            mri_title: 'Investment Accounting > Investments > Waterfalls',
            mri_assoc: [
              { name: 'Investment Accounting > Investments > Waterfalls', desc: 'Create and save distributions' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 6. INVESTOR & FUND REPORTING ────────────────────────────────────────── */
  {
    id: 'ia-investor-reporting',
    title: 'Investor & Fund Reporting',
    processes: [
      {
        id: 'ia-investor-reporting-statements',
        title: 'Capital & Position Statements',
        type: 'process',
        desc: 'The investor-facing statements that report each investor\'s capital position and returns — partner capital statements, unit-holder statements, position and funded/unfunded reports. These are the primary investor deliverables.',
        activities: [
          'Produce Partner Capital Statements (XIRR, ending NAV) and Unit Holder Statements (configurable decimals)',
          'Produce Investor Position Statements and Funded/Unfunded and Outstanding Capital Call reports',
          'Run the Transaction Search report (export by investor/investment in the view currency)',
        ],
        mri_title: 'Reports (Investment Accounting > Reports)',
        mri_prereqs: [
          'Investor capital activity and (where relevant) waterfall distributions recorded',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Reports', desc: 'Partner capital, unit holder, position and funded/unfunded reports' },
        ],
        subs: [],
      },
      {
        id: 'ia-investor-reporting-metrics',
        title: 'Metrics, Inquiry & Portal',
        type: 'process',
        desc: 'The performance metrics, graphical inquiry and investor-portal publishing that give investors and managers insight. Key metrics (IRR, NAV, committed capital) and portal publishing close the investor-reporting loop.',
        activities: [
          'Surface key metrics — IRR, XIRR, total committed capital, NAV, preferred returns',
          'Use Investment Inquiry for a graphical view of entity/portfolio relationships',
          'Publish reports to the investor portal',
        ],
        mri_title: 'Investor Inquiry & Portal (Investment Accounting)',
        mri_prereqs: [
          'Investor and consolidation data available',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investor Inquiry', desc: 'Key metrics and graphical inquiry' },
          { name: 'Investment Accounting > Reports', desc: 'Investor portal publishing' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. CONSOLIDATION SCHEDULING & AUTOMATION ────────────────────────────── */
  {
    id: 'ia-scheduling',
    title: 'Consolidation Scheduling & Automation',
    processes: [
      {
        id: 'ia-scheduling-main',
        title: 'Scheduling, Automation & Validation',
        type: 'process',
        desc: 'Scheduling and automating consolidation runs and validating the output. Automated runs cut the time spent consolidating; validation reconciles the system output to manual workings during transition.',
        activities: [
          'Schedule consolidations (Scheduled Consolidation List) including for all open periods',
          'Run automated consolidations to reduce processing time',
          'Validate consolidation output by reconciling to manual workings',
        ],
        mri_title: 'Consolidations — Scheduling (Investment Accounting > Consolidations)',
        mri_prereqs: [
          'Consolidation setup complete and periods identified',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Consolidations', desc: 'Scheduled and automated consolidation runs' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. INTEGRATION & SYSTEM IMPACT ──────────────────────────────────────── */
  {
    id: 'ia-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'ia-integration-gl',
        title: 'GL Integration & Cross-Group Entries',
        type: 'process',
        desc: 'The dependency on the GL that makes IA work — it builds its structure from GL entities, reads GL account data and uses GL financial formats, and supports cross-group journal entries. The GL must hold accurate entity, ownership and trial-balance data first.',
        activities: [
          'Build the IA structure from GL entities and read GL account data using GL financial formats',
          'Post cross-group journal entries (CROSSGROUPJE — requires the additional access role)',
        ],
        mri_title: 'GL Integration (Investment Accounting ↔ General Ledger)',
        mri_prereqs: [
          'GL entities, ownership and trial-balance data accurate',
          'CROSSGROUPJE access role granted where cross-group JEs are used',
        ],
        mri_assoc: [
          { name: 'General Ledger > Journal Entry Management', desc: 'Cross-group journal entries' },
          { name: 'Investment Accounting > Consolidations', desc: 'Consolidation built from GL entity data' },
        ],
        subs: [],
      },
      {
        id: 'ia-integration-suite',
        title: 'Investment Suite & Portal',
        type: 'process',
        desc: 'The wider MRI Investment Management ecosystem IA plugs into — Investment Central, Fund Management, Valuations — plus MRI Go search, the investor portal and audit drill-down from investor to property level.',
        activities: [
          'Integrate with the MRI Investment Management suite (Investment Central, Fund Management, Valuations)',
          'Make investors searchable via MRI Go and publish reporting to the investor portal',
          'Provide audit drill-down from investor level to property level',
        ],
        mri_title: 'Investment Management Suite (Investment Accounting integrations)',
        mri_prereqs: [
          'Relevant MRI Investment Management products licensed where integrated',
        ],
        mri_assoc: [
          { name: 'Investment Accounting > Investor Inquiry', desc: 'MRI Go search and investor portal' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 9. SETUP & CONFIGURATION ────────────────────────────────────────────── */
  {
    id: 'ia-setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'ia-setup-main',
        title: 'IA Setup & Maintenance',
        type: 'process',
        desc: 'The central IA configuration that underpins consolidation and the waterfall — default return types, subtotal groups, account maps, entity types and consolidation schedules. Default return types only copy into a deal on its first capital call, so setup timing matters.',
        activities: [
          'Configure default waterfall return types (copied into new deals on the first capital call)',
          'Configure subtotal groups (Effect-on-NAV) and reusable account maps',
          'Maintain IA entity types and consolidation schedules',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Investment Accounting)',
        mri_prereqs: [
          'IA licensed and enabled; GL entity structure available',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Investment Accounting', desc: 'Default return types, subtotal groups, account maps, entity types' },
        ],
        subs: [
          {
            id: 'ia-setup-main-waterfall',
            title: 'Default Return Types & Subtotal Groups',
            desc: 'Waterfall default return types and subtotal-group/NAV setup.',
            activities: [
              'Configure default waterfall return types',
              'Set up subtotal groups and Effect-on-NAV',
            ],
            mri_title: 'Setup and Maintenance > Investment Accounting',
            mri_assoc: [
              { name: 'Setup and Maintenance > Investment Accounting', desc: 'Return types and subtotal groups' },
            ],
          },
          {
            id: 'ia-setup-main-maps',
            title: 'Account Maps, Entity Types & Schedules',
            desc: 'Reusable account maps, IA entity types and consolidation schedules.',
            activities: [
              'Maintain reusable account maps and IA entity types',
              'Set up consolidation schedules',
            ],
            mri_title: 'Setup and Maintenance > Investment Accounting',
            mri_assoc: [
              { name: 'Setup and Maintenance > Investment Accounting', desc: 'Account maps, entity types and schedules' },
            ],
          },
        ],
      },
    ],
  },

];
