/* ═══════════════════════════════════════════════════════════════════════════
   business/extended.js — Expanded CRE business-process areas

   Seeded from "Commercial Real Estate Business Processes — A System-Agnostic
   Reference Guide" (Oliver Marsden-Hill, June 2026). Each area becomes a
   business tab; each doc bullet becomes a process card flagged needsEnrichment
   (Market / Vertical / Standards to be filled during discovery).

   `entities` maps applicability per CRE entity type, seeded from the guide's
   "Who Does What" matrix:  'core' (✅) · 'conditional' (⚪) · null (n/a)
   ═══════════════════════════════════════════════════════════════════════════ */

// Category → banner colour (areas inherit their category's colour)
export const CATEGORIES = {
  'Core Financial':       { color: '#2d4a0a' },
  'Property & Lease':     { color: '#155a5a' },
  'Investment & Fund':    { color: '#4a2a6a' },
  'Development':          { color: '#6a3a1a' },
  'Corporate & Back-Office': { color: '#34495e' },
};

export const ENTITY_TYPES = [
  { key: 'reit', label: 'REIT' },
  { key: 'pm',   label: 'Property Manager' },
  { key: 'dev',  label: 'Developer' },
];

const C = 'core', K = 'conditional', N = null;

/** Each area: id, label, icon, category, entities{reit,pm,dev}, bullets[] */
export const EXTENDED_AREAS = [
  // ── Core Financial & Accounting (new areas) ──
  { id: 'bbf', label: 'Budgeting & Forecasting', icon: '📊', category: 'Core Financial',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Annual budget creation (revenue and expenditure)',
      'Reforecasting (quarterly or as needed)',
      'Variance analysis — budget vs. actuals',
      'Approval and sign-off workflows',
      'Budget-to-GL posting',
      'Scenario modelling (best case, worst case, base case)',
      'Capital expenditure budgeting',
      'Integration with lease data for revenue projections',
    ] },
  { id: 'btreasury', label: 'Treasury & Cash Management', icon: '💰', category: 'Core Financial',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Cash flow forecasting (short-term and long-term)',
      'Bank account management across entities',
      'Liquidity planning and working capital management',
      'Loan drawdown and repayment tracking',
      'Interest rate and debt covenant monitoring',
      'Foreign currency exposure management',
      'Dividend / distribution planning',
    ] },
  { id: 'barcorp', label: 'AR — Corporate / Non-Tenant', icon: '🧾', category: 'Core Financial',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Non-tenant receivables (management fees, corporate client invoicing)',
      'Inter-entity recharges and internal cost recovery',
      'Sundry and ad-hoc income billing',
      'Entity-based debtor tracking (separate from tenant ledgers)',
      'Reconciliation against source documentation',
    ] },

  // ── Property & Lease Management ──
  { id: 'blease', label: 'Lease Administration', icon: '📑', category: 'Property & Lease',
    entities: { reit: C, pm: C, dev: K }, bullets: [
      'Lease abstraction — capturing key commercial terms from executed documents',
      'Critical date tracking (expiry, break options, rent review, renewal deadlines)',
      'Rent escalation and review mechanisms (CPI-linked, open market, fixed, turnover)',
      'Tenant onboarding and offboarding processes',
      'Security deposit and bank guarantee management',
      'Lease amendment and variation management',
      'Holdover and month-to-month lease tracking',
      'IFRS 16 / ASC 842 lease accounting compliance (lessee-side)',
      'Guarantor and surety tracking',
    ] },
  { id: 'bservice', label: 'Service Charge / Expense Recovery', icon: '🧮', category: 'Property & Lease',
    entities: { reit: C, pm: C, dev: K }, bullets: [
      'Recoverable vs. non-recoverable expense identification',
      'Service charge budget preparation and approval',
      'Apportionment methodology (floor area, rateable value, fixed %, weighted)',
      'On-account billing (interim charges based on budget)',
      'Year-end reconciliation and true-up billing / credit',
      'Sinking fund / reserve fund management',
      'Cap and collar provisions',
      'Compliance with local service charge codes (e.g., RICS Professional Statement)',
    ] },
  { id: 'bops', label: 'Property Operations & Facilities', icon: '🛠️', category: 'Property & Lease',
    entities: { reit: C, pm: C, dev: K }, bullets: [
      'Day-to-day building operations and management',
      'Planned preventive maintenance (PPM) scheduling',
      'Reactive maintenance and repair management',
      'Contractor and vendor management',
      'Health & safety compliance and risk assessments',
      'Building inspections and condition surveys',
      'Sustainability, energy management, and ESG reporting',
      'Tenant fit-out coordination and reinstatement management',
      'Common area upkeep and landscaping',
    ] },
  { id: 'basset', label: 'Asset Management', icon: '📈', category: 'Property & Lease',
    entities: { reit: C, pm: C, dev: K }, bullets: [
      'Portfolio performance monitoring and KPI tracking',
      'Net operating income (NOI) optimisation',
      'Tenant mix and tenant covenant strength analysis',
      'Lease renegotiation strategy and execution',
      'Refurbishment and repositioning planning',
      'Market rent analysis and benchmarking',
      'Occupancy and void management',
      'Valuation support (income capitalisation, DCF)',
      'Capital expenditure planning and ROI analysis',
    ] },

  // ── Investment & Fund Management ──
  { id: 'binvacct', label: 'Investment Accounting', icon: '🏦', category: 'Investment & Fund',
    entities: { reit: C, pm: K, dev: K }, bullets: [
      'Investor ledger management and capital account tracking',
      'Distribution waterfall calculations (preferred returns, catch-up, carried interest)',
      'Management fee calculation and billing',
      'Consolidated fund reporting (INREV, AIFMD, SEC)',
      'NAV (Net Asset Value) calculation and reporting',
      'Fair value measurement and property revaluation',
    ] },
  { id: 'bfund', label: 'Fund / SPV Structure', icon: '🏛️', category: 'Investment & Fund',
    entities: { reit: C, pm: K, dev: C }, bullets: [
      'Entity hierarchy design (LLCs, LPs, SPVs, JVs, unit trusts)',
      'GP/LP relationship and capital commitment tracking',
      'Minority interest and co-investment tracking',
      'Partnership accounting and allocation of income/losses',
      'Entity formation and dissolution tracking',
      'Multi-jurisdictional structuring (onshore/offshore)',
    ] },
  { id: 'bacq', label: 'Acquisitions & Dispositions', icon: '🤝', category: 'Investment & Fund',
    entities: { reit: C, pm: K, dev: C }, bullets: [
      'Deal origination and investment pipeline management',
      'Due diligence coordination (financial, legal, technical, environmental)',
      'Transaction structuring (asset deal vs. share deal)',
      'Board / investment committee approval processes',
      'Portfolio review and hold/sell analysis',
      'Asset recycling — capital redeployment from dispositions',
      'Completion accounting and post-acquisition integration',
    ] },
  { id: 'binvrel', label: 'Investor Relations & Reporting', icon: '📣', category: 'Investment & Fund',
    entities: { reit: C, pm: K, dev: C }, bullets: [
      'REIT compliance monitoring (dividend distribution, income composition, shareholder concentration)',
      'Investor communications (quarterly updates, annual reports, capital call / distribution notices)',
      'Regulatory filings and statutory returns',
      'Performance attribution and benchmarking (IPD, GRESB)',
      'ESG and sustainability reporting for investors',
      'Ad-hoc investor queries and data requests',
    ] },

  // ── Development-Specific ──
  { id: 'bjobcost', label: 'Job Costing / Dev Cost Tracking', icon: '🏗️', category: 'Development',
    entities: { reit: K, pm: K, dev: C }, bullets: [
      'Project cost tracking by cost code and cost category',
      'Construction draw management and progress billing',
      'Contractor payment certification and retention tracking',
      'Budget vs. actuals reporting at project level',
      'Cost-to-complete and estimated final cost forecasting',
      'Capitalisation of costs vs. expense recognition',
      'Contingency tracking and release',
    ] },
  { id: 'bdevlife', label: 'Development Lifecycle', icon: '🏙️', category: 'Development',
    entities: { reit: K, pm: K, dev: C }, bullets: [
      'Site selection and land acquisition',
      'Entitlement and permitting (zoning, planning approvals, environmental assessments)',
      'Design and planning (architectural, engineering, value engineering)',
      'Construction management — programme tracking, milestone reporting',
      'Leasing and pre-letting / pre-sales during construction',
      'Practical completion and handover',
      'Stabilisation — achieving target occupancy and income stream',
    ] },
  { id: 'bdevfin', label: 'Development Financing', icon: '💷', category: 'Development',
    entities: { reit: K, pm: K, dev: C }, bullets: [
      'Construction loan management and facility agreements',
      'Equity / debt structuring and capital stack management',
      'Drawdown schedules and utilisation tracking',
      'Interest capitalisation during construction',
      'Lender reporting and covenant compliance',
      'Refinancing into permanent / investment-grade debt at stabilisation',
    ] },

  // ── Corporate & Back-Office ──
  { id: 'bfa', label: 'Fixed Assets', icon: '🏢', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Asset register maintenance',
      'Depreciation calculation (straight-line, reducing balance)',
      'Investment property held at fair value (IAS 40)',
      'Revaluation and impairment testing',
      'Disposal accounting',
      'Right-of-use asset and lease liability tracking (IFRS 16 / ASC 842)',
    ] },
  { id: 'btax', label: 'Tax & Compliance', icon: '⚖️', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'VAT / GST management and returns',
      'Withholding tax and tax-at-source obligations',
      'REIT qualification monitoring and tax compliance',
      'Construction Industry Scheme (CIS) — UK specific',
      'Transfer pricing for inter-entity transactions',
      'Regulatory returns and statutory filings',
      'Audit trail maintenance and internal controls',
    ] },
  { id: 'bins', label: 'Insurance Management', icon: '🛡️', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Policy tracking by property and entity',
      'Claims management and loss tracking',
      'Premium allocation and recharge to tenants',
      'Renewal management and broker coordination',
      'Certificate of insurance tracking',
    ] },
  { id: 'bproc', label: 'Procurement', icon: '🛒', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Purchase requisition and approval workflows',
      'Vendor selection and onboarding',
      'Contract management (term, renewal, performance)',
      'Spend categorisation and reporting',
      'Preferred supplier panel management',
    ] },
  { id: 'bhr', label: 'HR & Payroll', icon: '👥', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Staff management and organisational structure',
      'Payroll processing and statutory deductions',
      'Benefits administration',
      'Often handled in a separate dedicated HR system',
    ] },
  { id: 'bdoc', label: 'Document & Records Management', icon: '🗄️', category: 'Corporate & Back-Office',
    entities: { reit: C, pm: C, dev: C }, bullets: [
      'Lease document storage and retrieval',
      'Correspondence management (tenant, vendor, investor)',
      'Compliance document tracking',
      'Version control and document audit trails',
      'Audit-ready filing and archival',
    ] },
];
