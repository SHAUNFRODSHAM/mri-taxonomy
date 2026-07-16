// ═══════════════════════════════════════════════════════════════════════════
// Job Cost (JC) — Module Data
//
// Structured on the JC Module Taxonomy (§3 Functional Taxonomy): 8 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// JC is the capital-project sub-ledger: it tracks project expenditure —
// commitments, draws and retainage — against user-defined budgets at
// Job → Phase → Cost Code level, feeds journals to GL, and can build
// Work-in-Progress (WIP) assets for handover to Fixed Asset Accounting (FAA).
// JC requires AP and Purchase Orders to be configured and linked.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI JC SME before client delivery. Several core setup
// functions (JobCost Options, Lookup Codes) remain in the MRI for Windows client.
//
// Source reference: MRI PMX Job Cost (JC) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const jc = [

  /* ── 1. SETUP & CONFIGURATION ────────────────────────────────────────────── */
  {
    id: 'jc-setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'jc-setup-config',
        title: 'JobCost Options',
        type: 'process',
        desc: 'The module-wide switches that govern how strictly JC controls spend and how contracts and draws are processed. Set at implementation (in the MRI for Windows client), these options shape every job that follows.',
        activities: [
          'Set the budget validation level — original only, or including approved and/or pending revisions',
          'Choose the contract approval model (single-step, or two-step at line-item level) and whether corrections to approved contracts are allowed',
          'Enable consolidated draw processing and configure invoice line-item attachment and multi-contract validation',
        ],
        mri_title: 'JobCost Options (MRI for Windows > MGNT-MRI > JobCost Options)',
        mri_prereqs: [
          'GL Chart of Accounts finalised before cost codes can be mapped',
          'Retainage accounts set on entity cash maps (GL) before jobs can run',
        ],
        mri_assoc: [
          { name: 'MRI for Windows > MGNT-MRI > JobCost Options', desc: 'Budget validation, draw processing and approval model switches' },
        ],
        subs: [
          {
            id: 'jc-setup-config-validation',
            title: 'Budget Validation & Corrections',
            desc: 'How strictly contract amounts are checked against budgets, and whether approved contracts can be corrected.',
            activities: [
              'Set the budget validation level',
              'Decide whether corrections after draws are permitted',
            ],
            mri_title: 'MRI for Windows > MGNT-MRI > JobCost Options',
            mri_assoc: [
              { name: 'MRI for Windows > MGNT-MRI > JobCost Options', desc: 'Budget validation settings' },
            ],
          },
          {
            id: 'jc-setup-config-draws',
            title: 'Draw & Approval Model',
            desc: 'Consolidated draw processing and the contract approval model.',
            activities: [
              'Enable/disable consolidated draw processing',
              'Set single- or two-step contract approval',
            ],
            mri_title: 'MRI for Windows > MGNT-MRI > JobCost Options',
            mri_assoc: [
              { name: 'MRI for Windows > MGNT-MRI > JobCost Options', desc: 'Draw and approval configuration' },
            ],
          },
        ],
      },
      {
        id: 'jc-setup-lookups',
        title: 'Lookup Codes',
        type: 'process',
        desc: 'The reference code lists that classify budgets, cost codes, contract changes and revisions — maintained in the Windows CODELIST client. Consistent codes keep reporting comparable across jobs.',
        activities: [
          'Maintain budget entry types (JC_BUDGCAT) and cost-code categories (JC_CATEGORY — hard/soft costs, land, tenant improvements, equity)',
          'Maintain contract change reasons (JC_CNTRCAT) and revision note types (JC_REV_TYPE)',
          'Maintain units of measure (JC_UNITS)',
        ],
        mri_title: 'Lookup Codes (MRI for Windows > CODELIST-MRI)',
        mri_prereqs: [
          'JobCost Options configured',
        ],
        mri_assoc: [
          { name: 'MRI for Windows > CODELIST-MRI', desc: 'JC_BUDGCAT, JC_CATEGORY, JC_CNTRCAT, JC_REV_TYPE, JC_UNITS' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. PHASE TYPES, BUDGET TYPES & COST CODES ───────────────────────────── */
  {
    id: 'jc-codes',
    title: 'Phase Types, Budget Types & Cost Codes',
    processes: [
      {
        id: 'jc-codes-types',
        title: 'Phase & Budget Types',
        type: 'process',
        desc: 'The classifications that stage a project and let the same job be budgeted from different perspectives — phase types for project stages, and budget types for parallel proforma, lender and internal-tracking budgets. Budget-type changes cascade to all jobs using them.',
        activities: [
          'Define phase types for project stages (e.g. Building, Construction, Preconstruction, Tenant Fitout)',
          'Set up budget types for parallel budgets — proforma/equity, lender/bank loan, internal tracking',
          'Manage changes carefully, as budget-type description changes cascade to all jobs using that type',
        ],
        mri_title: 'Phase & Budget Types (JC > Setup and Maintenance > JobCost)',
        mri_prereqs: [
          'JobCost Options and lookup codes configured',
        ],
        mri_assoc: [
          { name: 'JC > Setup and Maintenance > JobCost > Phase Types', desc: 'Reference classifications for project stages' },
          { name: 'JC > Setup and Maintenance > JobCost > Budget Types', desc: 'Parallel budget perspectives per job' },
        ],
        subs: [
          {
            id: 'jc-codes-types-phase',
            title: 'Phase Types',
            desc: 'Reference classifications for the stages a project moves through.',
            activities: [
              'Use MRI defaults (BLD, CON, MALL) or custom types',
              'Assign phase types when building jobs',
            ],
            mri_title: 'JC > Setup and Maintenance > JobCost > Phase Types',
            mri_assoc: [
              { name: 'JC > Setup and Maintenance > JobCost > Phase Types', desc: 'Phase type setup' },
            ],
          },
          {
            id: 'jc-codes-types-budget',
            title: 'Budget Types',
            desc: 'Parallel budgets for the same job from different perspectives.',
            activities: [
              'Set up proforma, lender and internal budget types',
              'Note that description changes cascade to all jobs',
            ],
            mri_title: 'JC > Setup and Maintenance > JobCost > Budget Types',
            mri_assoc: [
              { name: 'JC > Setup and Maintenance > JobCost > Budget Types', desc: 'Budget type setup' },
            ],
          },
        ],
      },
      {
        id: 'jc-codes-costcodes',
        title: 'Cost Lists & Cost Codes',
        type: 'process',
        desc: 'The cost-coding structure — analogous to a GL chart of accounts — against which all budgets, contracts and costs are tracked. Good cost-list design is critical for consistent reporting across projects.',
        activities: [
          'Choose a cost-list strategy (one list for all jobs, or separate lists by project type)',
          'Define cost codes (land, site prep, structural, mechanical, professional fees, contingency) with type, category and GL account mapping',
          'Use AIA industry-standard codes or a customised structure; set up lenders as part of essential setup',
        ],
        mri_title: 'Cost Lists & Cost Codes (JC > Manage Jobs > More Actions > Add/Edit Cost Lists)',
        mri_prereqs: [
          'GL Chart of Accounts finalised so cost codes can be mapped',
        ],
        mri_assoc: [
          { name: 'JC > Setup and Maintenance > JobCost > Cost Lists / Cost Codes', desc: 'Cost coding structure and GL mapping' },
          { name: 'JC > Manage Jobs > More Actions > Add/Edit Cost Lists', desc: 'Assign cost lists at job/phase level' },
        ],
        subs: [
          {
            id: 'jc-codes-costcodes-lists',
            title: 'Cost List Strategy',
            desc: 'How cost lists are organised across the job portfolio.',
            activities: [
              'Decide one shared list vs lists by project type',
              'Assign cost lists at job/phase level',
            ],
            mri_title: 'JC > Manage Jobs > More Actions > Add/Edit Cost Lists',
            mri_assoc: [
              { name: 'JC > Setup and Maintenance > JobCost', desc: 'Cost list organisation' },
            ],
          },
          {
            id: 'jc-codes-costcodes-codes',
            title: 'Cost Code Attributes & GL Mapping',
            desc: 'The definition of each cost code — type, category, units and GL account.',
            activities: [
              'Set cost-code type (hard/soft), category and units of measure',
              'Map each cost code to its GL ledger code and default account',
            ],
            mri_title: 'JC > Setup and Maintenance > JobCost > Cost Codes',
            mri_assoc: [
              { name: 'JC > Setup and Maintenance > JobCost > Cost Codes', desc: 'Cost code attributes and GL mapping' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 3. JOB MANAGEMENT ───────────────────────────────────────────────────── */
  {
    id: 'jc-jobs',
    title: 'Job Management',
    processes: [
      {
        id: 'jc-jobs-manage',
        title: 'Job Setup & Maintenance',
        type: 'process',
        desc: 'Creating and maintaining the job — the container that holds all costs, contracts, budgets and reporting for a project. The job and its phases are the backbone every other JC process attaches to.',
        activities: [
          'Create the job record with code, description, status, start/completion dates and entity association',
          'Set up job phases (using phase types) and their phase-level cost lists',
          'Track job status (active, completed, on-hold) and handle multi-entity jobs spanning GL entities',
        ],
        mri_title: 'Manage Jobs (JC > Manage Jobs)',
        mri_prereqs: [
          'Phase types, budget types and cost lists configured',
          'Entity association available in GL',
        ],
        mri_assoc: [
          { name: 'JC > Manage Jobs', desc: 'Job setup, phases and cost-list assignment' },
        ],
        subs: [
          {
            id: 'jc-jobs-manage-attributes',
            title: 'Job Attributes',
            desc: 'The core job record and its key attributes.',
            activities: [
              'Capture code, description, status and dates',
              'Associate the job with its GL entity',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Manage Jobs', desc: 'Job attribute maintenance' },
            ],
          },
          {
            id: 'jc-jobs-manage-phases',
            title: 'Phases & Status',
            desc: 'Job phases, their cost lists, and status/multi-entity handling.',
            activities: [
              'Set up phases and phase-level cost lists',
              'Track status and multi-entity jobs',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Manage Jobs', desc: 'Job phases and status' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. BUDGET MANAGEMENT ────────────────────────────────────────────────── */
  {
    id: 'jc-budgets',
    title: 'Budget Management',
    processes: [
      {
        id: 'jc-budgets-control',
        title: 'Job Budget Control',
        type: 'process',
        desc: 'Setting and controlling job budgets and tracking them against actuals in real time. The budget is the yardstick JC validates commitments and draws against, so its accuracy governs cost control on the project.',
        activities: [
          'Create original budgets by budget type, entity, phase, cost list and cost code (or upload from spreadsheet)',
          'Manage approved and pending budget revisions with revision notes and types',
          'Track budget-to-actual variance on a project-to-date, calendar, consolidated or percentage-of-completion basis',
        ],
        mri_title: 'Manage Jobs — Budgets (JC > Manage Jobs)',
        mri_prereqs: [
          'Cost codes and budget types configured',
        ],
        mri_assoc: [
          { name: 'JC > Manage Jobs', desc: 'Original budgets, revisions and budget-to-actual tracking' },
        ],
        subs: [
          {
            id: 'jc-budgets-control-original',
            title: 'Original Budgets & Upload',
            desc: 'Creating the baseline budget, including spreadsheet upload.',
            activities: [
              'Create original budgets by type/phase/cost code',
              'Upload project budgets from spreadsheet',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Manage Jobs', desc: 'Original budget creation and upload' },
            ],
          },
          {
            id: 'jc-budgets-control-revisions',
            title: 'Revisions & Variance',
            desc: 'Budget revisions and real-time budget-to-actual variance tracking.',
            activities: [
              'Manage approved and pending revisions with notes',
              'Track variance (project-to-date, calendar, POC)',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Manage Jobs', desc: 'Budget revisions and variance' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. CONTRACT MANAGEMENT ──────────────────────────────────────────────── */
  {
    id: 'jc-contracts',
    title: 'Contract Management',
    processes: [
      {
        id: 'jc-contracts-lifecycle',
        title: 'Contract Lifecycle',
        type: 'process',
        desc: 'Setting up and managing the contracts and subcontracts for the work being performed, and tracking every committed cost against the budget. Commitments are how JC controls spend before invoices ever arrive.',
        activities: [
          'Set up contracts and subcontracts for the work being performed',
          'Process change orders/revisions with reasons; route through single- or two-step approval and validate against budget',
          'Track commitments against budget, using POs where the PO module is present (or JC commitments where it is not)',
        ],
        mri_title: 'Contracts (JC > Contracts)',
        mri_prereqs: [
          'Budgets in place to validate contracts against',
          'AP and Purchase Orders configured and linked for full functionality',
        ],
        mri_assoc: [
          { name: 'JC > Contracts', desc: 'Contract setup, change orders, revisions and approvals' },
        ],
        subs: [
          {
            id: 'jc-contracts-lifecycle-setup',
            title: 'Contract & Subcontract Setup',
            desc: 'Creating contracts and subcontracts for the work.',
            activities: [
              'Set up contracts and subcontracts',
              'Validate against budget per the validation level',
            ],
            mri_title: 'JC > Contracts',
            mri_assoc: [
              { name: 'JC > Contracts', desc: 'Contract and subcontract setup' },
            ],
          },
          {
            id: 'jc-contracts-lifecycle-changes',
            title: 'Change Orders & Commitments',
            desc: 'Change-order processing and commitment tracking (via POs where available).',
            activities: [
              'Process change orders with reasons and approval',
              'Track committed costs against budget',
            ],
            mri_title: 'JC > Contracts',
            mri_assoc: [
              { name: 'JC > Contracts', desc: 'Change orders and commitment tracking' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 6. DRAWS, INVOICES & RETAINAGE ──────────────────────────────────────── */
  {
    id: 'jc-payments',
    title: 'Draws, Invoices & Retainage',
    processes: [
      {
        id: 'jc-payments-draws',
        title: 'Draws & Invoices',
        type: 'process',
        desc: 'Making draws against contracts for work performed and creating the invoices that pay contractors. The consolidated draw flow streamlines this, and JC journals post the cost to the GL.',
        activities: [
          'Make draws against contracts for work performed, using the consolidated draw flow',
          'Create draw invoices that pay contractors (zero-net draws supported) and attach pre-existing AP invoices',
          'Post JC journal entries to GL',
        ],
        mri_title: 'Draws (JC > Draws)',
        mri_prereqs: [
          'Contracts in place with work performed to draw against',
          'AP configured — draws create invoices that pay contractors',
        ],
        mri_assoc: [
          { name: 'JC > Draws', desc: 'Consolidated draws, invoice creation and zero-net draws' },
          { name: 'JC > Invoice / PO / Journal Processing', desc: 'Invoice, PO and journal-entry processing' },
        ],
        subs: [
          {
            id: 'jc-payments-draws-draw',
            title: 'Contract Draws',
            desc: 'Drawing against contracts for work performed.',
            activities: [
              'Create contract draws via the consolidated flow',
              'Support zero-net draws',
            ],
            mri_title: 'JC > Draws',
            mri_assoc: [
              { name: 'JC > Draws', desc: 'Contract draw creation' },
            ],
          },
          {
            id: 'jc-payments-draws-invoice',
            title: 'Draw Invoices & Journals',
            desc: 'Creating contractor invoices and posting JC journals.',
            activities: [
              'Create invoices that pay contractors; attach pre-existing AP invoices',
              'Post JC journal entries to GL',
            ],
            mri_title: 'JC > Invoice / PO / Journal Processing',
            mri_assoc: [
              { name: 'JC > Invoice / PO / Journal Processing', desc: 'Invoice and journal processing' },
            ],
          },
        ],
      },
      {
        id: 'jc-payments-retainage',
        title: 'Retainage',
        type: 'process',
        desc: 'Holding back a portion of each payment until work is completed satisfactorily, then releasing and invoicing it on completion. Retainage protects the owner and is a standard construction-accounting control.',
        activities: [
          'Withhold retainage from contractor payments as work progresses',
          'Release and invoice retainage on satisfactory completion',
        ],
        mri_title: 'Retainage (JC > Retainage)',
        mri_prereqs: [
          'Retainage accounts set on entity cash maps (GL) before jobs run',
        ],
        mri_assoc: [
          { name: 'JC > Retainage', desc: 'Release and invoice retainage' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. LOANS & DRAWS (LENDER MANAGEMENT) ────────────────────────────────── */
  {
    id: 'jc-loans',
    title: 'Loans & Draws (Lender Management)',
    processes: [
      {
        id: 'jc-loans-mgmt',
        title: 'Lenders & Loans',
        type: 'process',
        desc: 'Setting up lenders and the loans that fund a project, and requesting draws against those loans. This is the funding side of the project — matching spend to available finance.',
        activities: [
          'Set up lenders / lending institutions',
          'Set up and track loans against jobs',
          'Raise draw requests against loans',
        ],
        mri_title: 'Loans & Draws (JC > Loans)',
        mri_prereqs: [
          'Lenders configured as part of essential setup',
        ],
        mri_assoc: [
          { name: 'JC > Loans', desc: 'Lenders, loans and loan draws' },
        ],
        subs: [],
      },
      {
        id: 'jc-loans-reporting',
        title: 'Lender Reporting & Cash-Flow',
        type: 'process',
        desc: 'Producing lender-ready reports and percentage-of-completion summaries to accelerate funding, and forecasting future funding needs. Good lender reporting shortens the draw-to-cash cycle.',
        activities: [
          'Produce lender-ready reports and percentage-of-completion summaries',
          'Forecast future funding requirements (cash-flow forecasting)',
        ],
        mri_title: 'Reports (JC > Reports — lender/POC)',
        mri_prereqs: [
          'Loans and draws recorded against the job',
        ],
        mri_assoc: [
          { name: 'JC > Reports', desc: 'Lender reporting and percentage-of-completion summaries' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. WIP, REPORTING & RECONCILIATION ──────────────────────────────────── */
  {
    id: 'jc-reporting',
    title: 'WIP, Reporting & Reconciliation',
    processes: [
      {
        id: 'jc-wip',
        title: 'Work-in-Progress (WIP) Assets',
        type: 'process',
        desc: 'Accumulating project spend into Work-in-Progress assets and capitalising completed WIP into Fixed Asset Accounting. This is how project cost becomes a balance-sheet asset at handover.',
        activities: [
          'Build WIP assets by accumulating spend, assigning transactions to specific WIP items or splitting across items',
          'Capitalise completed WIP assets into Fixed Asset Accounting (FAA) on completion',
          'Maintain an auditable view of the transactions making up each WIP item',
        ],
        mri_title: 'WIP Assets (JC > Manage Jobs — WIP)',
        mri_prereqs: [
          'Fixed Asset Accounting (FAA) available to receive capitalised WIP',
        ],
        mri_assoc: [
          { name: 'JC > Reports', desc: 'WIP build and audit trail of contributing transactions' },
        ],
        subs: [
          {
            id: 'jc-wip-build',
            title: 'WIP Build',
            desc: 'Accumulating spend into WIP assets and assigning transactions.',
            activities: [
              'Assign transactions to WIP items or split across them',
              'Maintain the WIP audit trail',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Reports', desc: 'WIP asset build' },
            ],
          },
          {
            id: 'jc-wip-handover',
            title: 'WIP-to-FAA Handover',
            desc: 'Capitalising completed WIP assets into Fixed Asset Accounting.',
            activities: [
              'Capitalise completed WIP into FAA',
              'Confirm handover on project completion',
            ],
            mri_title: 'JC > Manage Jobs',
            mri_assoc: [
              { name: 'JC > Reports', desc: 'WIP capitalisation to FAA' },
            ],
          },
        ],
      },
      {
        id: 'jc-reporting-reports',
        title: 'Reporting & Reconciliation',
        type: 'process',
        desc: 'The project reporting and GL reconciliation that give leadership and lenders confidence in the numbers — budget-to-actual, percentage-of-completion, and month-end accruals that reduce close workload.',
        activities: [
          'Run budget-to-actual reports (project-to-date, calendar, consolidated, percentage-of-completion)',
          'Produce project performance reports and executive summaries/KPIs',
          'Reconcile JC to GL (MRI Financials) and automate month-end accruals',
        ],
        mri_title: 'Reports (JC > Reports)',
        mri_prereqs: [
          'Budgets, contracts and costs posted for the period',
        ],
        mri_assoc: [
          { name: 'JC > Reports', desc: 'Budget-to-actual, percentage-of-completion and project performance' },
        ],
        subs: [
          {
            id: 'jc-reporting-reports-b2a',
            title: 'Budget-to-Actual & POC',
            desc: 'Core project reporting on spend vs budget and completion.',
            activities: [
              'Run budget-to-actual and percentage-of-completion reports',
              'Produce executive summaries and KPIs',
            ],
            mri_title: 'JC > Reports',
            mri_assoc: [
              { name: 'JC > Reports', desc: 'Budget-to-actual and POC reporting' },
            ],
          },
          {
            id: 'jc-reporting-reports-recon',
            title: 'GL Reconciliation & Accruals',
            desc: 'Reconciling JC to the GL and automating month-end accruals.',
            activities: [
              'Reconcile JC detail to GL',
              'Automate month-end accruals to reduce close workload',
            ],
            mri_title: 'JC > Invoice / PO / Journal Processing',
            mri_assoc: [
              { name: 'JC > Reports', desc: 'GL reconciliation and accruals' },
            ],
          },
        ],
      },
    ],
  },

];
