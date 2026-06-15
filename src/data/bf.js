// ═══════════════════════════════════════════════════════════════════════════
// Budgeting & Forecasting (B&F) — Module Data
//
// ⚠️  PLACEHOLDER CONTENT — THIS FILE REQUIRES CONTENT REVIEW
// This module was authored from the "MRI PMX Budgeting & Forecasting (B&F)
// Module Taxonomy" reference document (Open Box Software, June 2026). All
// process descriptions, activities, prerequisites, and MRI screen
// associations below are PLACEHOLDER text pending review and sign-off by a
// subject-matter expert.
//
// Each user-visible field is prefixed with [PLACEHOLDER] so the unreviewed
// status is obvious in both the source and the UI.
//
// To complete this module:
//   1. Review every [PLACEHOLDER] field for accuracy and completeness,
//      following the content writing rules in CLAUDE.md (business-first,
//      MRI-second).
//   2. Remove the [PLACEHOLDER] prefix from each field once reviewed/approved.
//   3. Remove this warning block once all content is signed off.
//
// Source: MRI_PMX_BF_Module_Taxonomy.pdf — compiled by Oliver Marsden-Hill
// Column structure mirrors taxonomy §3.1–§3.8.
// Note: B&F is an add-on module reliant on CM, RM, and GL source data.
// ═══════════════════════════════════════════════════════════════════════════

const PH = '[PLACEHOLDER] ';

export const bf = [
  // ─── COLUMN 1: Budget Process & Ownership (§3.1) ────────────────────────────
  {
    id: 'bf-process',
    title: 'Budget Process & Ownership',
    processes: [
      {
        id: 'bf-process-ownership',
        title: 'Budget Ownership & Sign-Off',
        type: 'process',
        desc: PH + 'Establish who is accountable for each budget and the approval hierarchy through which budgets are reviewed, signed off, and locked. Clear ownership ensures budgets are authorised by the appropriate level of management before they are finalised and posted to the General Ledger.',
        activities: [
          PH + 'Define the approval hierarchy and delegated authority levels for each entity or portfolio',
          PH + 'Assign budget owners responsible for preparing and submitting each property or entity budget',
          PH + 'Lock budgets after approval to prevent further changes to the signed-off figures',
          PH + 'Maintain an audit trail of sign-off decisions for governance and investor reporting',
        ],
        mri_title: PH + 'Manage Budgets (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'B&F module licensed and Global Options configured',
          PH + 'Workbook Security Teams set up to control who can approve budgets',
          PH + 'GL entities and approval structures defined',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets', desc: PH + 'Central screen to view, select, approve, reject, post, and modify budgets through the approval hierarchy' },
        ],
      },
      {
        id: 'bf-process-contributors',
        title: 'Budget Contributors',
        type: 'process',
        desc: PH + 'Coordinate multi-user input into the budget from finance, property managers, and asset managers, with each contributor granted access only to the workbooks relevant to their responsibilities. Controlled contributor access supports collaborative budgeting while preserving data integrity.',
        activities: [
          PH + 'Identify the contributors required for each budget cycle across finance and property teams',
          PH + 'Configure contributor access via workbook security teams to scope what each user can edit',
          PH + 'Coordinate hand-offs between contributors as the budget progresses through preparation',
        ],
        mri_title: PH + 'Workbook Security Teams (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'MRI security and SSO configured for all contributing users',
          PH + 'Workbook Security Teams defined for team-based access control',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Workbook Security Teams', desc: PH + 'Configure team-based access so each contributor can edit only their assigned workbooks' },
        ],
      },
      {
        id: 'bf-process-calendar',
        title: 'Budget Calendar',
        type: 'process',
        desc: PH + 'Manage the budget timeline — milestone dates, submission deadlines, and entity-specific variations in budget cycles. The budget calendar keeps a multi-stakeholder budget process on track across a portfolio that may run on different fiscal years.',
        activities: [
          PH + 'Set the budget cycle timeline with key milestones and submission deadlines',
          PH + 'Accommodate entity-specific variations where properties run different budget cycles',
          PH + 'Track progress against milestones and follow up on outstanding submissions',
        ],
        mri_title: PH + 'Manage Budgets (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Budget years and types defined for each entity',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets', desc: PH + 'Track budget status and progress against the planned budget cycle timeline' },
        ],
      },
      {
        id: 'bf-process-workflow',
        title: 'Budget Approval Workflow',
        type: 'process',
        desc: PH + 'Route budgets through the required approval levels using the workbook check-in/check-out process with workflow approvals. The check-out lock prevents concurrent edits, and approvals are captured before a budget can be finalised and posted.',
        activities: [
          PH + 'Check workbooks out for editing and check them back in to submit for approval',
          PH + 'Route submitted budgets through the configured approval levels',
          PH + 'Approve or reject budgets at each level, with rejection returning the budget for revision',
          PH + 'Finalise approved budgets and progress them to the Post to GL stage',
        ],
        mri_title: PH + 'Manage Budgets (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Approval hierarchy and contributor access configured',
          PH + 'Check-in/check-out workflow enabled in Global Options',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets', desc: PH + 'Approve, reject, and manage the check-in/check-out workflow state of each budget' },
        ],
      },
      {
        id: 'bf-process-groups',
        title: 'Budget Groups',
        type: 'process',
        desc: PH + 'Use reusable budget group assumptions that can be applied across multiple workbooks and then tweaked individually where a specific property differs. Budget groups reduce repetitive setup and enforce consistency across a portfolio while still allowing local adjustment.',
        activities: [
          PH + 'Define reusable assumption groups that capture common budgeting parameters',
          PH + 'Apply a budget group to multiple workbooks during mass budget creation',
          PH + 'Tweak group-derived assumptions on individual workbooks where a property differs',
        ],
        mri_title: PH + 'Budget Setup Groups (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Assumption methodology agreed before groups are defined',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Budget Setup Groups', desc: PH + 'Create reusable assumption groups for mass budget creation that can be tweaked per workbook' },
        ],
      },
    ],
  },

  // ─── COLUMN 2: Budget Structure & Granularity (§3.2) ────────────────────────
  {
    id: 'bf-structure',
    title: 'Budget Structure & Granularity',
    processes: [
      {
        id: 'bf-structure-levels',
        title: 'Budget Levels',
        type: 'process',
        desc: PH + 'Determine the level at which budgets are built and reported — by entity, property, building, cost centre, GL account, or any combination. The chosen granularity drives how detailed the budgeting effort is and what dimensions are available for variance reporting.',
        activities: [
          PH + 'Agree the budgeting granularity required by finance and asset management',
          PH + 'Configure budgets to build at entity, property, building, cost centre, and/or GL account level',
          PH + 'Confirm the structure supports the required reporting dimensions before budget creation',
        ],
        mri_title: PH + 'Create Budget (App Menu > Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          PH + 'GL chart of accounts and entity/property structure finalised',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Create Budget', desc: PH + 'Define the entity, property, and account scope of a new budget' },
        ],
      },
      {
        id: 'bf-structure-versions',
        title: 'Budget Versions & Scenarios',
        type: 'process',
        desc: PH + 'Maintain multiple named versions of a budget — original, revised, rolling forecast — and run scenario analysis with adjusted assumptions. All versions are retained so finance can compare scenarios and track how the budget evolved over the cycle.',
        activities: [
          PH + 'Create named budget versions for original, revised, and rolling-forecast views',
          PH + 'Build scenarios with adjusted assumptions for sensitivity and what-if analysis',
          PH + 'Retain all versions for comparison and audit purposes',
        ],
        mri_title: PH + 'Scenario Types (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Scenario types configured in Setup & Maintenance',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Scenario Types', desc: PH + 'Set up the budget scenario types used for different budgeting approaches' },
        ],
      },
      {
        id: 'bf-structure-types',
        title: 'Budget Types',
        type: 'process',
        desc: PH + 'Define unlimited budget types per entity and budget year — for example STD (Standard), FCST1, and FCST2 — so the organisation can hold standard budgets and successive forecasts side by side within the same year.',
        activities: [
          PH + 'Define the budget type codes required per entity and budget year',
          PH + 'Distinguish standard budgets from forecast iterations using separate types',
          PH + 'Confirm budget types align with reporting and variance comparison needs',
        ],
        mri_title: PH + 'Create Budget (App Menu > Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          PH + 'Budget years defined for each entity',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Create Budget', desc: PH + 'Assign the budget type and year when creating a new budget' },
        ],
      },
      {
        id: 'bf-structure-longterm',
        title: 'Long-Term Budgets',
        type: 'process',
        desc: PH + 'Support multi-year budgeting and forward forecasting — for example 3-year and 6-year projections — so owners and investors can model income and expenditure over the full hold period rather than a single year.',
        activities: [
          PH + 'Configure multi-year budget terms for the required forward horizon',
          PH + 'Project rent escalations, lease events, and expense growth across the budget term',
          PH + 'Use long-term budgets for investor and board forward-projection reporting',
        ],
        mri_title: PH + 'Create Budget (App Menu > Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          PH + 'Lease and escalation data in CM accurate for the projection period',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Create Budget', desc: PH + 'Set the budget term to span multiple years for forward forecasting' },
        ],
      },
      {
        id: 'bf-structure-currency',
        title: 'Multi-Currency Support',
        type: 'process',
        desc: PH + 'Budget in split currencies where a single entity, building, or lease carries charges in different currencies, with currency translation applied for consolidated group reporting. Currency codes on recurring charges are respected during budget creation.',
        activities: [
          PH + 'Configure split-currency budgeting where charges are held in multiple currencies',
          PH + 'Confirm currency codes on recurring charges flow through to the budget correctly',
          PH + 'Apply currency translation for consolidated group-level reporting',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Currency codes and exchange rates configured in the core system',
          PH + 'Recurring charges in CM carry correct currency codes',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'Budget multi-currency charges at suite and lease level within the workbook' },
        ],
      },
    ],
  },

  // ─── COLUMN 3: Budget Creation & Management (§3.3) ──────────────────────────
  {
    id: 'bf-creation',
    title: 'Budget Creation & Management',
    processes: [
      {
        id: 'bf-creation-create',
        title: 'Budget Creation',
        type: 'process',
        desc: PH + 'Create budgets at scale using streamlined mass creation, including single-click creation with configurable assumptions. Minimal setup means clients can be up and running quickly, generating large numbers of property budgets from agreed assumptions.',
        activities: [
          PH + 'Select the entities, properties, and budget year for mass budget creation',
          PH + 'Apply configurable assumptions and budget setup groups at the point of creation',
          PH + 'Generate multiple budgets simultaneously and manage them together',
        ],
        mri_title: PH + 'Create Budget (App Menu > Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          PH + 'Global Options, Workbook Definitions, and Budget Setup Groups configured',
          PH + 'Source data in CM, RM, and GL accurate and available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Create Budget', desc: PH + 'New budget creation with CM/RM/GL workbook setup and configurable assumptions' },
        ],
      },
      {
        id: 'bf-creation-workbooks',
        title: 'Workbook Types',
        type: 'process',
        desc: PH + 'Work with the three workbook types that drive a budget: CM Workbooks for commercial income, RM Workbooks for residential income, and GL Workbooks for expense budgeting. Each workbook pulls source data from its corresponding core module.',
        activities: [
          PH + 'Select the workbook types required for each budget based on the property mix',
          PH + 'Use CM Workbooks for commercial lease-driven income budgeting',
          PH + 'Use RM Workbooks for residential unit and resident income budgeting',
          PH + 'Use GL Workbooks for expense budgeting against the chart of accounts',
        ],
        mri_title: PH + 'Create Budget (App Menu > Budgeting and Forecasting > Create Budget)',
        mri_prereqs: [
          PH + 'CM, RM, and GL source modules populated with accurate data',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'Commercial workbook — Suite, Lease, Building, and Calculation views' },
          { name: PH + 'App Menu > Budgeting and Forecasting > RM Workbook', desc: PH + 'Residential workbook — Summary, Property, Resident, and Calculation views' },
          { name: PH + 'App Menu > Budgeting and Forecasting > GL Workbook', desc: PH + 'Expense budgeting grid with hierarchy and autosave' },
        ],
      },
      {
        id: 'bf-creation-cmviews',
        title: 'CM Workbook Views',
        type: 'process',
        desc: PH + 'Use the CM Workbook views to build commercial income budgets at the level that suits the task — Suite View (Enhanced & Classic), Lease View, Building View, and Calculation View. Each view exposes a different slice of the lease and recovery data.',
        activities: [
          PH + 'Choose the appropriate CM workbook view for the budgeting task at hand',
          PH + 'Budget suite-level income in Suite View and lease-level income in Lease View',
          PH + 'Review building-level rollups in Building View',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'CM lease and suite data accurate and current',
          PH + 'My Preferences set for default Suite View (Enhanced vs Classic)',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'Switch between Suite, Lease, Building, and Calculation views to budget commercial income' },
        ],
        subs: [
          {
            id: 'bf-creation-cmviews-enhanced',
            title: 'Enhanced Suite View',
            desc: PH + 'Use the Enhanced Suite View for a modern suite-level budgeting experience with reactive resizing, a basic lease details link, and the ability to create prospect leases directly from the view for speculative income.',
            activities: [
              PH + 'Budget suite-level income using the reactive, resizable Enhanced Suite View',
              PH + 'Open basic lease details directly from the suite line',
              PH + 'Create prospect leases from the view to model speculative income',
            ],
            mri_title: PH + 'CM Workbook > Suite View (Enhanced) (App Menu > Budgeting and Forecasting > CM Workbook)',
            mri_prereqs: [
              PH + 'My Preferences set to default to Enhanced Suite View',
            ],
            mri_assoc: [
              { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Suite View (Enhanced)', desc: PH + 'Reactive suite-level budgeting with lease detail links and prospect lease creation' },
            ],
          },
          {
            id: 'bf-creation-cmviews-calc',
            title: 'Calculation View',
            desc: PH + 'Use the Calculation View to work with the Lease Cost & Commission worksheet and recovery worksheets — the detailed calculations behind tenant incentives, leasing commissions, and recoveries that feed the income budget.',
            activities: [
              PH + 'Open the Lease Cost & Commission worksheet to budget incentives and commissions',
              PH + 'Work through recovery worksheets to budget tenant recoveries',
              PH + 'Apply recovery worksheet overrides where the calculated apportionment needs adjustment',
            ],
            mri_title: PH + 'CM Workbook > Calculation View (App Menu > Budgeting and Forecasting > CM Workbook)',
            mri_prereqs: [
              PH + 'Expense budget available to drive recovery calculations',
            ],
            mri_assoc: [
              { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Calculation View', desc: PH + 'Lease Cost & Commission worksheet and recovery worksheets behind the income budget' },
            ],
          },
        ],
      },
      {
        id: 'bf-creation-glworkbook',
        title: 'GL Workbook',
        type: 'process',
        desc: PH + 'Budget expenses in the feature-rich GL Workbook grid, which offers autosave, an expanding account hierarchy, and keyboard shortcuts. Expense budgeting is supported by detail lines, account organisation, and historical GL values.',
        activities: [
          PH + 'Budget expenses against the chart of accounts in the GL Workbook grid',
          PH + 'Use the expanding hierarchy and keyboard shortcuts to navigate large account sets',
          PH + 'Reference historical GL values to inform expense budget figures',
          PH + 'Add detail lines to break down account-level budgets where needed',
        ],
        mri_title: PH + 'GL Workbook (App Menu > Budgeting and Forecasting > GL Workbook)',
        mri_prereqs: [
          PH + 'GL actuals and historical data available for the budgeted accounts',
          PH + 'GL Actuals Expense Exclusions configured where partial-year recovery pools apply',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > GL Workbook', desc: PH + 'Expense budgeting grid with autosave, expanding hierarchy, and historical GL value support' },
        ],
      },
      {
        id: 'bf-creation-modify',
        title: 'Modify Budgets',
        type: 'process',
        desc: PH + 'Adjust budgets after creation by reloading assumptions (CM, RM, inflation/seasonal indexes), applying reload locks, preserving copies, and extending workbook amounts and detail lines. Modification supports controlled in-cycle revision of an existing budget.',
        activities: [
          PH + 'Reload CM, RM, and inflation/seasonal index assumptions into an existing budget',
          PH + 'Apply reload locks (Lock All / Unlock All / Current Budget Setting) to protect figures',
          PH + 'Preserve a copy of the budget before modification per the Global Options setting',
          PH + 'Extend workbook amounts and detail lines as the budget is revised',
        ],
        mri_title: PH + 'Manage Budgets > Modify (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Default Preserve a Copy for Modify Budgets configured in Global Options',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets > Modify', desc: PH + 'Reload assumptions and locks, preserve copies, and extend amounts on an existing budget' },
        ],
      },
      {
        id: 'bf-creation-reforecast',
        title: 'Reforecasting',
        type: 'process',
        desc: PH + 'Create reforecasts from existing budgets using actual GL data to adjust figures, selecting up to 500 budgets at one time with configurable basis code selection. Reforecasting keeps projections current as the year progresses without rebuilding from scratch.',
        activities: [
          PH + 'Select existing budgets to reforecast — up to 500 at one time',
          PH + 'Use actual GL data to adjust the forecast figures',
          PH + 'Configure basis code selection to control how the reforecast is calculated',
          PH + 'Produce monthly, quarterly, or yearly reforecasts as required',
        ],
        mri_title: PH + 'Manage Budgets > Reforecast (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Original approved budgets in place to reforecast from',
          PH + 'GL actuals posted for the periods being reforecast',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets > Reforecast', desc: PH + 'Create reforecasts from existing budgets using actual GL data, up to 500 budgets at once' },
        ],
      },
      {
        id: 'bf-creation-prospect',
        title: 'Prospect Leases',
        type: 'process',
        desc: PH + 'Create basic or detailed prospect leases from the Suite View or Lease View to model speculative income from anticipated lettings. Prospect leases let the budget reflect expected leasing activity that has not yet been contracted.',
        activities: [
          PH + 'Create basic prospect leases for high-level speculative income assumptions',
          PH + 'Create detailed prospect leases where specific terms are anticipated',
          PH + 'Model expected new lettings and renewals within the income budget',
        ],
        mri_title: PH + 'CM Workbook > Suite/Lease View (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Suite and lease data current in CM',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Suite View / Lease View', desc: PH + 'Create basic or detailed prospect leases for speculative income budgeting' },
        ],
      },
      {
        id: 'bf-creation-importexport',
        title: 'Budget Import/Export',
        type: 'process',
        desc: PH + 'Import budgets from Excel and export budget output to BI platforms, with API enablement for third-party integration. Import/export supports clients who prepare figures externally or feed budgets into downstream analytics.',
        activities: [
          PH + 'Import prepared budget figures from Excel into B&F',
          PH + 'Export budget output to BI platforms for analysis and distribution',
          PH + 'Use the API to integrate budgets with third-party applications',
        ],
        mri_title: PH + 'Manage Budgets (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Import templates aligned to the budget structure',
          PH + 'API access configured for any third-party integration',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets', desc: PH + 'Import budgets from Excel and export to BI platforms; API-enabled for integration' },
        ],
      },
    ],
  },

  // ─── COLUMN 4: Budget Assumptions & Methodology (§3.4) ──────────────────────
  {
    id: 'bf-assumptions',
    title: 'Budget Assumptions & Methodology',
    processes: [
      {
        id: 'bf-assumptions-income',
        title: 'Income Assumptions',
        type: 'process',
        desc: PH + 'Budget rental income from the rent roll or lease assumptions, allowing for vacancies, escalations, and new lettings. Variable income such as parking, turnover rent, and pop-up retail is budgeted separately to reflect its different drivers.',
        activities: [
          PH + 'Budget base rental income from the rent roll or lease assumptions',
          PH + 'Allow for vacancies, rent escalations, and anticipated new lettings',
          PH + 'Budget variable income (parking, turnover rent, pop-up retail) separately',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Lease terms and escalation schedules accurate in CM',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'Budget rental and variable income from lease assumptions and the rent roll' },
        ],
      },
      {
        id: 'bf-assumptions-expense',
        title: 'Expense Assumptions',
        type: 'process',
        desc: PH + 'Budget expenses based on prior-year actuals with inflation adjustment, contracts and quotes, or other approaches, with macro-economic factors applied centrally across the portfolio. Consistent expense methodology supports comparable budgets across properties.',
        activities: [
          PH + 'Budget expenses from prior-year actuals adjusted for inflation',
          PH + 'Use contracts and quotes where firm expense figures are available',
          PH + 'Apply macro-economic factors centrally across the portfolio',
        ],
        mri_title: PH + 'GL Workbook (App Menu > Budgeting and Forecasting > GL Workbook)',
        mri_prereqs: [
          PH + 'GL historical actuals available for the expense accounts',
          PH + 'Inflation indexes configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > GL Workbook', desc: PH + 'Budget expenses from historical actuals with inflation and contract-based adjustments' },
        ],
      },
      {
        id: 'bf-assumptions-leasing',
        title: 'Leasing Assumptions',
        type: 'process',
        desc: PH + 'Configure assumptions for lease renewals and expirations — for example "Convert to MTM through End of Budget Term" — along with speculative leases, retail sales, and recovery estimates. Leasing assumptions model how the rent roll changes over the budget term.',
        activities: [
          PH + 'Configure renewal and expiration assumptions for expiring leases',
          PH + 'Model speculative leases for anticipated new lettings',
          PH + 'Set retail sales and recovery estimate assumptions',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Lease expiry and option data accurate in CM',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'Configure renewal, expiration, speculative, and recovery leasing assumptions' },
        ],
      },
      {
        id: 'bf-assumptions-capex',
        title: 'Capex Budget',
        type: 'process',
        desc: PH + 'Budget capital expenditure separately from operational expenditure so capital projects are planned and reported distinctly from running costs. Separating capex supports capital planning and the correct accounting treatment of capital spend.',
        activities: [
          PH + 'Budget capital projects separately from operating expenditure',
          PH + 'Plan capex by project or asset across the budget term',
          PH + 'Confirm capex is reported distinctly from opex',
        ],
        mri_title: PH + 'GL Workbook (App Menu > Budgeting and Forecasting > GL Workbook)',
        mri_prereqs: [
          PH + 'Capital accounts identified in the chart of accounts',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > GL Workbook', desc: PH + 'Budget capital expenditure separately from operational expenditure' },
        ],
      },
      {
        id: 'bf-assumptions-recoveries',
        title: 'Recoveries & Service Charges',
        type: 'process',
        desc: PH + 'Budget recoveries calculated from the expense budget and apportioned to tenants, with recovery worksheet overrides available where the standard apportionment needs adjustment. Recovery budgeting links expense assumptions to recoverable income.',
        activities: [
          PH + 'Calculate budgeted recoveries from the expense budget',
          PH + 'Apportion recoveries to tenants per their recovery terms',
          PH + 'Apply recovery worksheet overrides where standard apportionment needs adjusting',
        ],
        mri_title: PH + 'CM Workbook > Calculation View (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Expense budget complete to drive recovery calculations',
          PH + 'Recovery worksheet overrides configured where required',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Calculation View', desc: PH + 'Recovery worksheets that calculate and apportion budgeted recoveries to tenants' },
        ],
      },
      {
        id: 'bf-assumptions-incentives',
        title: 'Tenant Incentives & Commissions',
        type: 'process',
        desc: PH + 'Budget rent-free periods, tenant installation allowances, and leasing commissions through the Lease Cost & Commission worksheet. These leasing costs are budgeted alongside the income they help secure.',
        activities: [
          PH + 'Budget rent-free periods and tenant installation allowances',
          PH + 'Budget leasing commissions via the Lease Cost & Commission worksheet',
          PH + 'Tie incentive and commission costs to the associated lease assumptions',
        ],
        mri_title: PH + 'CM Workbook > Calculation View (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Lease assumptions in place to associate incentives and commissions with',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Lease Cost & Commission Worksheet', desc: PH + 'Budget rent-free periods, installation allowances, and leasing commissions' },
        ],
      },
      {
        id: 'bf-assumptions-indexes',
        title: 'Inflation & Seasonal Indexes',
        type: 'process',
        desc: PH + 'Apply CPI and seasonal indexes to budget figures, reloading them during budget modification. Indexes allow consistent inflationary and seasonal adjustment to be applied across the budget without manual line-by-line changes.',
        activities: [
          PH + 'Configure CPI and seasonal indexes for the budget cycle',
          PH + 'Apply indexes to relevant income and expense lines',
          PH + 'Reload indexes during budget modification as assumptions change',
        ],
        mri_title: PH + 'Recovery & CPI Worksheet Overrides (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'CPI and seasonal index values maintained',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Recovery & CPI Worksheet Overrides', desc: PH + 'Maintain and override CPI and seasonal index values used in budgeting' },
        ],
      },
      {
        id: 'bf-assumptions-mgmtfees',
        title: 'Management Fees',
        type: 'process',
        desc: PH + 'Budget management fees by entering a management fee rate on the suite and lease detail pages, using the configurable fee method. Management fee budgeting reflects the fee income or cost arising from the budgeted property activity.',
        activities: [
          PH + 'Enter management fee rates on suite and lease detail pages',
          PH + 'Select the configurable fee method appropriate to the client',
          PH + 'Confirm management fees flow into the budget output correctly',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'Fee method configured for the entity',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook > Suite/Lease Detail', desc: PH + 'Enter management fee rates using the configurable fee method' },
        ],
      },
    ],
  },

  // ─── COLUMN 5: Variance Reporting & Analysis (§3.5) ─────────────────────────
  {
    id: 'bf-variance',
    title: 'Variance Reporting & Analysis',
    processes: [
      {
        id: 'bf-variance-budgetactual',
        title: 'Budget vs Actual Variance',
        type: 'process',
        desc: PH + 'Report variance between budget and actuals by month, quarter, and year across configurable reporting dimensions. Budget-vs-actual analysis is the core control output that shows where performance is diverging from plan.',
        activities: [
          PH + 'Run budget-vs-actual variance reports by month, quarter, and year',
          PH + 'Configure the reporting dimensions required for the analysis',
          PH + 'Review variances at property, entity, and group level',
        ],
        mri_title: PH + 'B&F Variance Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Approved budgets posted and GL actuals available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Budget-vs-actual variance reporting across configurable dimensions and periods' },
        ],
      },
      {
        id: 'bf-variance-suite',
        title: 'Suite Budget Variance Report',
        type: 'process',
        desc: PH + 'Use the MRIX_SUITVAR report to compare projected versus actual suite-level revenue. Suite-level variance reporting requires suite budgets to have been posted to the SUITBUDGET table.',
        activities: [
          PH + 'Post suite budgets to the SUITBUDGET table to enable suite-level comparison',
          PH + 'Run the MRIX_SUITVAR report to compare projected vs actual suite revenue',
          PH + 'Investigate suite-level variances against leasing expectations',
        ],
        mri_title: PH + 'MRIX_SUITVAR (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Budget contains a CM workbook and suite budgets posted to SUITBUDGET',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports > MRIX_SUITVAR', desc: PH + 'Compares projected versus actual suite-level revenue' },
        ],
      },
      {
        id: 'bf-variance-prioryear',
        title: 'Prior Year Comparison',
        type: 'process',
        desc: PH + 'Include prior-year actuals alongside the current-year budget and actuals so trends and year-on-year movement are visible within the same report. Prior-year context helps reviewers judge whether budget assumptions are reasonable.',
        activities: [
          PH + 'Include prior-year actuals in current-year variance reports',
          PH + 'Compare year-on-year movement against the budgeted change',
          PH + 'Use prior-year trends to validate budget assumptions',
        ],
        mri_title: PH + 'B&F Variance Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Prior-year actuals available in GL',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Include prior-year actuals alongside current-year budget and actuals' },
        ],
      },
      {
        id: 'bf-variance-commentary',
        title: 'Variance Commentary',
        type: 'process',
        desc: PH + 'Add management commentary to variance reports for board and investor submissions, explaining the drivers behind significant variances. Commentary turns raw variance figures into a narrative stakeholders can act on.',
        activities: [
          PH + 'Capture management commentary against significant variances',
          PH + 'Include commentary in board and investor variance submissions',
          PH + 'Maintain commentary consistently across reporting periods',
        ],
        mri_title: PH + 'B&F Variance Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Variance reports prepared for the reporting period',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Add management commentary to variance reports for board/investor submissions' },
        ],
      },
      {
        id: 'bf-variance-reforecast',
        title: 'Reforecasting from Variances',
        type: 'process',
        desc: PH + 'Update forecast figures when significant variances are identified, with the revised forecast preserved without affecting the original approved budget. This keeps the live forecast realistic while protecting the integrity of the signed-off budget.',
        activities: [
          PH + 'Identify significant variances that warrant a forecast update',
          PH + 'Revise forecast figures while preserving the original approved budget',
          PH + 'Communicate the revised forecast alongside the approved budget',
        ],
        mri_title: PH + 'Manage Budgets > Reforecast (App Menu > Budgeting and Forecasting > Manage Budgets)',
        mri_prereqs: [
          PH + 'Original approved budget retained for comparison',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets > Reforecast', desc: PH + 'Update forecast figures from variances without affecting the original approved budget' },
        ],
      },
    ],
  },

  // ─── COLUMN 6: Reporting & Distribution (§3.6) ──────────────────────────────
  {
    id: 'bf-reporting',
    title: 'Reporting & Distribution',
    processes: [
      {
        id: 'bf-reporting-board',
        title: 'Board & Investor Reporting',
        type: 'process',
        desc: PH + 'Produce budget, forecast, and actual data for board and investor reports, with IFRS/JSE compliance where required. B&F ties these reports directly to budgeted and actual data so investor reporting draws on a single source of truth.',
        activities: [
          PH + 'Compile budget, forecast, and actual data for board and investor packs',
          PH + 'Apply IFRS/JSE compliance formatting where required',
          PH + 'Tie reporting directly to budgeted and actual figures in the system',
        ],
        mri_title: PH + 'B&F Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Approved budgets and actuals available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Board and investor reporting tied to budgeted and actual data' },
        ],
      },
      {
        id: 'bf-reporting-pl',
        title: 'P&L Views',
        type: 'process',
        desc: PH + 'Produce full profit-and-loss views of the final budget output through standard and custom reports. P&L views present the budget in the financial format stakeholders expect for review and approval.',
        activities: [
          PH + 'Generate full P&L views of the final budget output',
          PH + 'Use standard reports for routine P&L presentation',
          PH + 'Build custom P&L reports where bespoke formats are required',
        ],
        mri_title: PH + 'B&F Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Budget finalised and posted',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Full P&L views of the final budget output via standard and custom reports' },
        ],
      },
      {
        id: 'bf-reporting-format',
        title: 'Report Format & Distribution',
        type: 'process',
        desc: PH + 'Output reports as Excel, PDF, or portal delivery, configurable per stakeholder group. Flexible output ensures each audience receives budget information in the format and channel that suits them.',
        activities: [
          PH + 'Configure report output format (Excel, PDF, portal) per stakeholder group',
          PH + 'Distribute reports through the appropriate channel for each audience',
          PH + 'Maintain distribution lists and delivery preferences',
        ],
        mri_title: PH + 'B&F Reports (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Stakeholder distribution requirements defined',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports', desc: PH + 'Output reports as Excel, PDF, or portal delivery configurable per stakeholder' },
        ],
      },
      {
        id: 'bf-reporting-selfservice',
        title: 'Self-Service Reporting',
        type: 'process',
        desc: PH + 'Provide standard and custom reports on a self-service basis using Rapid Reports and Report Design, so users can access budget information without relying on a central reporting team.',
        activities: [
          PH + 'Enable self-service access to standard budget reports',
          PH + 'Use Rapid Reports and Report Design to build custom self-service reports',
          PH + 'Govern self-service report access through security',
        ],
        mri_title: PH + 'Rapid Reports / Report Design (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Rapid Reports and Report Design available and user access configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports > Rapid Reports / Report Design', desc: PH + 'Self-service standard and custom report access' },
        ],
      },
      {
        id: 'bf-reporting-budcalc',
        title: 'Budgeting Calculation Report',
        type: 'process',
        desc: PH + 'Use the BF_BUDCALC report to review the calculations behind budget figures, with an option to hide calculation results from the Communication Center where that detail should not be exposed.',
        activities: [
          PH + 'Run the BF_BUDCALC report to review budget calculation results',
          PH + 'Use the option to hide calculation results from the Communication Center where appropriate',
          PH + 'Validate calculated figures against expectations before finalisation',
        ],
        mri_title: PH + 'BF_BUDCALC (App Menu > Budgeting and Forecasting > Reports)',
        mri_prereqs: [
          PH + 'Budget calculations complete',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Reports > BF_BUDCALC', desc: PH + 'Budgeting calculation report with option to hide results from the Communication Center' },
        ],
      },
    ],
  },

  // ─── COLUMN 7: Integration & System Impact (§3.7) ───────────────────────────
  {
    id: 'bf-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'bf-integration-gl',
        title: 'GL Integration',
        type: 'process',
        desc: PH + 'Post approved budgets to the General Ledger and pull GL actuals back for variance analysis. GL integration makes B&F the budgeting front end to the core ledger, keeping budget and actual data aligned.',
        activities: [
          PH + 'Post approved budgets to GL via the Post to GL function',
          PH + 'Post suite budgets to the SUITBUDGET table where the budget contains a CM workbook',
          PH + 'Pull GL actuals into B&F for variance analysis and reforecasting',
        ],
        mri_title: PH + 'Post to GL (App Menu > Budgeting and Forecasting > Manage Budgets > Post to GL)',
        mri_prereqs: [
          PH + 'Budget approved and locked before posting',
          PH + 'GL period open for the budget year',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > Manage Budgets > Post to GL', desc: PH + 'Post approved budget to GL; Suite Budget option available for CM workbooks only' },
        ],
      },
      {
        id: 'bf-integration-cm',
        title: 'CM Dependency',
        type: 'process',
        desc: PH + 'Manage the dependency of B&F on the Commercial Management module — any customisations built for CM must be rebuilt in the B&F module. This dependency must be planned for during implementation and whenever CM is customised.',
        activities: [
          PH + 'Identify CM customisations that affect budgeting and must be rebuilt in B&F',
          PH + 'Plan rebuild effort whenever CM is customised post go-live',
          PH + 'Confirm CM source data is accurate, as B&F budgets depend on it',
        ],
        mri_title: PH + 'CM Workbook (App Menu > Budgeting and Forecasting > CM Workbook)',
        mri_prereqs: [
          PH + 'CM module implemented and customisations documented',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > CM Workbook', desc: PH + 'B&F relies on CM; CM customisations must be rebuilt in the B&F module' },
        ],
      },
      {
        id: 'bf-integration-api',
        title: 'API Integration',
        type: 'process',
        desc: PH + 'Use the full suite of APIs to integrate B&F with third-party applications such as IBM Cognos and IT2, with CRON jobs automating data retrieval without manual involvement. API integration extends budgeting into the wider analytics and treasury landscape.',
        activities: [
          PH + 'Configure API integration with third-party applications (e.g. Cognos, IT2)',
          PH + 'Schedule CRON jobs to automate data retrieval',
          PH + 'Validate integrated data flows end to end',
        ],
        mri_title: PH + 'B&F API (Setup & Maintenance / API configuration)',
        mri_prereqs: [
          PH + 'API access provisioned and third-party endpoints available',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting', desc: PH + 'Configure API integration and automated CRON-based data retrieval' },
        ],
      },
      {
        id: 'bf-integration-sso',
        title: 'SSO & Security',
        type: 'process',
        desc: PH + 'Leverage MRI\'s SSO and security settings for B&F, combining user-defined security with client-defined workbook security teams. Security controls who can create, edit, approve, and report on budgets.',
        activities: [
          PH + 'Configure B&F to use MRI SSO and security settings',
          PH + 'Apply user-defined security to control feature access',
          PH + 'Set up client-defined workbook security teams for workbook-level access',
        ],
        mri_title: PH + 'Workbook Security Teams (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'MRI SSO and security framework configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Workbook Security Teams', desc: PH + 'Client-defined workbook security teams layered on MRI SSO and security' },
        ],
      },
      {
        id: 'bf-integration-audit',
        title: 'Audit Trail',
        type: 'process',
        desc: PH + 'Leverage MRI\'s audit trail functionality to track budget changes over the cycle. The audit trail supports governance, investor assurance, and the ability to explain how a budget reached its final figures.',
        activities: [
          PH + 'Enable audit trail tracking for budget changes',
          PH + 'Review the audit trail when investigating budget movements',
          PH + 'Use audit data to support governance and investor assurance',
        ],
        mri_title: PH + 'Audit Trail (MRI core audit functionality)',
        mri_prereqs: [
          PH + 'MRI audit trail enabled for the environment',
        ],
        mri_assoc: [
          { name: PH + 'MRI Audit Trail', desc: PH + 'Tracks budget changes using MRI\'s core audit trail functionality' },
        ],
      },
    ],
  },

  // ─── COLUMN 8: Setup & Configuration (§3.8) ─────────────────────────────────
  {
    id: 'bf-setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'bf-setup-global',
        title: 'Global Options',
        type: 'process',
        desc: PH + 'Configure system-wide B&F behaviour through Global Options — for example the Default Preserve a Copy for Modify Budgets setting (No / Yes and Option / Yes and Required). Global Options establish baseline behaviour before budgets can be created.',
        activities: [
          PH + 'Set system-wide B&F configuration via Global Options',
          PH + 'Configure Default Preserve a Copy for Modify Budgets (No / Yes and Option / Yes and Required)',
          PH + 'Confirm global settings before the first budget is created',
        ],
        mri_title: PH + 'Global Options (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'B&F module licensed and enabled',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Global Options', desc: PH + 'System-wide B&F configuration including Preserve a Copy behaviour' },
        ],
      },
      {
        id: 'bf-setup-scenarios',
        title: 'Scenario Types',
        type: 'process',
        desc: PH + 'Set up budget scenario types for the different budgeting approaches the organisation uses. Scenario types underpin the named versions and scenario analysis available during budget creation.',
        activities: [
          PH + 'Define the scenario types needed for the organisation\'s budgeting approaches',
          PH + 'Map scenario types to the named versions used in budgeting',
          PH + 'Maintain scenario types as budgeting practice evolves',
        ],
        mri_title: PH + 'Scenario Types (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Budgeting approaches and version strategy agreed',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Scenario Types', desc: PH + 'Set up budget scenario types for different budgeting approaches' },
        ],
      },
      {
        id: 'bf-setup-workbookdefs',
        title: 'Workbook Definitions',
        type: 'process',
        desc: PH + 'Define workbook structures and parameters so the CM, RM, and GL workbooks present the right columns, views, and behaviour for the client. Workbook definitions tailor the budgeting experience to the implementation.',
        activities: [
          PH + 'Define the structure and parameters of each workbook type',
          PH + 'Tailor workbook views and columns to client requirements',
          PH + 'Validate definitions before workbooks are used in live budgets',
        ],
        mri_title: PH + 'Workbook Definitions (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Global Options configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Workbook Definitions', desc: PH + 'Define workbook structures and parameters' },
        ],
      },
      {
        id: 'bf-setup-securityteams',
        title: 'Workbook Security Teams',
        type: 'process',
        desc: PH + 'Configure team-based access to workbooks so each user can only view and edit the workbooks relevant to their role. Workbook security teams operationalise the contributor access model.',
        activities: [
          PH + 'Create workbook security teams aligned to roles and responsibilities',
          PH + 'Assign users to teams to control workbook access',
          PH + 'Review team membership each budget cycle',
        ],
        mri_title: PH + 'Workbook Security Teams (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'MRI users and security configured',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Workbook Security Teams', desc: PH + 'Configure team-based access to workbooks' },
        ],
      },
      {
        id: 'bf-setup-setupgroups',
        title: 'Budget Setup Groups',
        type: 'process',
        desc: PH + 'Create reusable assumption groups for mass budget creation, so common budgeting parameters can be applied consistently across many budgets in a single operation.',
        activities: [
          PH + 'Build reusable assumption groups for mass budget creation',
          PH + 'Apply setup groups when generating budgets at scale',
          PH + 'Maintain setup groups as standard assumptions change',
        ],
        mri_title: PH + 'Budget Setup Groups (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Standard assumption methodology agreed',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Budget Setup Groups', desc: PH + 'Reusable assumption groups for mass budget creation' },
        ],
      },
      {
        id: 'bf-setup-overrides',
        title: 'Recovery & CPI Worksheet Overrides',
        type: 'process',
        desc: PH + 'Override recovery calculations and CPI index values for specific budget scenarios where the standard configuration does not apply. Overrides give finance the flexibility to model exceptions without changing global settings.',
        activities: [
          PH + 'Configure recovery calculation overrides for specific budget scenarios',
          PH + 'Override CPI index values where a scenario requires it',
          PH + 'Document overrides so they can be reviewed and reversed',
        ],
        mri_title: PH + 'Recovery & CPI Worksheet Overrides (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Standard recovery and CPI configuration in place',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > Recovery & CPI Worksheet Overrides', desc: PH + 'Override recovery calculations and CPI index values for specific scenarios' },
        ],
      },
      {
        id: 'bf-setup-exclusions',
        title: 'GL Actuals Expense Exclusions',
        type: 'process',
        desc: PH + 'Configure exclusions for partial-year recovery pools so GL actuals that should not contribute to recovery calculations are excluded. Exclusions keep recovery budgeting accurate where pools cover only part of the year.',
        activities: [
          PH + 'Identify GL actuals that should be excluded from recovery pools',
          PH + 'Configure exclusions for partial-year recovery pools',
          PH + 'Validate recovery calculations after applying exclusions',
        ],
        mri_title: PH + 'GL Actuals Expense Exclusions (App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting)',
        mri_prereqs: [
          PH + 'Recovery pools and GL account mapping defined',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Setup > Setup and Maintenance > Budgeting and Forecasting > GL Actuals Expense Exclusions', desc: PH + 'Configure exclusions for partial-year recovery pools' },
        ],
      },
      {
        id: 'bf-setup-preferences',
        title: 'My Preferences',
        type: 'process',
        desc: PH + 'Set user-level preferences such as the default CM Suite View (Enhanced vs Classic), so each user works in the interface configuration that suits them without affecting others.',
        activities: [
          PH + 'Set the default CM Suite View (Enhanced vs Classic) per user',
          PH + 'Configure other user-level preferences for the budgeting experience',
          PH + 'Confirm preferences apply without affecting other users',
        ],
        mri_title: PH + 'My Preferences (App Menu > Budgeting and Forecasting > My Preferences)',
        mri_prereqs: [
          PH + 'User has B&F access',
        ],
        mri_assoc: [
          { name: PH + 'App Menu > Budgeting and Forecasting > My Preferences', desc: PH + 'User preferences including the default CM Suite View (Enhanced vs Classic)' },
        ],
      },
    ],
  },
];
