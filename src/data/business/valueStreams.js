/* ═══════════════════════════════════════════════════════════════════════════
   business/valueStreams.js — CRE Powered Value Streams & Process Taxonomy

   Level 1 = value stream (megaprocess)  → business tab
   Level 2 = process group               → column   (has a `note` = L2 tooltip)
   Level 3 = process / activity          → card     ({ title, desc, activities })

   The desc + activities on each L3 are PLACEHOLDER content for discovery — to be
   reviewed/tailored per client, and further enriched with Market / Vertical /
   Standards detail. tag: 'official' 🟦 / 'overlay' 🟧 (retained for reference,
   not surfaced in the UI).
   ═══════════════════════════════════════════════════════════════════════════ */

export const STREAM_TAGS = {
  official: { mark: '🟦', label: 'KPMG-official Powered value stream' },
  overlay:  { mark: '🟧', label: 'CRE-specific overlay' },
};

// Small helper so the data below stays readable: p(title, desc, ...activities)
const p = (title, desc, ...activities) => ({ title, desc, activities });

export const VALUE_STREAMS = [
  {
    id: 'vs-l2c', label: 'Lease to Cash', icon: '💷', tag: 'overlay', color: '#155a5a',
    note: 'The CRE revenue engine — the real-estate analog of Quote to Cash (landlord-side): winning tenants and turning leases into collected cash.',
    groups: [
      {
        title: 'Leasing & Deal Origination',
        note: 'Attract, qualify and convert prospective tenants into executed leases.',
        items: [
          p('Space marketing & demand generation', 'Promote available space and generate qualified tenant demand across marketing channels and brokers.', 'Publish availability across listing channels and the leasing site', 'Run marketing campaigns and capture lead sources', 'Report on enquiry volumes and conversion rates'),
          p('Broker / prospect management', 'Manage broker relationships and the prospect pipeline through viewings and offers.', 'Register brokers and prospects with contact detail', 'Track prospect stage and follow-up actions', 'Record broker commission terms'),
          p('Availability & vacancy management', 'Maintain an accurate, real-time view of available and upcoming vacant space.', 'Maintain suite availability and marketing status', 'Track lease expiries feeding upcoming vacancy', 'Publish availability schedules to stakeholders'),
          p('Tours & proposals', 'Coordinate space viewings and issue commercial proposals to interested prospects.', 'Schedule and log property tours', 'Prepare and issue commercial proposals', 'Track proposal responses and objections'),
          p('Letter of intent (LOI)', 'Capture the non-binding heads of terms agreed with a prospect before lease drafting.', 'Record agreed key terms in the LOI', 'Route the LOI for internal approval', 'Track LOI-to-lease conversion'),
          p('Lease negotiation', 'Negotiate the final commercial and legal terms of the lease with the tenant.', 'Negotiate rent, term, incentives and clauses', 'Manage redline versions and approvals', 'Confirm and document final agreed terms'),
          p('Tenant credit underwriting', 'Assess the financial covenant strength and credit risk of the prospective tenant.', 'Collect financial statements and references', 'Assess covenant strength and set conditions', 'Record the credit decision and any guarantees'),
          p('Lease execution', 'Finalise, sign and activate the lease, creating the binding tenancy record.', 'Circulate the final lease for signature', 'Capture execution dates and signed documents', 'Activate the lease record for billing'),
        ],
      },
      {
        title: 'Lease Administration & Abstraction',
        note: 'Capture and maintain the authoritative lease data that drives billing, recoveries and reporting.',
        items: [
          p('Lease abstraction', 'Extract key commercial terms from executed lease documents into structured data.', 'Abstract rent, term, options and clauses', 'Validate abstracted data against the document', 'Load abstracted terms into the system'),
          p('Critical-date management', 'Track and alert on time-sensitive lease events so none are missed.', 'Record break, review, renewal and expiry dates', 'Configure reminders and escalation', 'Report upcoming critical dates'),
          p('Lease master-data management', 'Maintain accurate lease, tenant and suite master data over the lease life.', 'Maintain lease, tenant and unit records', 'Apply amendments and corrections under control', 'Audit master-data changes'),
          p('Clause & option tracking', 'Track special clauses and tenant/landlord options and their exercise windows.', 'Record options, rights and special clauses', 'Monitor exercise windows', 'Process option exercises and outcomes'),
          p('Document management', 'Store, link and version lease documents for retrieval and audit.', 'Attach and index lease documents', 'Maintain version control and execution status', 'Support retrieval for audit and disputes'),
        ],
      },
      {
        title: 'Rent Billing & Recurring Charges',
        note: 'Generate accurate periodic tenant charges from lease terms.',
        items: [
          p('Base rent billing', 'Generate periodic base rent charges in line with lease terms.', 'Configure base rent charge lines', 'Run periodic billing', 'Reconcile billed rent to the rent roll'),
          p('Escalations / step rents', 'Apply contractual rent increases (fixed steps, CPI, market) on schedule.', 'Configure escalation methods and schedules', 'Process scheduled escalations', 'Notify tenants of rent changes'),
          p('Percentage rent (retail)', 'Bill turnover-based rent from certified retailer sales.', 'Collect and certify tenant sales', 'Calculate percentage rent over breakpoints', 'Bill and reconcile turnover rent'),
          p('Recurring-charge setup', 'Configure the recurring charge lines that make up a tenant’s regular invoice.', 'Set up recurring charge codes and amounts', 'Map charges to income categories/GL', 'Maintain charges through lease changes'),
          p('Rent-roll management', 'Maintain the rent roll as the single source of contracted income.', 'Maintain the current rent roll', 'Reconcile rent roll to billing', 'Report rent roll and WAULT'),
        ],
      },
      {
        title: 'Recoveries / CAM Management',
        note: 'Recover operating and common-area costs from tenants and reconcile at year end.',
        items: [
          p('Operating-expense pooling', 'Group recoverable property costs into pools for apportionment to tenants.', 'Define recoverable expense pools', 'Assign costs to the correct pools', 'Exclude non-recoverable items'),
          p('Recovery-method config (pro rata, base year, caps)', 'Configure how each pool is recovered, including base years and caps.', 'Set apportionment and recovery methods', 'Configure caps, collars and base years', 'Link recovery config to leases'),
          p('CAM estimates & monthly billing', 'Bill tenants on-account estimates for recoverable costs through the year.', 'Set annual on-account estimates', 'Bill monthly recovery charges', 'Adjust estimates as costs change'),
          p('Year-end CAM reconciliation', 'Reconcile actual recoverable costs to on-account billings and true-up.', 'Compile actual recoverable costs', 'Calculate tenant true-up/credit', 'Issue reconciliation statements'),
          p('Tax & insurance recoveries', 'Recover property tax and insurance costs from tenants per lease terms.', 'Capture rates and insurance costs', 'Apportion and bill to tenants', 'Reconcile at year end'),
        ],
      },
      {
        title: 'Cash Collections & AR',
        note: 'Apply cash, manage tenant arrears and protect income from bad debt.',
        items: [
          p('Cash application', 'Match incoming tenant receipts to open charges accurately and promptly.', 'Import bank and lockbox receipts', 'Apply cash to open items', 'Handle unallocated and part-payments'),
          p('Tenant AR aging', 'Monitor outstanding tenant balances by age to prioritise collections.', 'Produce aged debtor reports', 'Review balances with property teams', 'Flag accounts for action'),
          p('Collections & dunning', 'Pursue overdue balances through a structured escalation process.', 'Issue reminders and dunning letters', 'Log collection actions and promises', 'Escalate persistent arrears'),
          p('Security deposits / LOC management', 'Administer cash deposits, bank guarantees and letters of credit.', 'Record deposits and instruments held', 'Track expiry and renewal of guarantees', 'Process drawdowns and releases'),
          p('Dispute management', 'Log and resolve tenant billing disputes to unblock collection.', 'Record and categorise disputes', 'Investigate and adjust where valid', 'Track resolution and re-billing'),
        ],
      },
      {
        title: 'Lessor Lease Accounting & Revenue Recognition',
        note: 'Recognise lease revenue correctly under the applicable accounting standards.',
        items: [
          p('Lease classification (operating vs. finance)', 'Classify leases to determine the correct lessor accounting treatment.', 'Assess lease terms against criteria', 'Classify as operating or finance', 'Document the classification rationale'),
          p('Straight-line rent', 'Spread stepped and rent-free periods evenly over the lease term.', 'Calculate straight-line rent', 'Post SLR adjustments', 'Reconcile deferred/accrued rent'),
          p('ASC 842 / IFRS 16 lessor accounting', 'Apply lessor lease-accounting standards to lease income and disclosures.', 'Configure standard-compliant treatment', 'Produce required schedules', 'Support disclosure reporting'),
          p('Revenue recognition', 'Recognise rental and related income in the correct periods.', 'Recognise income per policy', 'Handle variable and contingent rent', 'Reconcile recognised revenue'),
          p('Deferred rent & incentives', 'Account for lease incentives and deferred rent over the lease term.', 'Amortise incentives over the term', 'Track deferred rent balances', 'Disclose incentive impacts'),
        ],
      },
      {
        title: 'Renewals, Options & Lease Events',
        note: 'Manage changes to live leases through renewal, restructuring and exit.',
        items: [
          p('Renewals', 'Manage lease renewals to retain tenants and sustain income.', 'Identify upcoming expiries', 'Negotiate and document renewals', 'Update records and billing'),
          p('Expansions / contractions', 'Process changes to demised area during the lease.', 'Capture area and rent changes', 'Reconfigure billing and recoveries', 'Update suite and lease records'),
          p('Assignments & subleases', 'Administer transfer of a lease or subletting of space.', 'Assess and approve assignment/sublease', 'Record new party and terms', 'Update guarantees and billing'),
          p('Terminations & buyouts', 'Handle early lease exits including surrender and buyout settlements.', 'Agree surrender/buyout terms', 'Settle final account and deposits', 'Close the lease record'),
          p('Holdover management', 'Manage tenants remaining beyond lease expiry on holdover terms.', 'Identify holdover tenancies', 'Apply holdover rent terms', 'Progress to renewal or exit'),
        ],
      },
    ],
  },

  {
    id: 'vs-q2c', label: 'Quote to Cash', icon: '🧾', tag: 'official', color: '#2a6f97',
    note: 'Generic non-tenant revenue stream — billing management-fee, corporate-client and other non-tenant customers. Complements the tenant-focused Lease to Cash.',
    groups: [
      {
        title: 'Customer & Contract Management',
        note: 'Set up and maintain non-tenant customers, agreements and pricing.',
        items: [
          p('Customer master-data management', 'Maintain accurate master data for non-tenant customers and clients.', 'Create and maintain customer records', 'Maintain billing and contact detail', 'Govern changes and duplicates'),
          p('Service / management-agreement setup', 'Set up management and service agreements that drive fee billing.', 'Capture agreement scope and terms', 'Configure fee basis and schedule', 'Link agreements to customers'),
          p('Pricing & rate cards', 'Maintain the rates and fee structures applied to customer billing.', 'Maintain rate cards and fee rates', 'Apply client-specific pricing', 'Version and approve rate changes'),
          p('Contract / SOW management', 'Manage the contract and statement-of-work lifecycle for services.', 'Store contracts and SOWs', 'Track scope, renewal and expiry', 'Link deliverables to billing'),
        ],
      },
      {
        title: 'Quote & Order Management',
        note: 'Quote services and capture approved orders ready to bill.',
        items: [
          p('Quotation & proposal', 'Produce quotes and proposals for non-tenant services.', 'Prepare quotes from rate cards', 'Issue and track proposals', 'Convert accepted quotes to orders'),
          p('Order capture', 'Record confirmed service orders for fulfilment and billing.', 'Capture order lines and terms', 'Validate against the agreement', 'Queue orders for billing'),
          p('Order approval & acceptance', 'Route orders through approval and record customer acceptance.', 'Apply approval thresholds', 'Record customer acceptance', 'Release orders to fulfilment'),
        ],
      },
      {
        title: 'Billing & Invoicing (Non-Tenant)',
        note: 'Raise invoices for fees, corporate clients, sundry and inter-entity income.',
        items: [
          p('Management-fee billing', 'Calculate and bill management fees per the agreement basis.', 'Calculate fees on the agreed basis', 'Generate fee invoices', 'Reconcile fees to agreements'),
          p('Corporate / client invoicing', 'Invoice corporate clients for services rendered.', 'Raise client invoices from orders', 'Apply correct tax treatment', 'Distribute invoices to clients'),
          p('Sundry & ad-hoc income billing', 'Bill one-off and miscellaneous income items.', 'Capture ad-hoc charges', 'Approve and raise invoices', 'Code income correctly'),
          p('Inter-entity recharges & internal cost recovery', 'Recharge costs and services between group entities.', 'Identify recoverable inter-entity costs', 'Raise inter-entity recharges', 'Reconcile intercompany balances'),
          p('Milestone / fee-based billing', 'Bill against project milestones or agreed fee stages.', 'Track milestones and triggers', 'Raise milestone invoices', 'Reconcile billed vs earned'),
        ],
      },
      {
        title: 'Service Revenue Recognition',
        note: 'Recognise service revenue in line with ASC 606 / IFRS 15.',
        items: [
          p('Service revenue recognition (ASC 606 / IFRS 15)', 'Recognise service revenue as performance obligations are met.', 'Identify performance obligations', 'Recognise revenue on satisfaction', 'Support standard disclosures'),
          p('Deferred & accrued revenue', 'Manage timing differences between billing and revenue.', 'Track deferred and accrued balances', 'Post period adjustments', 'Reconcile to the ledger'),
          p('Performance-obligation tracking', 'Track delivery of obligations that drive recognition.', 'Define obligations per contract', 'Monitor completion status', 'Trigger recognition events'),
        ],
      },
      {
        title: 'Collections & Cash Application',
        note: 'Collect non-tenant receivables and apply cash.',
        items: [
          p('Cash application', 'Apply non-tenant receipts to open invoices accurately.', 'Import receipts', 'Match to open items', 'Resolve unapplied cash'),
          p('Non-tenant AR aging', 'Monitor non-tenant receivable balances by age.', 'Produce aged AR reports', 'Prioritise collections', 'Flag at-risk balances'),
          p('Collections & dunning', 'Pursue overdue non-tenant balances.', 'Issue reminders', 'Log collection actions', 'Escalate as needed'),
          p('Dispute management', 'Resolve non-tenant billing disputes.', 'Record disputes', 'Investigate and adjust', 'Track resolution'),
          p('Bad-debt provisioning & write-offs', 'Provide for and write off irrecoverable non-tenant debt.', 'Assess recoverability', 'Raise provisions', 'Process approved write-offs'),
        ],
      },
    ],
  },

  {
    id: 'vs-a2r', label: 'Acquire to Retire', icon: '🏢', tag: 'official', color: '#4a2a6a',
    note: 'Investment & asset lifecycle — from sourcing and underwriting through ownership to disposition.',
    groups: [
      {
        title: 'Investment Strategy & Sourcing',
        note: 'Define investment strategy and build a pipeline of opportunities.',
        items: [
          p('Investment thesis & strategy', 'Set the investment strategy and target criteria for the portfolio.', 'Define target sectors and geographies', 'Set return and risk parameters', 'Agree the investment thesis'),
          p('Market analysis', 'Analyse markets to identify and validate opportunities.', 'Assess market supply and demand', 'Benchmark rents and yields', 'Identify target submarkets'),
          p('Deal sourcing & pipeline', 'Source opportunities and manage the deal pipeline.', 'Source deals via brokers and networks', 'Log opportunities in the pipeline', 'Track deal status and owners'),
          p('Preliminary screening', 'Screen opportunities against strategy before deeper work.', 'Apply screening criteria', 'Produce initial deal summaries', 'Decide pursue / pass'),
        ],
      },
      {
        title: 'Underwriting & Due Diligence',
        note: 'Model returns and verify the asset before committing capital.',
        items: [
          p('Financial underwriting / modeling', 'Build the financial model and underwrite expected returns.', 'Model cash flows and returns', 'Test assumptions and scenarios', 'Produce the investment case'),
          p('Valuation & appraisal', 'Determine asset value to support pricing and financing.', 'Commission or perform valuation', 'Reconcile to underwriting', 'Support lender valuation'),
          p('Physical / technical DD', 'Assess the physical condition and technical risks of the asset.', 'Commission building surveys', 'Assess capex requirements', 'Log condition findings'),
          p('Environmental DD', 'Assess environmental and sustainability risks and obligations.', 'Commission environmental assessments', 'Identify contamination/ESG risks', 'Plan remediation if required'),
          p('Legal & title DD', 'Verify title, leases and legal obligations.', 'Review title and leases', 'Identify legal risks', 'Confirm clean transfer'),
          p('Tax-structuring DD', 'Determine the optimal tax structure for the acquisition.', 'Assess structuring options', 'Model tax impacts', 'Agree the holding structure'),
        ],
      },
      {
        title: 'Acquisition / Deal Execution',
        note: 'Negotiate, approve, fund and close the acquisition.',
        items: [
          p('Offer & PSA negotiation', 'Negotiate the offer and purchase & sale agreement.', 'Submit and negotiate offers', 'Agree PSA terms', 'Manage conditions to close'),
          p('Investment-committee approval', 'Secure governance approval to proceed.', 'Prepare the IC paper', 'Present to committee', 'Record the decision'),
          p('Debt sourcing', 'Arrange acquisition financing.', 'Approach lenders', 'Compare term sheets', 'Agree facility terms'),
          p('Closing & funding', 'Complete the transaction and fund the purchase.', 'Coordinate completion', 'Fund and settle', 'Confirm transfer of title'),
          p('Capitalization', 'Establish the capital structure of the acquired asset.', 'Record equity and debt', 'Set up the entity/SPV', 'Open the asset for accounting'),
        ],
      },
      {
        title: 'Asset Onboarding & Capitalization',
        note: 'Bring the asset onto the books ready for management and reporting.',
        items: [
          p('Asset-register setup', 'Create the fixed-asset and property records for the asset.', 'Create asset register entries', 'Capture acquisition cost', 'Link to entity and property'),
          p('Cost segregation', 'Split acquisition cost into components for depreciation/tax.', 'Segregate cost components', 'Assign useful lives', 'Support tax treatment'),
          p('Componentization', 'Break the asset into components for accounting.', 'Define components', 'Allocate cost to components', 'Set component depreciation'),
          p('Depreciation setup', 'Configure depreciation for the asset and components.', 'Select methods and lives', 'Schedule depreciation', 'Validate first run'),
          p('Transition management', 'Transition the asset into operational management.', 'Onboard property/PM systems', 'Transfer leases and data', 'Hand over to operations'),
        ],
      },
      {
        title: 'Ongoing Asset Management',
        note: 'Execute the business plan and manage value through the hold.',
        items: [
          p('Business-plan execution', 'Deliver the asset business plan to target returns.', 'Track plan initiatives', 'Monitor performance vs plan', 'Report to investors'),
          p('Hold/sell analysis', 'Periodically test whether to hold or sell the asset.', 'Model hold vs sell', 'Assess market timing', 'Recommend strategy'),
          p('Refinancing', 'Refinance debt to optimise the capital stack.', 'Assess refinancing options', 'Negotiate new facilities', 'Execute refinancing'),
          p('Capital-event management', 'Manage significant capital events on the asset.', 'Plan capital events', 'Fund and account for them', 'Report impacts'),
          p('Impairment review', 'Assess assets for impairment under policy.', 'Test carrying values', 'Recognise impairment where needed', 'Disclose outcomes'),
        ],
      },
      {
        title: 'Disposition / Retirement',
        note: 'Sell or retire the asset and account for the outcome.',
        items: [
          p('Disposition strategy', 'Define the strategy and timing for exit.', 'Set disposal objectives', 'Assess buyer universe', 'Agree the approach'),
          p('Sale process & marketing', 'Run the sale process to achieve best value.', 'Appoint agents and market', 'Manage bids', 'Select preferred buyer'),
          p('Buyer-DD support', 'Support the buyer’s due diligence.', 'Prepare the data room', 'Respond to DD queries', 'Manage disclosures'),
          p('Closing', 'Complete the sale transaction.', 'Coordinate completion', 'Settle and transfer', 'Confirm proceeds'),
          p('Gain/loss & retirement accounting', 'Account for the disposal and retire the asset.', 'Calculate gain/loss', 'Post disposal entries', 'Retire asset records'),
        ],
      },
    ],
  },

  {
    id: 'vs-p2p-plan', label: 'Plan to Perform', icon: '📊', tag: 'official', color: '#2d4a0a',
    note: 'Portfolio planning & FP&A — from strategy and budgets through to performance analytics.',
    groups: [
      {
        title: 'Strategic & Portfolio Planning',
        note: 'Set portfolio strategy and allocate capital.',
        items: [
          p('Portfolio strategy', 'Define the strategy and targets for the portfolio.', 'Set portfolio objectives', 'Define target allocations', 'Agree the plan'),
          p('Capital allocation', 'Allocate capital across assets, funds and initiatives.', 'Assess capital demands', 'Prioritise allocations', 'Approve capital plan'),
          p('Fund / vehicle planning', 'Plan fund and vehicle structures and capacity.', 'Plan vehicle capacity', 'Model fund economics', 'Align to strategy'),
          p('ESG strategy', 'Set ESG objectives and targets across the portfolio.', 'Define ESG targets', 'Plan initiatives', 'Track commitments'),
        ],
      },
      {
        title: 'Budgeting & Forecasting',
        note: 'Build property and portfolio budgets and keep forecasts current.',
        items: [
          p('Property-level budgets', 'Prepare annual income and expenditure budgets per property.', 'Build income and expense budgets', 'Review with property teams', 'Approve and load budgets'),
          p('NOI forecasting', 'Forecast net operating income across the portfolio.', 'Model NOI drivers', 'Produce NOI forecasts', 'Explain movements'),
          p('Reforecasting', 'Update forecasts through the year as actuals emerge.', 'Trigger periodic reforecasts', 'Adjust for actuals and events', 'Communicate revised outlook'),
          p('Capital (capex) budgeting', 'Plan and control capital expenditure.', 'Build capex plans', 'Prioritise and approve', 'Track capex vs budget'),
          p('Debt & equity planning', 'Plan financing and equity requirements.', 'Model funding needs', 'Plan drawdowns/calls', 'Align to budgets'),
        ],
      },
      {
        title: 'Performance Management & Analytics',
        note: 'Measure performance and report insight to stakeholders.',
        items: [
          p('NOI / occupancy / WAULT analytics', 'Analyse core operational KPIs across the portfolio.', 'Track NOI, occupancy and WAULT', 'Trend and benchmark', 'Surface exceptions'),
          p('Investor returns (IRR, equity multiple)', 'Measure investment returns for investors.', 'Calculate IRR and multiples', 'Attribute performance', 'Report to investors'),
          p('Variance analysis', 'Explain actuals against budget and forecast.', 'Compute variances', 'Investigate drivers', 'Report commentary'),
          p('Benchmarking', 'Benchmark performance against indices and peers.', 'Select benchmarks', 'Compare performance', 'Report relative results'),
          p('KPI & dashboard reporting', 'Deliver KPI dashboards to management and investors.', 'Define KPIs', 'Build dashboards', 'Distribute reporting'),
        ],
      },
    ],
  },

  {
    id: 'vs-s2p', label: 'Source to Pay', icon: '🛒', tag: 'official', color: '#1a3f6a',
    note: 'Property opex & capex procurement — from sourcing suppliers to paying invoices.',
    groups: [
      {
        title: 'Source to Contract (S2C)',
        note: 'Source suppliers and put compliant contracts in place.',
        items: [
          p('Vendor sourcing', 'Identify and select suppliers for property goods and services.', 'Run sourcing events', 'Evaluate bids', 'Select suppliers'),
          p('Category strategy (FM, utilities, construction)', 'Define sourcing strategy by spend category.', 'Analyse category spend', 'Set category strategy', 'Plan sourcing pipeline'),
          p('Contract lifecycle management', 'Manage supplier contracts through their lifecycle.', 'Draft and approve contracts', 'Track renewals and expiry', 'Monitor performance/SLAs'),
          p('Vendor onboarding & risk', 'Onboard suppliers with the right compliance and risk checks.', 'Collect vendor documentation', 'Run risk and compliance checks', 'Activate approved vendors'),
        ],
      },
      {
        title: 'Procure to Pay (P2P)',
        note: 'Requisition, receive, match and pay for goods and services.',
        items: [
          p('Requisition / PO', 'Raise and approve requisitions and purchase orders.', 'Create requisitions', 'Approve and issue POs', 'Track commitments'),
          p('Service procurement', 'Procure services against agreements and SLAs.', 'Raise service orders', 'Confirm delivery', 'Approve service completion'),
          p('Invoice capture & 3-way matching', 'Capture invoices and match to PO and receipt.', 'Capture/OCR invoices', 'Match invoice-PO-receipt', 'Resolve exceptions'),
          p('Accounts payable', 'Process approved invoices for payment.', 'Code and post invoices', 'Manage approvals and holds', 'Maintain AP ledger'),
          p('Payment', 'Execute supplier payments accurately and on time.', 'Select invoices for payment', 'Run payment batches', 'Reconcile payments'),
          p('Vendor management', 'Maintain supplier data and relationships.', 'Maintain vendor master data', 'Manage statements and queries', 'Review vendor performance'),
        ],
      },
      {
        title: 'Property Expense Management',
        note: 'Manage recurring property operating costs.',
        items: [
          p('Operating-expense management', 'Control and account for property operating expenditure.', 'Track opex against budget', 'Approve expense commitments', 'Report opex performance'),
          p('Utility management', 'Manage utility supply, consumption and cost.', 'Manage utility accounts', 'Validate consumption/invoices', 'Recharge where recoverable'),
          p('Property-tax management', 'Manage property tax/rates obligations and payments.', 'Track assessments and liabilities', 'Pay on schedule', 'Recover from tenants where applicable'),
          p('Insurance procurement & management', 'Procure and administer property insurance.', 'Arrange cover', 'Maintain policies and certificates', 'Allocate/recover premiums'),
        ],
      },
    ],
  },

  {
    id: 'vs-p2r', label: 'Project to Result', icon: '🏗️', tag: 'official', color: '#6a3a1a',
    note: 'Development, construction & capital projects — from feasibility to a capitalised, stabilised asset.',
    groups: [
      {
        title: 'Development & Entitlements',
        note: 'Establish feasibility and secure the right to build.',
        items: [
          p('Feasibility / highest-and-best-use', 'Test whether a development is viable and optimal.', 'Model development feasibility', 'Assess highest-and-best-use', 'Recommend go / no-go'),
          p('Site acquisition', 'Acquire the development site.', 'Negotiate site purchase', 'Complete site DD', 'Close site acquisition'),
          p('Entitlements & zoning', 'Secure planning, zoning and permits.', 'Prepare planning applications', 'Manage authority engagement', 'Obtain approvals'),
          p('Design management', 'Manage design development and value engineering.', 'Coordinate the design team', 'Run value engineering', 'Freeze the design'),
        ],
      },
      {
        title: 'Capital Project & Construction Mgmt',
        note: 'Deliver the build to time, cost and quality with controlled cost tracking.',
        items: [
          p('Project setup & budgeting', 'Establish the project structure, budget and cost codes.', 'Set up the project and cost codes', 'Load the project budget', 'Baseline the programme'),
          p('Tenant-improvement (TI) management', 'Manage tenant improvement works and allowances.', 'Track TI scope and allowances', 'Approve TI spend', 'Reconcile TI to lease terms'),
          p('Capex project management', 'Manage capital project delivery and change.', 'Track progress and milestones', 'Manage changes and variations', 'Report project status'),
          p('Cost control & WIP', 'Control committed and actual costs and work-in-progress.', 'Track commitments and actuals', 'Maintain WIP', 'Forecast cost-to-complete'),
          p('Draws & funding', 'Manage construction draws and funding.', 'Prepare draw requests', 'Certify and fund draws', 'Track retention'),
          p('Project accounting', 'Account for project costs correctly.', 'Post project costs', 'Reconcile to control', 'Support capitalisation'),
        ],
      },
      {
        title: 'Project Close & Capitalization',
        note: 'Complete, hand over and capitalise the finished asset.',
        items: [
          p('Completion & handover', 'Complete the works and hand over the asset.', 'Manage practical completion', 'Resolve snagging', 'Hand over to operations'),
          p('Capitalization', 'Capitalise project costs to the asset.', 'Determine capitalisable costs', 'Transfer WIP to fixed assets', 'Start depreciation'),
          p('Warranty management', 'Track warranties and defects liability.', 'Register warranties', 'Manage defects liability period', 'Pursue warranty claims'),
          p('Project profitability analysis', 'Assess final project outturn vs plan.', 'Compare actual vs budget', 'Analyse variances', 'Capture lessons learned'),
        ],
      },
    ],
  },

  {
    id: 'vs-r2r', label: 'Record to Report', icon: '📒', tag: 'official', color: '#34495e',
    note: 'Property / fund / corporate accounting — capturing transactions through to financial and investor reporting.',
    groups: [
      {
        title: 'Transaction Processing & Sub-ledgers (T2R)',
        note: 'Capture transactions and integrate sub-ledgers into the GL.',
        items: [
          p('GL postings', 'Record journal entries accurately to the general ledger.', 'Prepare and post journals', 'Apply approval controls', 'Maintain audit trail'),
          p('Sub-ledger integration (AR / AP / FA)', 'Integrate sub-ledgers into the GL and reconcile.', 'Post sub-ledger activity', 'Reconcile sub-ledgers to GL', 'Resolve differences'),
        ],
      },
      {
        title: 'Property & Fund Accounting',
        note: 'Maintain property, fund and entity accounting including intercompany.',
        items: [
          p('Property-level accounting', 'Maintain accounting at the individual property level.', 'Maintain property ledgers', 'Post property transactions', 'Reconcile property accounts'),
          p('Fund / JV accounting', 'Account for funds and joint ventures.', 'Maintain fund/JV books', 'Allocate income and costs', 'Reconcile partner positions'),
          p('Waterfall & distribution calcs', 'Calculate distributions per the waterfall.', 'Model the distribution waterfall', 'Calculate preferred returns and splits', 'Process distributions'),
          p('Intercompany', 'Manage intercompany transactions and eliminations.', 'Record intercompany activity', 'Reconcile intercompany balances', 'Prepare eliminations'),
        ],
      },
      {
        title: 'Close & Consolidation',
        note: 'Close the period and consolidate the group.',
        items: [
          p('Period close', 'Complete the periodic accounting close.', 'Run close checklist', 'Post accruals and adjustments', 'Lock the period'),
          p('Reconciliations', 'Reconcile key accounts as part of close.', 'Prepare balance-sheet recs', 'Clear reconciling items', 'Review and sign off'),
          p('Consolidation & eliminations', 'Consolidate entities and eliminate intercompany.', 'Aggregate entity results', 'Process eliminations', 'Produce consolidated numbers'),
        ],
      },
      {
        title: 'Financial, Regulatory & Investor Reporting',
        note: 'Produce statutory, regulatory and investor-facing reporting.',
        items: [
          p('Statutory / GAAP / IFRS reporting', 'Produce statutory financial statements.', 'Prepare statutory accounts', 'Apply GAAP/IFRS', 'Support audit'),
          p('REIT compliance & testing', 'Perform REIT compliance tests and reporting.', 'Run income/asset tests', 'Monitor distribution requirements', 'Report compliance'),
          p('Investor reporting (NAV, capital accounts)', 'Produce investor NAV and capital-account reporting.', 'Calculate NAV', 'Maintain capital accounts', 'Distribute investor reports'),
          p('Management reporting', 'Produce internal management reporting.', 'Prepare management packs', 'Add commentary', 'Distribute to stakeholders'),
          p('ESG reporting', 'Report ESG performance to stakeholders.', 'Collect ESG data', 'Produce ESG reports', 'Support frameworks/ratings'),
        ],
      },
    ],
  },

  {
    id: 'vs-tdm', label: 'Treasury & Debt Management', icon: '💰', tag: 'official', color: '#7a5a10',
    note: 'Cash, debt and capital-markets management, and financial risk.',
    groups: [
      {
        title: 'Cash & Liquidity Management',
        note: 'Manage cash positions, banking and distributions.',
        items: [
          p('Cash positioning', 'Maintain visibility and control of cash across accounts.', 'Consolidate cash positions', 'Forecast short-term cash', 'Manage sweeps and transfers'),
          p('Bank-relationship management', 'Manage banking relationships and accounts.', 'Maintain bank accounts and mandates', 'Manage bank relationships', 'Control signatories'),
          p('Lockbox', 'Operate lockbox collections and reconciliation.', 'Configure lockbox feeds', 'Apply lockbox receipts', 'Reconcile lockbox activity'),
          p('Distributions & capital calls', 'Process investor distributions and capital calls.', 'Calculate distributions/calls', 'Issue notices', 'Process and reconcile flows'),
        ],
      },
      {
        title: 'Debt & Capital Markets',
        note: 'Source, service and comply with debt facilities.',
        items: [
          p('Debt origination / refinancing', 'Arrange new debt and refinance existing facilities.', 'Assess debt requirements', 'Negotiate facilities', 'Execute drawdowns/refinance'),
          p('Covenant compliance & monitoring', 'Monitor and report on loan covenants.', 'Track covenant metrics', 'Prepare compliance certificates', 'Manage breaches/waivers'),
          p('Debt servicing', 'Service interest and principal obligations.', 'Schedule debt service', 'Pay interest and principal', 'Reconcile loan balances'),
          p('Capital-markets execution', 'Execute capital-markets transactions.', 'Prepare transactions', 'Coordinate execution', 'Account for proceeds'),
        ],
      },
      {
        title: 'Risk & Hedging',
        note: 'Manage interest-rate, currency and insurable risk.',
        items: [
          p('Interest-rate hedging', 'Hedge interest-rate exposure on debt.', 'Assess rate exposure', 'Execute hedges', 'Account for hedges'),
          p('FX (cross-border)', 'Manage foreign-currency exposure.', 'Identify FX exposure', 'Execute FX hedges', 'Report FX impacts'),
          p('Insurance & risk financing', 'Finance and transfer insurable risk.', 'Assess risk financing needs', 'Arrange cover/programmes', 'Manage claims recovery'),
        ],
      },
    ],
  },

  {
    id: 'vs-pfo', label: 'Property & Facilities Operations', icon: '🛠️', tag: 'overlay', color: '#1a5a2a',
    note: 'The "operate" value stream — running buildings, maintenance, space and sustainability. Typically IWMS-enabled.',
    groups: [
      {
        title: 'Property Management Operations',
        note: 'Run day-to-day property operations and tenant service.',
        items: [
          p('Tenant services & relations', 'Manage tenant relationships and service delivery.', 'Handle tenant requests', 'Manage communications', 'Track satisfaction'),
          p('Work-order / service-request management', 'Manage service requests and work orders end to end.', 'Log service requests', 'Dispatch and track work orders', 'Confirm completion'),
          p('Move-in / move-out', 'Manage tenant move-in and move-out processes.', 'Coordinate move-in/out', 'Complete inspections', 'Update occupancy records'),
          p('Tenant communications', 'Communicate with tenants across the tenancy.', 'Issue notices and updates', 'Manage broadcast comms', 'Log correspondence'),
        ],
      },
      {
        title: 'Facilities & Maintenance Management',
        note: 'Keep buildings safe, compliant and well-maintained.',
        items: [
          p('Preventive maintenance', 'Plan and perform scheduled maintenance.', 'Build PPM schedules', 'Execute planned tasks', 'Record completion'),
          p('Reactive / corrective maintenance', 'Respond to breakdowns and corrective works.', 'Triage reactive issues', 'Dispatch and complete repairs', 'Track SLAs'),
          p('Vendor / contractor coordination', 'Coordinate maintenance contractors.', 'Assign contractors', 'Manage attendance and quality', 'Approve completed work'),
          p('Building-systems management', 'Manage building systems and assets.', 'Monitor building systems', 'Manage plant and equipment', 'Plan lifecycle replacement'),
        ],
      },
      {
        title: 'Space & Occupancy Management',
        note: 'Plan and track how space is configured and used.',
        items: [
          p('Space planning', 'Plan the use and configuration of space.', 'Maintain floor plans', 'Plan space changes', 'Support fit-out'),
          p('Occupancy tracking', 'Track occupancy and utilisation of space.', 'Record occupancy', 'Track vacancy', 'Report utilisation'),
          p('Stacking plans', 'Maintain building stacking plans.', 'Maintain stacking plans', 'Model tenant moves', 'Visualise occupancy'),
          p('Utilization analytics', 'Analyse how effectively space is used.', 'Capture utilisation data', 'Analyse patterns', 'Recommend optimisation'),
        ],
      },
      {
        title: 'ESG & Sustainability Operations',
        note: 'Operate buildings sustainably and evidence ESG performance.',
        items: [
          p('Energy management', 'Manage and reduce building energy use.', 'Monitor energy consumption', 'Identify efficiency measures', 'Track savings'),
          p('Emissions tracking', 'Track and report carbon emissions.', 'Capture emissions data', 'Calculate carbon footprint', 'Report against targets'),
          p('Certifications (LEED, BREEAM)', 'Achieve and maintain building certifications.', 'Assess certification criteria', 'Gather evidence', 'Maintain certifications'),
          p('ESG data management', 'Manage ESG data for operations and reporting.', 'Collect ESG operational data', 'Validate and store data', 'Feed ESG reporting'),
        ],
      },
    ],
  },

  {
    id: 'vs-h2r', label: 'Hire to Retire', icon: '👥', tag: 'official', color: '#5a3a5a', supporting: true,
    note: 'Supporting / enabling workforce stream — include only if the operating-model scope covers the workforce.',
    groups: [
      {
        title: 'Workforce Lifecycle',
        note: 'The end-to-end employee lifecycle, often handled in a dedicated HR system.',
        items: [
          p('Recruit', 'Attract and hire the people the business needs.', 'Advertise and source candidates', 'Interview and select', 'Make and confirm offers'),
          p('Onboard', 'Bring new joiners on board effectively.', 'Complete onboarding admin', 'Provision access and equipment', 'Run induction'),
          p('Core HR', 'Maintain employee records and HR processes.', 'Maintain employee data', 'Administer changes', 'Support policies and cases'),
          p('Payroll', 'Pay employees accurately and on time.', 'Process payroll', 'Apply statutory deductions', 'Reconcile and report'),
          p('Performance', 'Manage performance and development.', 'Set objectives', 'Run reviews', 'Plan development'),
          p('Offboard', 'Manage leavers cleanly and compliantly.', 'Process leavers', 'Revoke access', 'Complete exit formalities'),
        ],
      },
    ],
  },
];
