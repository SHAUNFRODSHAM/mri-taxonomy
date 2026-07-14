// ═══════════════════════════════════════════════════════════════════════════
// Budgeting & Forecasting (B&F) — Module Data
//
// Structured on the B&F Module Taxonomy (§3 Functional Taxonomy): 8 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md. Consolidated from the earlier flat, over-granular
// layout so each taxonomy bullet lives as an activity or sub-process.
//
// B&F automates property-level budgeting and forecasting by pulling lease data
// from CM, unit data from RM and actuals from GL, and posting approved budgets
// back to GL. It is RELIANT on CM — CM customisations must be rebuilt in B&F.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI B&F SME before client delivery.
//
// Source reference: MRI PMX Budgeting & Forecasting (B&F) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const bf = [

  /* ── 1. BUDGET PROCESS & OWNERSHIP ───────────────────────────────────────── */
  {
    id: 'bf-process',
    title: 'Budget Process & Ownership',
    processes: [
      {
        id: 'bf-process-ownership',
        title: 'Budget Ownership & Approval',
        type: 'process',
        desc: 'Who owns the budget and how it is signed off — the approval hierarchy, delegated authority and the check-in/out workflow that routes a budget through its required approvals before it is locked. Clear ownership is what makes a budget a commitment rather than a draft.',
        activities: [
          'Define the approval hierarchy and delegated authority for sign-off',
          'Route budgets through the workbook check-in/out approval workflow',
          'Lock budgets once approved so they cannot be altered without re-approval',
        ],
        mri_title: 'Manage Budgets (Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          'Workbook security teams configured so the right people can approve',
          'Approval levels and delegated authority agreed with finance',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'View, approve, reject and lock budgets through the workflow' },
        ],
        subs: [
          {
            id: 'bf-process-ownership-signoff',
            title: 'Ownership & Sign-Off',
            desc: 'The defined approval hierarchy and delegated authority, with locking after approval.',
            activities: [
              'Assign budget owners and delegated approvers',
              'Lock the budget once signed off',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Approval and locking' },
            ],
          },
          {
            id: 'bf-process-ownership-workflow',
            title: 'Approval Workflow',
            desc: 'The check-in/out process that routes budgets through the required approval levels.',
            activities: [
              'Check budgets in/out through the workflow',
              'Progress budgets through each approval level',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Check-in/out approval workflow' },
            ],
          },
        ],
      },
      {
        id: 'bf-process-collab',
        title: 'Contributors, Calendar & Groups',
        type: 'process',
        desc: 'How the budgeting effort is coordinated across people and time — multi-user contributor access, the budget calendar and milestones, and reusable budget-group assumptions. This keeps a multi-team budget cycle on track and consistent.',
        activities: [
          'Grant contributor access to finance, property and asset managers via workbook security teams',
          'Manage the budget calendar, milestones and entity-specific cycle variations',
          'Set up budget-group assumptions that can be reused and tweaked per workbook',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          'Security teams defined for contributor access',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Multi-contributor budget input' },
          { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Budget setup groups and security teams' },
        ],
        subs: [
          {
            id: 'bf-process-collab-contributors',
            title: 'Contributors & Calendar',
            desc: 'Multi-user input and the timeline that governs the budget cycle.',
            activities: [
              'Configure contributor access by security team',
              'Track calendar milestones and cycle variations',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Contributor access and calendar' },
            ],
          },
          {
            id: 'bf-process-collab-groups',
            title: 'Budget Groups',
            desc: 'Reusable group assumptions applied across workbooks and tweaked individually.',
            activities: [
              'Define reusable budget-group assumptions',
              'Apply and adjust groups per workbook',
            ],
            mri_title: 'Setup and Maintenance > Budgeting and Forecasting > Budget Setup Groups',
            mri_assoc: [
              { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Budget setup groups' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 2. BUDGET STRUCTURE & GRANULARITY ───────────────────────────────────── */
  {
    id: 'bf-structure',
    title: 'Budget Structure & Granularity',
    processes: [
      {
        id: 'bf-structure-levels',
        title: 'Budget Levels & Types',
        type: 'process',
        desc: 'The dimensions a budget is built at — entity, property, building, cost centre or GL account — and the budget types held per entity and year. This structure determines how budgets roll up and how they compare to actuals.',
        activities: [
          'Set the levels a budget is built and reported at (entity, property, building, cost centre, GL account)',
          'Define the budget types held per entity and budget year (e.g. STD, FCST1, FCST2)',
        ],
        mri_title: 'Create Budget (Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          'GL structure and property hierarchy established in the source modules',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Create Budget', desc: 'Budget level and type selection at creation' },
        ],
        subs: [],
      },
      {
        id: 'bf-structure-versions',
        title: 'Versions, Scenarios & Long-Term',
        type: 'process',
        desc: 'Holding multiple named versions of a budget (original, revised, rolling forecast), running scenarios with adjusted assumptions, and supporting multi-year (3- or 6-year) forecasts and multi-currency. All versions are retained for comparison.',
        activities: [
          'Maintain named versions — original, revised and rolling forecast — retained for comparison',
          'Run scenario analysis with adjusted assumptions',
          'Support multi-year forward forecasting and split-currency budgeting with translation for group reporting',
        ],
        mri_title: 'Create Budget (Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          'Budget types defined; currencies configured where multi-currency applies',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Version and scenario management' },
        ],
        subs: [
          {
            id: 'bf-structure-versions-scenarios',
            title: 'Versions & Scenarios',
            desc: 'Named versions and scenario analysis retained side by side for comparison.',
            activities: [
              'Create original, revised and rolling-forecast versions',
              'Model scenarios with adjusted assumptions',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Version and scenario handling' },
            ],
          },
          {
            id: 'bf-structure-versions-longterm',
            title: 'Long-Term & Multi-Currency',
            desc: 'Multi-year forward forecasts and split-currency budgeting with group translation.',
            activities: [
              'Build 3- or 6-year forward forecasts',
              'Budget in split currencies and translate for group reporting',
            ],
            mri_title: 'Budgeting and Forecasting > Create Budget',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Create Budget', desc: 'Long-term and multi-currency budgeting' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 3. BUDGET CREATION & MANAGEMENT ─────────────────────────────────────── */
  {
    id: 'bf-creation',
    title: 'Budget Creation & Management',
    processes: [
      {
        id: 'bf-creation-create',
        title: 'Budget Creation & Workbooks',
        type: 'process',
        desc: 'Creating budgets at scale and working them through the CM, RM and GL workbooks. Streamlined mass creation with configurable assumptions gets clients budgeting quickly; the workbooks are where the numbers are actually built.',
        activities: [
          'Create budgets en masse with configurable assumptions (single-click creation)',
          'Work income in the CM (commercial) and RM (residential) workbooks and expenses in the GL workbook',
          'Use the CM workbook views — Suite (Enhanced/Classic), Lease, Building and Calculation',
        ],
        mri_title: 'Create Budget (Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          'Source data current in CM, RM and GL — B&F reads from all three',
          'Budget setup groups configured for mass creation',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Create Budget', desc: 'Mass budget creation with assumptions' },
          { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Commercial income budgeting — Suite/Lease/Building/Calculation views' },
          { name: 'Budgeting and Forecasting > GL Workbook', desc: 'Expense budgeting grid with hierarchy and autosave' },
        ],
        subs: [
          {
            id: 'bf-creation-create-mass',
            title: 'Mass Budget Creation',
            desc: 'Streamlined single-click creation of many budgets with configurable assumptions.',
            activities: [
              'Select scope and assumptions for mass creation',
              'Generate budgets across the portfolio in one pass',
            ],
            mri_title: 'Budgeting and Forecasting > Create Budget',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Create Budget', desc: 'Mass creation' },
            ],
          },
          {
            id: 'bf-creation-create-workbooks',
            title: 'CM / RM / GL Workbooks',
            desc: 'The workbook types and views where income and expense budgets are built.',
            activities: [
              'Budget income in CM/RM workbook views',
              'Budget expenses in the GL workbook grid',
            ],
            mri_title: 'Budgeting and Forecasting > CM / RM / GL Workbook',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Commercial workbook views' },
            ],
          },
        ],
      },
      {
        id: 'bf-creation-modify',
        title: 'Modify Budgets & Prospect Leases',
        type: 'process',
        desc: 'Adjusting a budget after creation — reloading assumptions and locks, preserving copies, and adding speculative income through prospect leases. This is how a budget is refined as the picture firms up.',
        activities: [
          'Reload assumptions (CM, RM, inflation/seasonal indexes) and manage locks (Lock/Unlock All)',
          'Preserve copies before major changes and extend workbook amounts/detail lines',
          'Create basic or detailed prospect leases from Suite or Lease View for speculative income',
        ],
        mri_title: 'Manage Budgets (Budgeting and Forecasting > Manage Budgets > Modify)',
        mri_prereqs: [
          'An existing budget to modify',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Modify budgets — reload assumptions, locks, preserve copies' },
          { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Prospect lease creation from Suite/Lease view' },
        ],
        subs: [],
      },
      {
        id: 'bf-creation-reforecast',
        title: 'Reforecasting & Import/Export',
        type: 'process',
        desc: 'Creating reforecasts from existing budgets using actual GL data, and moving budget data in and out via Excel and APIs. Reforecasting keeps the forward view honest as the year progresses.',
        activities: [
          'Create reforecasts from existing budgets, adjusting with actual GL data',
          'Reforecast up to 500 budgets at a time with a configurable basis code',
          'Import budgets from Excel and export to BI platforms; use APIs for 3rd-party integration',
        ],
        mri_title: 'Manage Budgets (Budgeting and Forecasting > Manage Budgets > Reforecast)',
        mri_prereqs: [
          'Approved base budgets and posted GL actuals to reforecast against',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Reforecasting from existing budgets' },
        ],
        subs: [
          {
            id: 'bf-creation-reforecast-run',
            title: 'Reforecasting',
            desc: 'Adjusting forecasts using actual GL data, up to 500 budgets at once.',
            activities: [
              'Select budgets and basis code for reforecast',
              'Adjust figures against actuals',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Reforecast run' },
            ],
          },
          {
            id: 'bf-creation-reforecast-io',
            title: 'Import / Export',
            desc: 'Excel import, BI export and API-enabled integration.',
            activities: [
              'Import budgets from Excel',
              'Export to BI / integrate via API',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Import/export and API' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. BUDGET ASSUMPTIONS & METHODOLOGY ─────────────────────────────────── */
  {
    id: 'bf-assumptions',
    title: 'Budget Assumptions & Methodology',
    processes: [
      {
        id: 'bf-assumptions-income',
        title: 'Income & Leasing Assumptions',
        type: 'process',
        desc: 'How budgeted income is derived — from the rent roll and lease assumptions, adjusted for vacancies, escalations, new lettings and variable income, plus the leasing assumptions and incentives that shape future revenue.',
        activities: [
          'Budget rental income from the rent roll or lease assumptions, allowing for vacancies, escalations and new lettings',
          'Budget variable income (parking, turnover rent, pop-up retail) separately',
          'Configure leasing assumptions (renewals/expirations, e.g. convert to MTM) and budget incentives and leasing commissions',
        ],
        mri_title: 'CM Workbook (Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          'Accurate lease data in CM — B&F reads lease terms from it',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Income and leasing assumptions from lease data' },
          { name: 'Budgeting and Forecasting > CM Workbook > Calculation View', desc: 'Lease Cost & Commission worksheet for incentives' },
        ],
        subs: [
          {
            id: 'bf-assumptions-income-rental',
            title: 'Rental & Variable Income',
            desc: 'Budgeted rent from the rent roll/lease assumptions plus variable income streams.',
            activities: [
              'Derive rent from rent roll and escalations',
              'Budget parking, turnover and pop-up income separately',
            ],
            mri_title: 'Budgeting and Forecasting > CM Workbook',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Rental and variable income' },
            ],
          },
          {
            id: 'bf-assumptions-income-leasing',
            title: 'Leasing Assumptions & Incentives',
            desc: 'Renewal/expiry assumptions, speculative leases, and budgeted incentives/commissions.',
            activities: [
              'Configure renewal/expiration handling and speculative leases',
              'Budget rent-free periods, allowances and commissions',
            ],
            mri_title: 'Budgeting and Forecasting > CM Workbook > Calculation View',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Leasing assumptions and Lease Cost & Commission worksheet' },
            ],
          },
        ],
      },
      {
        id: 'bf-assumptions-expense',
        title: 'Expense, Capex & Recoveries',
        type: 'process',
        desc: 'How budgeted costs and cost recoveries are built — expenses from prior-year actuals with inflation or contracts, separate capex, recoveries apportioned from the expense budget, and the indexes and management-fee methods applied across the portfolio.',
        activities: [
          'Budget expenses from prior-year actuals with inflation, or from contracts/quotes, applying macro factors centrally',
          'Budget capex separately from operational expenditure',
          'Calculate budgeted recoveries from the expense budget and apportion to tenants; apply CPI/seasonal indexes and management-fee methods',
        ],
        mri_title: 'GL Workbook (Budgeting and Forecasting > GL Workbook)',
        mri_prereqs: [
          'Historical GL actuals available for expense budgeting',
          'Recovery setup in CM reflected in B&F (CM customisations rebuilt in B&F)',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > GL Workbook', desc: 'Expense budgeting from historical GL values' },
          { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Recovery estimates apportioned to tenants' },
        ],
        subs: [
          {
            id: 'bf-assumptions-expense-opex',
            title: 'Expense & Capex',
            desc: 'Operational expense budgeting (actuals + inflation or contracts) and separate capex.',
            activities: [
              'Budget expenses from prior-year actuals or contracts',
              'Budget capex separately from opex',
            ],
            mri_title: 'Budgeting and Forecasting > GL Workbook',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > GL Workbook', desc: 'Expense and capex budgeting' },
            ],
          },
          {
            id: 'bf-assumptions-expense-recoveries',
            title: 'Recoveries, Indexes & Fees',
            desc: 'Budgeted recoveries from the expense budget, plus indexes and management-fee methods.',
            activities: [
              'Calculate and apportion budgeted recoveries',
              'Apply CPI/seasonal indexes and management-fee rates',
            ],
            mri_title: 'Budgeting and Forecasting > CM Workbook',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > CM Workbook', desc: 'Recovery worksheet and management fees' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. VARIANCE REPORTING & ANALYSIS ────────────────────────────────────── */
  {
    id: 'bf-variance',
    title: 'Variance Reporting & Analysis',
    processes: [
      {
        id: 'bf-variance-budgetactual',
        title: 'Budget vs Actual Variance',
        type: 'process',
        desc: 'Comparing budgeted figures to actuals across time and dimensions, including suite-level revenue and prior-year comparisons. This is where the budget earns its keep — showing where performance diverges from plan.',
        activities: [
          'Run budget-vs-actual variance reports by month, quarter and year across configurable dimensions',
          'Compare projected vs actual suite-level revenue (Suite Budget Variance report)',
          'Include prior-year actuals alongside current budget and actuals',
        ],
        mri_title: 'Manage Budgets (Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          'Approved budget posted and GL actuals available',
          'Suite budgets posted where suite-level variance is required (CM workbook)',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Budget vs actual variance reporting' },
        ],
        subs: [
          {
            id: 'bf-variance-budgetactual-reports',
            title: 'Variance Reports',
            desc: 'Budget-vs-actual reporting by period and dimension.',
            activities: [
              'Run variance reports by month/quarter/year',
              'Slice by the required reporting dimensions',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Variance reports' },
            ],
          },
          {
            id: 'bf-variance-budgetactual-suite',
            title: 'Suite & Prior-Year Variance',
            desc: 'Suite-level revenue variance and prior-year comparison.',
            activities: [
              'Compare projected vs actual suite revenue',
              'Include prior-year actuals in the comparison',
            ],
            mri_title: 'Budgeting and Forecasting > Manage Budgets',
            mri_assoc: [
              { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Suite budget variance report' },
            ],
          },
        ],
      },
      {
        id: 'bf-variance-reforecast',
        title: 'Commentary & Reforecasting',
        type: 'process',
        desc: 'Adding management commentary to variances for board/investor submissions, and updating the forward view when significant variances emerge — without disturbing the original approved budget.',
        activities: [
          'Add management commentary to variance reports for board and investor packs',
          'Update forecast figures when significant variances are identified',
          'Preserve the original approved budget while holding the revised forecast separately',
        ],
        mri_title: 'Manage Budgets (Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          'Variances identified from budget-vs-actual analysis',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Variance commentary and reforecasting' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 6. REPORTING & DISTRIBUTION ─────────────────────────────────────────── */
  {
    id: 'bf-reporting',
    title: 'Reporting & Distribution',
    processes: [
      {
        id: 'bf-reporting-board',
        title: 'Board & Investor Reporting',
        type: 'process',
        desc: 'Turning budget, forecast and actual data into the P&L views and packs boards and investors need, with IFRS/JSE compliance where required. This is the executive-facing output of the whole budgeting effort.',
        activities: [
          'Produce budget, forecast and actual data for board and investor reports',
          'Generate full P&L views of the final budget output via standard and custom reports',
          'Meet IFRS/JSE compliance requirements where applicable',
        ],
        mri_title: 'Reports (Budgeting and Forecasting > standard & custom reports)',
        mri_prereqs: [
          'Approved budget and actuals available',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Board/investor and P&L reporting' },
        ],
        subs: [],
      },
      {
        id: 'bf-reporting-selfservice',
        title: 'Formats, Self-Service & Calc Report',
        type: 'process',
        desc: 'How reports are delivered and self-served — configurable Excel/PDF/portal output per stakeholder, self-service Rapid Reports/Report Design, and the budgeting calculation report.',
        activities: [
          'Output reports as Excel, PDF or portal delivery, configured per stakeholder group',
          'Provide self-service standard and custom reports (Rapid Reports, Report Design)',
          'Run the budgeting calculation report, hiding calculation results from the Communication Center where needed',
        ],
        mri_title: 'Reports (Budgeting and Forecasting > Rapid Reports / Report Design)',
        mri_prereqs: [
          'Report formats and distribution lists agreed per stakeholder',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets', desc: 'Report format, distribution and self-service reporting' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. INTEGRATION & SYSTEM IMPACT ──────────────────────────────────────── */
  {
    id: 'bf-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'bf-integration-gl',
        title: 'GL Integration & CM Dependency',
        type: 'process',
        desc: 'The data flows that make B&F a single source of truth — posting approved budgets to GL, pulling GL actuals for variance, and the hard dependency on CM (whose customisations must be rebuilt in B&F).',
        activities: [
          'Post approved budgets to GL (and suite budgets to the SUITBUDGET table where a CM workbook is used)',
          'Pull GL actuals and historical data for expense budgeting and variance analysis',
          'Rebuild any CM customisations within B&F, as B&F relies on CM',
        ],
        mri_title: 'Post to GL (Budgeting and Forecasting > Manage Budgets > Post to GL)',
        mri_prereqs: [
          'Approved budget ready to post',
          'CM module configured — B&F is dependent on it',
        ],
        mri_assoc: [
          { name: 'Budgeting and Forecasting > Manage Budgets > Post to GL', desc: 'Post approved budget to GL; Suite Budget option for CM workbooks' },
        ],
        subs: [],
      },
      {
        id: 'bf-integration-api',
        title: 'API, Security & Audit',
        type: 'process',
        desc: 'The platform capabilities around B&F — APIs and CRON jobs for automated 3rd-party integration, MRI SSO and workbook security, and audit-trail tracking of budget changes.',
        activities: [
          'Integrate with 3rd-party tools (e.g. Cognos, IT2) via the API suite and automate retrieval with CRON jobs',
          'Apply MRI SSO and user-/team-defined workbook security',
          'Rely on the MRI audit trail to track budget changes',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          'SSO and security model configured; API credentials provisioned for integrations',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Security teams and integration configuration' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. SETUP & CONFIGURATION ────────────────────────────────────────────── */
  {
    id: 'bf-setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'bf-setup-global',
        title: 'Global Options & Scenario Types',
        type: 'process',
        desc: 'The system-wide settings that must be in place before budgets can be created — global options (e.g. the Preserve-a-Copy policy for Modify Budgets) and the scenario types used for different budgeting approaches.',
        activities: [
          'Configure global options, including the Preserve-a-Copy policy (No / Yes and Option / Yes and Required)',
          'Set up the scenario types used for different budgeting approaches',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Budgeting and Forecasting > Global Options)',
        mri_prereqs: [
          'B&F licensed and enabled',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Global options and scenario types' },
        ],
        subs: [],
      },
      {
        id: 'bf-setup-workbookdefs',
        title: 'Workbooks, Teams & Groups',
        type: 'process',
        desc: 'Defining the workbook structures, the team-based access to them, and the reusable assumption groups that power mass budget creation.',
        activities: [
          'Define workbook structures and parameters',
          'Configure workbook security teams for team-based access',
          'Set up budget setup groups (reusable assumption groups) for mass creation',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          'Global options configured',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Workbook definitions, security teams and setup groups' },
        ],
        subs: [],
      },
      {
        id: 'bf-setup-overrides',
        title: 'Overrides, Exclusions & Preferences',
        type: 'process',
        desc: 'The finer configuration that tailors calculations and the user experience — recovery/CPI worksheet overrides, GL actuals exclusions for partial-year recovery pools, and per-user preferences such as the default CM suite view.',
        activities: [
          'Override recovery calculations and CPI index values for specific budget scenarios',
          'Configure GL actuals expense exclusions for partial-year recovery pools',
          'Set user preferences, e.g. the default CM Suite View (Enhanced vs Classic)',
        ],
        mri_title: 'Setup & Maintenance (Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          'Recovery pools and CPI indexes configured in the source modules',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Budgeting and Forecasting', desc: 'Recovery/CPI overrides and GL actuals exclusions' },
        ],
        subs: [],
      },
    ],
  },

];
