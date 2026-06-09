export const jc = [
  // ─── COLUMN 1: JobCost Setup ────────────────────────────────────────────────
  {
    id: 'jc-setup',
    title: 'JobCost Setup & Configuration',
    processes: [
      {
        id: 'jc-setup-config',
        title: 'System & Master Data Configuration',
        type: 'process',
        desc: 'Establish the foundational configuration that governs how the organisation tracks, validates, and reports construction project costs. These settings control budget enforcement, contract approval workflows, draw processing, and how costs are categorised — decisions made here affect every job and contract in the system.',
        activities: [
          'Define budget validation rules: determine whether contracts are validated against original budget only, approved revisions, or all pending revisions',
          'Enable or disable consolidated draw processing to control whether draw invoices can be created directly within JobCost',
          'Configure the contract approval model — single-step approval (contract only) or two-step (contract then individual line items)',
          'Decide whether corrections to approved contracts are permitted after draws have been made against them',
          'Set up invoice line item attachment to allow pre-existing AP invoices to be applied to contracts retrospectively',
          'Activate or deactivate cumulative multi-contract validation to prevent over-commitment across multiple contracts on the same budget line',
          'Configure lookup codes to classify budget entries, cost code categories, contract change reasons, revision note types, and units of measure',
        ],
        mri_title: 'JobCost Options (MRI for Windows > MGNT-MRI > JobCost Options)',
        mri_prereqs: [
          'MRI JobCost licence active for the organisation',
          'General Ledger entities already configured — retainage accounts must be set on entity cash maps before jobs can be run',
          'Accounts Payable and Purchase Order modules configured and linked',
        ],
        mri_assoc: [
          { name: 'MRI for Windows > MGNT-MRI > JobCost Options', desc: 'Central management options form — controls budget validation level, draw processing, approval model, and all global JobCost behaviours' },
          { name: 'MRI for Windows > CODELIST-MRI > JC_BUDGCAT', desc: 'Lookup codes for budget entry types: approved revisions, estimates, original entries, pending costs, and pending revisions' },
          { name: 'MRI for Windows > CODELIST-MRI > JC_CATEGORY', desc: 'Cost code categories for grouping and reporting — e.g. hard costs, soft costs, land purchase, tenant improvements, equity' },
          { name: 'MRI for Windows > CODELIST-MRI > JC_CNTRCAT', desc: 'Reasons for contract change orders and revisions — e.g. errors, omissions, scope changes' },
          { name: 'MRI for Windows > CODELIST-MRI > JC_REV_TYPE', desc: 'Revision note types added to pending revisions and costs when line-item approval is enabled' },
          { name: 'MRI for Windows > CODELIST-MRI > JC_UNITS', desc: 'Units of measure used across JobCost — metres, square feet, tons, yards, and custom units' },
        ],
        subs: [
          {
            id: 'jc-setup-config-phasetypes',
            title: 'Phase Type Setup',
            desc: 'Define the standard phase types that describe the stages a construction project passes through. Phase types are reference classifications applied to individual phases within each job — they support consistent reporting and filtering across all projects in the portfolio.',
            activities: [
              'Review MRI default phase types (BLD — Building, CON — Construction, MALL — Mall) and determine whether they cover the organisation\'s project types',
              'Add custom phase types to represent project stages specific to the business — e.g. Preconstruction, Finishing, Commissioning, Tenant Fitout',
              'Assign meaningful codes and descriptions so project managers can identify the correct type when setting up job phases',
              'Retire or remove phase types that are not in use and would cause confusion during job setup',
            ],
            mri_title: 'Phase Types (JC > Setup > Setup and Maintenance > JobCost > Phase Types)',
            mri_prereqs: [
              'JobCost management options configured before phase types are finalised, as job type decisions influence which phases are needed',
            ],
            mri_assoc: [
              { name: 'JC > Setup > Setup and Maintenance > JobCost > Phase Types', desc: 'Grid-based setup screen for creating and maintaining phase type codes and descriptions' },
            ],
          },
          {
            id: 'jc-setup-config-budgettypes',
            title: 'Budget Type Setup',
            desc: 'Define the budget types that allow the organisation to maintain parallel budgets for the same job from different perspectives — such as a project proforma, a lender draw budget, and an internal tracking budget. Each type can be populated independently, enabling multi-stakeholder reporting from a single job record.',
            activities: [
              'Identify the distinct budget views the business requires — e.g. proforma (equity return basis), bank loan budget (lender-agreed costs), internal cost tracking budget',
              'Create budget type codes and descriptions that clearly communicate their purpose to finance and project teams',
              'Agree naming conventions so budget types are consistent across all jobs in the portfolio',
              'Confirm that changes to existing budget type descriptions will cascade to all jobs using that type',
            ],
            mri_title: 'Budget Types (JC > Setup > Setup and Maintenance > JobCost > Budget Types)',
            mri_prereqs: [
              'Understanding of reporting requirements from lenders, equity partners, and internal stakeholders before budget types are finalised',
            ],
            mri_assoc: [
              { name: 'JC > Setup > Setup and Maintenance > JobCost > Budget Types', desc: 'Grid for creating and managing budget type codes — any change cascades to all existing budgets using that type' },
            ],
          },
          {
            id: 'jc-setup-config-costlists',
            title: 'Cost Lists & Cost Code Setup',
            desc: 'Build the cost coding structure used to categorise all expenditure on construction jobs — analogous to a chart of accounts in General Ledger. Cost lists group related cost codes and are assigned at the job or phase level. Well-designed cost lists enable consistent cost tracking, budget comparison, and reporting across all projects.',
            activities: [
              'Determine the cost list strategy: one list for all jobs, separate lists by project type (residential, commercial, industrial), or job-specific lists (not recommended)',
              'Create cost codes representing each cost category to track — e.g. land acquisition, site preparation, foundations, structural steel, mechanical, electrical, professional fees, contingency',
              'Assign each cost code a type (hard cost, soft cost, etc.), category for grouping, and map it to the corresponding GL account via the ledger code and default account fields',
              'Configure major/minor cost code splits where more granular sub-categorisation is needed within a cost group',
              'Copy an existing master cost list when creating a new job to maintain consistency and remove unnecessary codes for that specific project',
              'Add unit of measure to cost codes where quantity-based budgeting is required (e.g. square feet, cubic metres)',
            ],
            mri_title: 'Cost Lists / Cost Codes (JC > Setup > Setup and Maintenance > JobCost > Cost Lists/Cost Codes)',
            mri_prereqs: [
              'General Ledger chart of accounts finalised — cost codes must map to valid GL accounts',
              'JC_CATEGORY lookup codes configured so cost code categories are available for assignment',
              'JC_UNITS lookup codes configured so units of measure are available',
            ],
            mri_assoc: [
              { name: 'JC > Setup > Setup and Maintenance > JobCost > Cost Lists/Cost Codes', desc: 'Main setup screen for creating cost lists, adding cost codes, assigning categories, and mapping to GL accounts' },
              { name: 'JC > Manage Jobs > More Actions > Add/Edit Cost Lists', desc: 'Accessible from within a job — allows cost list creation or modification without leaving job setup' },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLUMN 2: Job Management ───────────────────────────────────────────────
  {
    id: 'jc-jobs',
    title: 'Job Management',
    processes: [
      {
        id: 'jc-jobs-manage',
        title: 'Job Setup & Maintenance',
        type: 'process',
        desc: 'Create and maintain the core job record that acts as the container for all costs, contracts, budgets, and reporting related to a construction or improvement project. Each job is linked to a physical location — a building, suite, or residential property — and is structured into phases that reflect the stages of work. Jobs can represent capital improvements, general maintenance, or tenant-specific works.',
        activities: [
          'Agree with the project team on a job coding convention that supports reporting and cross-job comparison',
          'Classify each job by type: Capital (increases property value), General (improves usefulness without capital value uplift), or Tenant (improves a tenant-occupied space)',
          'Assign a primary cost list to establish the coding structure for all expenditure on the job',
          'Link the job to a commercial building, suite, or lease (CM) or a residential property and unit (RM) to enable location-based reporting',
          'Record the job manager, estimated start and completion dates, percentage complete, and escalation years where applicable',
          'Deactivate completed or on-hold jobs to keep active job lists clean without losing historical data',
          'Delete jobs that were set up in error, provided no transactions have been posted against them',
        ],
        mri_title: 'Manage Jobs (JC > Application Menu > JobCost > Manage Jobs)',
        mri_prereqs: [
          'Cost lists and cost codes set up and ready for assignment',
          'Phase types defined before phases are added to the job',
          'GL entities, departments, and accounts configured — required for interface chart mapping',
          'Commercial Management buildings/suites or Residential Management properties/units set up if location links are needed',
        ],
        mri_assoc: [
          { name: 'JC > Application Menu > JobCost > Manage Jobs > Add Job', desc: 'Creates a new job record with job code, type, primary cost list, and active status' },
          { name: 'JC > Application Menu > JobCost > Manage Jobs > Job Search', desc: 'Searches active and inactive jobs — up to 300 results returned; refine search if job not found in first page' },
        ],
        subs: [
          {
            id: 'jc-jobs-manage-general',
            title: 'General Job Information',
            desc: 'Capture the operational details of a job that define its timeline, management accountability, and physical scope. This information supports project reporting, escalation calculations, and the link between the financial job record and the physical property or tenancy it relates to.',
            activities: [
              'Enter the job start date and estimated completion date — update to actual completion date when the project finishes',
              'Record the job manager responsible for overseeing the project and approving expenditure',
              'Enter the current percentage complete to support progress reporting and draw calculations',
              'Flag jobs as Revenue Enhancing if the work directly generates income for the organisation (e.g. a new food court)',
              'Flag jobs as Capital Recurring if the work is a regular maintenance activity that recurs but does not add capital value (e.g. annual car park resurfacing)',
              'Link to the commercial building, suite, and lease if the job is on a commercial asset, or to the property and unit for residential jobs',
              'Enter the escalation years — the number of years costs can be recharged to applicable tenants',
            ],
            mri_title: 'General Job Information (JC > Manage Jobs > Job Search > [Job] > General)',
            mri_prereqs: [
              'Job record created with job code, type, and primary cost list assigned',
              'Commercial or Residential management modules configured if location links are required',
            ],
            mri_assoc: [
              { name: 'JC > Manage Jobs > [Job] > General', desc: 'General tab within the job — dates, manager, percent complete, commercial/residential location fields, and revenue/capital flags' },
            ],
          },
          {
            id: 'jc-jobs-manage-phases',
            title: 'Phase Configuration',
            desc: 'Divide a job into phases that represent distinct stages of the construction programme. Phases allow costs and budgets to be tracked separately by stage — enabling project managers and finance teams to assess progress and expenditure at a granular level and identify issues within a specific part of the project.',
            activities: [
              'Define the phases that reflect the logical stages of the project — e.g. Preconstruction, Foundation, Structure, Fit Out, Finishing',
              'Assign each phase a unique code, description, and phase type that aligns with the organisation\'s standard classifications',
              'Set a default cost list for each phase, which will pre-populate when entering contracts and budgets for that phase',
              'Record phase start and end dates, and the date the phase becomes active — which may differ from the start date if ordering or procurement begins beforehand',
              'Enter the square footage affected by each phase for area-based cost analysis',
              'Update phase end dates to actual completion dates when phases conclude',
            ],
            mri_title: 'Phases (JC > Manage Jobs > [Job] > Phases)',
            mri_prereqs: [
              'Phase types defined in setup before phases can be assigned a type',
              'Cost lists created and available for assignment as phase-level defaults',
            ],
            mri_assoc: [
              { name: 'JC > Manage Jobs > [Job] > Phases', desc: 'Grid for creating and managing job phases — code, type, cost list, dates, and square footage per phase' },
            ],
          },
          {
            id: 'jc-jobs-manage-interfacechart',
            title: 'Interface Chart Setup',
            desc: 'Create the mapping that connects every combination of job, phase, cost list, and cost code to its corresponding General Ledger posting destination — entity, cash type, department, and account. Without a complete interface chart, contracts, budgets, journal entries, purchase orders, and invoices cannot post correctly to the GL.',
            activities: [
              'Map each combination of phase, cost list, and cost code to the GL entity, cash type, department, and account that should receive the posted costs',
              'Use a master job template with a comprehensive interface chart as a starting point, then copy it to new jobs and remove inapplicable mappings',
              'Validate that all cost combinations anticipated in contracts and budgets have a corresponding GL mapping before any financial transactions are entered',
              'Restrict modifications to existing mappings — a mapping can only be changed if no journal entries, contracts, or budgets have used it',
              'Review the interface chart whenever new cost codes or phases are added to the job to ensure GL posting will work correctly',
            ],
            mri_title: 'Interface Chart (JC > Manage Jobs > [Job] > Interface Chart)',
            mri_prereqs: [
              'GL entities, departments, cash types, and accounts configured and available for selection',
              'Job phases and cost lists fully set up before the interface chart is completed',
              'Cost codes mapped to GL accounts in cost list setup — interface chart refines the posting destination at entity and department level',
            ],
            mri_assoc: [
              { name: 'JC > Manage Jobs > [Job] > Interface Chart', desc: 'Line-by-line mapping of phase/cost list/cost code combinations to GL entity, cash type, department, and account' },
              { name: 'JC > Manage Jobs > [Job] > More Actions > Copy Interface Chart', desc: 'Copies the interface chart from another job or phase — use a master job as a starting template' },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLUMN 3: Budget Management ────────────────────────────────────────────
  {
    id: 'jc-budgets',
    title: 'Budget Management',
    processes: [
      {
        id: 'jc-budgets-control',
        title: 'Job Budget Control',
        type: 'process',
        desc: 'Establish and maintain the financial plan for each construction project — setting original cost budgets, managing approved and pending revisions, and tracking uncommitted expenditure to keep spending within sanctioned limits. The budget is the financial control framework that governs contract validation and cost reporting for the life of the project.',
        activities: [
          'Create original budgets by entering amounts against each phase, cost list, cost code, and budget type combination that has been approved for the project',
          'Update budgets with approved revisions when the project scope changes, additional works are sanctioned, or savings are identified and realised',
          'Raise pending cost entries to flag anticipated overspends or unbudgeted costs before they are formally approved',
          'Raise pending revisions where scope change is known but not yet sanctioned, enabling forecast-to-complete visibility without breaching approval controls',
          'Use the budget validation settings to enforce that contracts cannot be raised above the approved budget without deliberate override',
          'Monitor the budget vs actual position across all phases and cost codes as contracts are committed and invoices are processed',
          'Run budget reports at regular intervals to report to lenders, equity partners, or the investment committee on the cost-to-complete position',
        ],
        mri_title: 'Budgets (JC > Manage Jobs > [Job] > Budgets)',
        mri_prereqs: [
          'Job, phases, and interface chart fully set up before budget entry — all cost combinations must exist in the interface chart',
          'Budget types defined in setup so the correct budget type can be selected for each budget entry',
          'JC_BUDGCAT lookup codes configured so budget entry categories (original, revision, pending cost) are available',
          'Management options set to determine whether revisions are approved individually by line item or as a combined amount',
        ],
        mri_assoc: [
          { name: 'JC > Manage Jobs > [Job] > Budgets', desc: 'Budget entry grid — enter amounts by budget type, phase, cost list, and cost code; supports original, revision, pending cost, and pending revision entries' },
        ],
        subs: [
          {
            id: 'jc-budgets-control-original',
            title: 'Original Budget Entry',
            desc: 'Record the initially sanctioned cost plan for the project, broken down by phase, cost category, and budget type. The original budget is the baseline against which all future cost movement — revisions, pending costs, and actual expenditure — is compared. It is typically derived from a quantity surveyor\'s estimate or project appraisal.',
            activities: [
              'Translate the approved project cost plan into JobCost budget entries — one line per phase, cost list, and cost code combination',
              'Enter the original budget against the appropriate budget type (e.g. proforma, bank loan budget) so each stakeholder\'s view is captured independently',
              'Include all cost categories in the original budget: land, construction, professional fees, finance costs, contingency, and tenant improvement allowances',
              'Confirm that every cost code used in the original budget has a corresponding interface chart entry — the system will reject entries without a valid GL mapping',
              'Distribute contingency amounts across cost codes or hold as a single contingency line depending on project controls policy',
            ],
            mri_title: 'Budgets > Original Budget (JC > Manage Jobs > [Job] > Budgets)',
            mri_prereqs: [
              'Approved project cost plan or quantity surveyor estimate available',
              'Interface chart mapping in place for all cost combinations to be budgeted',
            ],
            mri_assoc: [
              { name: 'JC > Manage Jobs > [Job] > Budgets', desc: 'Enter original budget amounts by phase, cost list, and cost code — select the original budget category from the JC_BUDGCAT options' },
            ],
          },
          {
            id: 'jc-budgets-control-revisions',
            title: 'Budget Revisions & Pending Costs',
            desc: 'Manage changes to the approved budget through a controlled revision process — distinguishing between formally sanctioned increases (approved revisions), anticipated but unapproved changes (pending revisions), and unbudgeted costs that have already been incurred (pending costs). This three-tier structure preserves the integrity of the approved budget while providing a complete forecast view.',
            activities: [
              'Raise an approved revision when the investment committee or lender formally sanctions a change to the project budget — e.g. additional scope, value engineering, or allowance for changed conditions',
              'Enter a pending revision to record anticipated scope changes or overruns that have not yet received formal approval — keeps the forecast-to-complete accurate without inflating the approved budget',
              'Enter a pending cost when an unbudgeted cost has been incurred but approval is being sought retrospectively — this flags the position without classifying it as approved spend',
              'If line-item approval is enabled, approve each pending revision or pending cost individually with a reference number — maintaining an audit trail of changes',
              'Review pending items regularly with the project manager and progress them to approved revisions or reject them as costs are resolved',
              'Confirm that the budget validation level in management options is set appropriately — original only, approved plus revisions, or all including pending — to determine what amount contracts are validated against',
            ],
            mri_title: 'Budgets > Revisions (JC > Manage Jobs > [Job] > Budgets)',
            mri_prereqs: [
              'Original budget entered before revisions can be raised against it',
              'JC_REV_TYPE and JC_BUDGCAT lookup codes configured for revision type and category classification',
              'Approve Pending Revisions and Costs by Line Item management option set before revisions are entered — determines whether individual reference numbers are required',
            ],
            mri_assoc: [
              { name: 'JC > Manage Jobs > [Job] > Budgets', desc: 'Budget grid — enter approved revisions, pending revisions, and pending costs against the same phase/cost list/cost code as the original budget' },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLUMN 4: Contract Management ──────────────────────────────────────────
  {
    id: 'jc-contracts',
    title: 'Contract Management',
    processes: [
      {
        id: 'jc-contracts-lifecycle',
        title: 'Contract Lifecycle',
        type: 'process',
        desc: 'Manage the full commercial relationship with construction contractors from contract award through to closure — covering contract setup, original and revised order activity, the formal approval process, and eventual closure when work is complete and all financial obligations are settled. Contracts are the primary commitment vehicle in JobCost, linking vendor obligations to the project budget and triggering the draw and payment process.',
        activities: [
          'Raise a contract record for each vendor engaged on the project, specifying the job, phase, and cost codes the contract covers',
          'Enter the original contract order amount, broken down by cost code, to commit the expenditure against the budget',
          'Process change orders and revisions when the scope of the contracted works changes — documenting the reason and updating the committed value',
          'Route contracts through the approval workflow — single-step for the whole contract, or two-step where individual line items are approved separately',
          'Monitor the contract summary to track the relationship between the original contract value, approved revisions, draws made to date, and the remaining balance',
          'Make corrections to approved contracts where necessary, provided the Allow Contract Corrections management option is enabled',
          'Close contracts once all work is certified complete and all draws and retainage have been invoiced — preventing further transactions against a finished contract',
          'Delete contracts that were set up in error and have no transactions posted against them',
        ],
        mri_title: 'Manage Contracts (JC > Application Menu > JobCost > Manage Contracts)',
        mri_prereqs: [
          'Job, phases, and interface chart fully configured — all cost code combinations to be used in the contract must exist in the interface chart',
          'Original budget entered so the system can validate contract amounts against the budget (if budget validation is enabled)',
          'Vendor/contractor set up in Accounts Payable with bank details, payment terms, and insurance documentation on file',
          'Management options configured for approval model and retainage settings',
        ],
        mri_assoc: [
          { name: 'JC > Application Menu > JobCost > Manage Contracts', desc: 'Contract search, creation, and management hub — list view of all contracts by job, status, and vendor' },
        ],
        subs: [
          {
            id: 'jc-contracts-lifecycle-setup',
            title: 'Contract Setup',
            desc: 'Create the contract record that formally commits the organisation to a vendor for defined works on a specific job and phase. Contract setup establishes the key commercial terms — the parties, scope, retainage percentage, and the cost codes against which expenditure will be tracked — before any financial activity is recorded.',
            activities: [
              'Create a new contract record, selecting the vendor (contractor), job, and applicable phases the contract covers',
              'Define the retainage percentage to be held back from each payment as security against satisfactory completion of the works',
              'Select the contract category that best describes the type of work — e.g. construction, professional services, specialist subcontract',
              'Confirm that all cost codes the contractor will claim against are covered by the interface chart before raising any order activity',
              'Note the contract reference, description, and any relevant external contract number for cross-referencing with the legal document',
            ],
            mri_title: 'Setting Up Contracts (JC > Manage Contracts > Add Contract)',
            mri_prereqs: [
              'Vendor configured in AP with correct payment details',
              'Job and phases fully set up with a complete interface chart',
              'JC_CNTRCAT lookup codes in place for contract category classification',
            ],
            mri_assoc: [
              { name: 'JC > Manage Contracts > Add Contract', desc: 'Contract creation screen — vendor, job, phase, retainage %, category, and description' },
              { name: 'JC > Manage Contracts > [Contract] > General', desc: 'Contract header — key commercial terms and status of the contract record' },
            ],
          },
          {
            id: 'jc-contracts-lifecycle-orders',
            title: 'Contract Order Activity',
            desc: 'Record the financial commitment of the contract by entering the original contract order amount against the relevant cost codes. Order activity is the line-item detail of what is being committed — it drives budget validation, establishes the basis for draw claims, and creates the cost commitment visible in budget vs actual reporting.',
            activities: [
              'Enter the original contract order activity — the agreed contract value broken down across the cost codes that will be claimed against',
              'Allocate amounts per cost code in line with the contractor\'s pricing schedule or schedule of values',
              'Validate that the sum of contract order amounts does not exceed the budget for each cost code combination (if budget validation is active)',
              'Enter contract change orders when the contractor\'s scope changes — referencing the reason category (error, omission, scope change) and supporting notes',
              'Enter contract revisions for financial-only adjustments that do not change the physical scope of works',
              'View the full order detail summary to confirm the committed position across all order lines before approving the contract',
            ],
            mri_title: 'Contract Order Activity (JC > Manage Contracts > [Contract] > Order Activity)',
            mri_prereqs: [
              'Contract header set up before order activity can be entered',
              'Budget validation level set in management options to determine what amount order entries are validated against',
            ],
            mri_assoc: [
              { name: 'JC > Manage Contracts > [Contract] > Entering Original Contract Order Activity', desc: 'Entry form for the initial contract commitment — amount per cost code against the job and phase' },
              { name: 'JC > Manage Contracts > [Contract] > Entering Contract Change Orders or Revisions', desc: 'Change order and revision entry — reason category, amount, and supporting notes' },
              { name: 'JC > Manage Contracts > [Contract] > Viewing All Contract Order Details', desc: 'Summary view of all order lines, change orders, and revisions — the total committed position for the contract' },
            ],
          },
          {
            id: 'jc-contracts-lifecycle-approval',
            title: 'Contract Approval',
            desc: 'Formally approve the contract and its order activity through the configured approval workflow, converting the contract from a draft to an approved financial commitment. Depending on the management options configured, approval may be granted for the entire contract in one step, or individually for each line item — the latter being appropriate where segregation of duties is required.',
            activities: [
              'Review the contract header and all order activity before initiating approval — confirm amounts, cost codes, and retainage percentage are correct',
              'Apply contract-level approval to commit the full contract value if Contract Only Approval is enabled',
              'Approve individual line items separately if the two-step process is configured — allowing a different person to approve each detail line',
              'Remove approval from a contract where errors are identified post-approval but before draws have been made — correct and re-approve',
              'Make corrections to approved contracts after draws have been made if the Allow Contract Corrections management option is enabled — document the reason for each correction',
            ],
            mri_title: 'Approving Contracts (JC > Manage Contracts > [Contract] > Approve)',
            mri_prereqs: [
              'Contract setup and order activity fully entered and reviewed',
              'Approval workflow model set in management options before any approvals are processed',
            ],
            mri_assoc: [
              { name: 'JC > Manage Contracts > [Contract] > Approving Contracts', desc: 'Approval action — commits the contract and makes it available for draw processing' },
              { name: 'JC > Manage Contracts > [Contract] > Removing Approval from Contracts', desc: 'Removes approval status so corrections can be made — only available if no draws have been made' },
              { name: 'JC > Manage Contracts > [Contract] > Making Corrections to Approved Contracts', desc: 'Allows post-approval corrections where the Allow Contract Corrections option is enabled' },
              { name: 'JC > Manage Contracts > [Contract] > Reviewing Contract Summaries', desc: 'Summary view showing original contract value, revisions, draws to date, retainage held, and balance remaining' },
            ],
          },
          {
            id: 'jc-contracts-lifecycle-closure',
            title: 'Contract Closure',
            desc: 'Formally close a contract once all works are certified as complete and all financial obligations — including retainage — have been settled. Closing a contract prevents any further activity being posted against it and signals to the project team and finance function that the vendor relationship for that scope of work is concluded.',
            activities: [
              'Confirm with the project manager and quantity surveyor that all works covered by the contract are complete to the required standard',
              'Verify that all draw invoices have been created and posted to AP, and that the contractor has been paid to the agreed final account value',
              'Confirm that retainage has been fully released and invoiced before initiating closure — no retainage should remain outstanding on a contract being closed',
              'Review the contract summary to confirm that the drawn amount equals the final agreed contract value before closing',
              'Close the contract to prevent any further order activity, draws, or invoice applications being processed against it',
            ],
            mri_title: 'Closing Contracts (JC > Manage Contracts > [Contract] > Close Contract)',
            mri_prereqs: [
              'All retainage released and invoiced before the contract can be closed',
              'Final account agreed with the contractor and reflected in the approved contract order activity',
            ],
            mri_assoc: [
              { name: 'JC > Manage Contracts > [Contract] > Closing Contracts', desc: 'Closes the contract record — no further transactions can be posted once the contract is closed' },
              { name: 'JC > Manage Contracts > [Contract] > Deleting Contracts', desc: 'Permanently removes a contract that has no transactions — used to remove contracts set up in error' },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLUMN 5: Contractor Payments ──────────────────────────────────────────
  {
    id: 'jc-payments',
    title: 'Contractor Payments',
    processes: [
      {
        id: 'jc-payments-draws',
        title: 'Draws, Retainage & Invoice Processing',
        type: 'process',
        desc: 'Control the flow of payments to contractors through a structured draw process — raising draw claims against approved contracts, converting them to AP invoices, and managing the release of retainage held back during the works. The draws process links JobCost directly to Accounts Payable, ensuring all contractor payments are tied to certified work and approved contract commitments.',
        activities: [
          'Create draw claims against approved contracts when a contractor certifies completion of a defined stage of work',
          'Group multiple contract draws into a single invoicing batch using the consolidated draws process where appropriate',
          'Convert approved draw claims into AP invoices that route through the standard AP payment workflow',
          'Withhold retainage from each draw payment at the percentage defined on the contract, accumulating the held amount until practical completion',
          'Release retainage in full or in stages on satisfactory completion of the works, converting the released amount to an AP invoice for payment',
          'Apply pre-existing AP invoices to contracts where invoices were entered in Accounts Payable before the contract was set up in JobCost — linking them retrospectively to record draws against the contract',
          'Monitor draw activity against each contract to track the remaining available balance and retainage position',
        ],
        mri_title: 'Paying Contractors (JC > Application Menu > JobCost > Paying Contractors)',
        mri_prereqs: [
          'Contracts fully approved — only approved contracts are available for draw processing',
          'Consolidated Draws Processing management option enabled if draw invoices are to be created in JobCost for the Web',
          'Retainage accounts configured on the GL entity cash maps before draws are processed',
          'AP payment terms and bank details confirmed for each contractor vendor',
        ],
        mri_assoc: [
          { name: 'JC > Application Menu > JobCost > Paying Contractors', desc: 'Entry point for the consolidated draws process, retainage release, and invoice application functions' },
        ],
        subs: [
          {
            id: 'jc-payments-draws-consolidated',
            title: 'Creating & Invoicing Contract Draws',
            desc: 'Raise payment claims against approved contracts using the consolidated draws process — selecting the contracts to draw against, entering certified amounts by cost code, and generating AP invoices that will be processed through the standard AP payment run. Draws represent certified progress payments to contractors and are the primary mechanism by which contract costs flow through to the GL.',
            activities: [
              'Select the approved contract(s) to draw against — one or multiple contracts can be included in a single draw batch',
              'Enter the certified amount to be drawn for each cost code line, reflecting the work completed to the satisfaction of the quantity surveyor or project manager',
              'Confirm the retainage amount to be withheld from the draw in line with the contract retainage percentage',
              'Review the draw summary — net payment amount, retainage held, and GL posting destination — before converting to an invoice',
              'Generate the AP invoice for the net draw amount, which will appear in the AP invoice queue for approval and payment',
              'Confirm the GL postings: the gross draw to the WIP or cost account, and the retainage to the retainage holding account on the entity cash map',
            ],
            mri_title: 'Consolidated Draws (JC > Paying Contractors > Create and Invoice Contract Draws)',
            mri_prereqs: [
              'Consolidated Draws Processing management option enabled',
              'Contract approved and order activity entered — only approved contracts can have draws raised against them',
              'Retainage account configured on entity cash map',
            ],
            mri_assoc: [
              { name: 'JC > Paying Contractors > Creating and Invoicing Contract Draws Using the Consolidated Draws Process', desc: 'Consolidated draw creation and invoicing screen — select contracts, enter certified amounts, confirm retainage, and generate AP invoice' },
            ],
          },
          {
            id: 'jc-payments-draws-retainage',
            title: 'Retainage Release & Invoicing',
            desc: 'Release the retainage withheld during the contract period once the contractor has completed their obligations to the required standard. Retainage release is a separate AP invoice event from the regular draw process — it converts the accumulated retainage balance into a payable liability and routes it through the AP payment run for settlement.',
            activities: [
              'Confirm with the project manager that the works covered by the contract are complete and defects liability obligations have been met',
              'Review the accumulated retainage balance held against the contract — confirm the amount to be released (full release or staged release)',
              'Create a retainage release record against the contract for the agreed release amount',
              'Invoice the released retainage to generate an AP invoice for the retainage payment — this posts the retainage from the holding account to the cost account',
              'Route the retainage AP invoice through the standard AP approval and payment workflow',
              'Confirm that all retainage has been fully invoiced and paid before proceeding to close the contract',
            ],
            mri_title: 'Retainage Release (JC > Paying Contractors > Releasing and Invoicing Retainage)',
            mri_prereqs: [
              'All draw invoices processed and paid before retainage release is initiated',
              'Project manager sign-off on practical completion obtained',
              'Defects liability period expired or contractor defects obligations discharged',
            ],
            mri_assoc: [
              { name: 'JC > Paying Contractors > Releasing and Invoicing Retainage', desc: 'Retainage release and invoicing screen — select contract, enter release amount, and generate AP invoice for retainage payment' },
            ],
          },
          {
            id: 'jc-payments-draws-invoiceapplication',
            title: 'Applying Invoices to Contracts',
            desc: 'Link existing AP invoices to contracts where invoices were entered in Accounts Payable before the corresponding contract was set up in JobCost — or where invoices were entered outside the draws process for other operational reasons. Invoice application allows these costs to be recorded as draws against the contract and tracked in the budget vs actual position.',
            activities: [
              'Identify AP invoices that relate to a JobCost contract but were entered in AP without being created through the draws process',
              'Apply each invoice to the relevant contract and cost code line — converting it to a draw against the contract value',
              'Confirm that the Allow Invoice Line Item Attachment management option is enabled before attempting to apply invoices',
              'Review the contract summary after application to confirm the drawn amount and remaining balance are correctly reflected',
              'Avoid double-counting — ensure invoices applied to contracts are not also included in a separate consolidated draw for the same amount',
            ],
            mri_title: 'Applying Invoices (JC > Paying Contractors > Applying Invoices to Contracts)',
            mri_prereqs: [
              'Allow Invoice Line Item Attachment management option enabled',
              'Contract approved and the cost code combination present in the interface chart',
              'AP invoices already entered and posted in Accounts Payable',
            ],
            mri_assoc: [
              { name: 'JC > Paying Contractors > Applying Invoices to Contracts', desc: 'Invoice application screen — select the AP invoice and apply it to the relevant contract and cost code as a retrospective draw' },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLUMN 6: Reporting ────────────────────────────────────────────────────
  {
    id: 'jc-reporting',
    title: 'Reporting',
    processes: [
      {
        id: 'jc-reporting-reports',
        title: 'JobCost Reporting',
        type: 'process',
        desc: 'Generate the standard JobCost reports that provide visibility of project cost performance — from high-level budget vs actual summaries for the investment committee to detailed cost code and expenditure breakdowns for project managers. Reports draw on live job, budget, contract, and invoice data and are typically run monthly at period close and on an ad-hoc basis for project reviews.',
        activities: [
          'Run the Budget vs Actual report regularly to monitor how actual expenditure and committed contracts compare against the approved budget by cost code and phase',
          'Generate the Contract Summary report at each project review meeting to assess the committed position, draw activity, and retainage outstanding for each contractor',
          'Use the Monthly Expenditures report to identify the cost run rate and compare month-on-month project spend patterns',
          'Run the Active Construction Jobs report to get an overview of all live projects — their status, percentage complete, and overall cost position',
          'Produce the Budget History report to track the evolution of the project budget from original through all approved revisions',
          'Use the Job Cost to GL Reference report to reconcile JobCost transactions back to the General Ledger posting entries',
          'Run the Cost Code Detail by Period report for detailed analysis of expenditure by cost code within a specific reporting period',
        ],
        mri_title: 'JobCost Reports (JC > Reports)',
        mri_prereqs: [
          'Jobs, budgets, and contracts must be fully set up and transactions posted before reports will contain meaningful data',
          'Period close complete in GL before running GL reconciliation reports',
        ],
        mri_assoc: [
          { name: 'JC > Reports > Job Cost Active Construction Jobs Report', desc: 'Lists all active jobs with status, percent complete, original budget, and total expenditure — used for portfolio-level project oversight' },
          { name: 'JC > Reports > Job Cost Budget Report', desc: 'Shows the approved budget by job, phase, cost list, and cost code — baseline reference for the approved project cost plan' },
          { name: 'JC > Reports > Job Cost Budget History Report', desc: 'Tracks the evolution of each budget from original through all approved revisions — audit trail of budget changes over the project life' },
          { name: 'JC > Reports > Job Cost Budget vs Actual (All Expenses) Report', desc: 'Core project performance report — compares budget to committed contracts and actual expenditure by cost code, showing over/under position' },
          { name: 'JC > Reports > Job Cost Contract Summary Report', desc: 'Summarises each contract: original value, approved revisions, draws to date, retainage held, and balance remaining' },
          { name: 'JC > Reports > Job Cost Draws and Retainage Detail Report', desc: 'Lists all draw activity and retainage movements by contract — used to verify draw history and retainage release calculations' },
          { name: 'JC > Reports > Job Cost Monthly Expenditures Report', desc: 'Breaks down actual expenditure by month — supports cost run rate analysis and period-on-period trend reporting' },
          { name: 'JC > Reports > Job Cost to GL Reference Report', desc: 'Reconciliation report linking JobCost transactions to their GL journal entry references — used at period close to confirm GL accuracy' },
          { name: 'JC > Reports > Job Cost: Cost Code Detail by Period Report', desc: 'Detailed expenditure by cost code within a specified period — supports granular cost analysis and cost category reviews' },
          { name: 'JC > Reports > Project Contract and PO Summary Report', desc: 'Combined view of contracts and purchase orders across the project — useful where both JobCost contracts and PO-based commitments are in use' },
        ],
        subs: [
          {
            id: 'jc-reporting-reports-budget',
            title: 'Budget & Cost Performance Reports',
            desc: 'Monitor the cost performance of each construction project against the approved budget — identifying variances early so the project team can take corrective action before expenditure breaches sanctioned limits. These reports are the primary output for investment committee reviews, lender reporting, and internal project governance.',
            activities: [
              'Run the Budget vs Actual report at each month end to compare approved budget, committed contracts, and actual costs for all active jobs',
              'Review the Budget History report when presenting cost changes to the investment committee or lender — shows a clear audit trail of every approved revision',
              'Use the Budget Report as the single reference for the current approved project cost plan after all revisions have been processed',
              'Analyse variances by cost code to identify which categories are tracking over or under budget and determine whether remedial action is required',
              'Include the budget vs actual position in lender drawdown reports where the loan budget is a separate budget type in JobCost',
            ],
            mri_title: 'Budget Reports (JC > Reports > Job Cost Budget Reports)',
            mri_prereqs: [
              'Original budgets and all approved revisions entered before running budget comparison reports',
              'Actual costs posted in AP/GL and interface charts complete so actuals flow through to the job cost reports',
            ],
            mri_assoc: [
              { name: 'JC > Reports > Job Cost Budget Report', desc: 'Current approved budget by cost code — run after each revision cycle to confirm the updated cost plan' },
              { name: 'JC > Reports > Job Cost Budget History Report', desc: 'Full revision history showing budget movement from original through all approved changes' },
              { name: 'JC > Reports > Job Cost Budget vs Actual (All Expenses) Report', desc: 'Primary cost performance report — budget, committed, actual, and variance by phase and cost code' },
            ],
          },
          {
            id: 'jc-reporting-reports-contract',
            title: 'Contract & Payment Reports',
            desc: 'Track the commercial position of all contracts on a project — what has been committed, drawn, paid, and retained. Contract reports are essential for cash flow forecasting, lender certification, and managing the relationship between contracted commitments and the project budget.',
            activities: [
              'Run the Contract Summary report at each project review to confirm the position of each contractor — original value, change orders, draws, retainage, and balance',
              'Use the Draws and Retainage Detail report to verify draw history before releasing retainage and closing a contract',
              'Include the Project Contract and PO Summary report in lender drawdown packages where both contracts and purchase orders are used to track commitments',
              'Identify contracts with outstanding retainage balances and schedule release in line with practical completion certificates',
              'Reconcile drawn amounts on the Contract Summary against the AP invoice register to confirm all draw invoices have been processed and paid',
            ],
            mri_title: 'Contract Reports (JC > Reports > Contract Reports)',
            mri_prereqs: [
              'Contracts set up, approved, and draw activity posted before contract reports contain meaningful data',
            ],
            mri_assoc: [
              { name: 'JC > Reports > Job Cost Contract Summary Report', desc: 'Per-contract summary — original value, revisions, draws, retainage, and remaining balance' },
              { name: 'JC > Reports > Job Cost Draws and Retainage Detail Report', desc: 'Line-by-line draw and retainage history per contract — used to verify the payment trail and retainage position' },
              { name: 'JC > Reports > Project Contract and PO Summary Report', desc: 'Combined contract and PO commitment view by project — supports comprehensive committed cost reporting' },
            ],
          },
          {
            id: 'jc-reporting-reports-gl',
            title: 'GL Integration & Expenditure Reports',
            desc: 'Reconcile JobCost transaction records to the General Ledger and analyse period-level expenditure patterns to support month-end close, audit queries, and project cashflow forecasting. These reports bridge the construction accounting system and the main financial ledger.',
            activities: [
              'Run the Job Cost to GL Reference report at period close to confirm that all JobCost transactions have been correctly posted to the GL and reconcile to the trial balance',
              'Use the Monthly Expenditures report to build a cashflow forecast from actual spend patterns — comparing monthly run rates against the project programme',
              'Run the Active Construction Jobs report at each management meeting for an at-a-glance view of all live projects and their overall status',
              'Use the Cost Code Detail by Period report to respond to audit queries or investigate specific cost line movements within a defined period',
              'Confirm that all interfaces between JobCost and the GL are functioning correctly by comparing the GL Reference report to the AP invoice register',
            ],
            mri_title: 'GL & Expenditure Reports (JC > Reports > GL and Expenditure Reports)',
            mri_prereqs: [
              'Interface charts fully configured and GL posting confirmed before running reconciliation reports',
              'Period close complete in both AP and GL before running the GL Reference report',
            ],
            mri_assoc: [
              { name: 'JC > Reports > Job Cost to GL Reference Report', desc: 'Reconciliation between JobCost transaction records and GL journal entries — confirms complete and accurate GL posting' },
              { name: 'JC > Reports > Job Cost Monthly Expenditures Report', desc: 'Month-by-month expenditure breakdown by cost code — supports cashflow forecasting and trend analysis' },
              { name: 'JC > Reports > Job Cost Active Construction Jobs Report', desc: 'Portfolio-level project status report — all active jobs, their completion percentage, and overall cost position' },
              { name: 'JC > Reports > Job Cost: Cost Code Detail by Period Report', desc: 'Granular cost detail within a period — useful for audit queries and investigating specific cost movements' },
            ],
          },
        ],
      },
    ],
  },
];
