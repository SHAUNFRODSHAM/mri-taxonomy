/* ═══════════════════════════════════════════════════════════════════════════
   business/valueStreams.js — CRE Powered Value Streams & Process Taxonomy

   Seeded from "Commercial Real Estate: Powered Value Streams & Process
   Taxonomy (L1 / L2 / L3)". This is the condensed business-process model that
   replaces the earlier 23 functional tabs.

     Level 1 = value stream (megaprocess)  → business tab
     Level 2 = process group               → column
     Level 3 = process / activity          → card

   tag:  'official' 🟦 KPMG-published Powered value stream
         'overlay'  🟧 CRE-specific industry overlay

   The earlier functional taxonomy (raw.js / extended.js) is retained in the
   repo for reference but is no longer loaded.
   ═══════════════════════════════════════════════════════════════════════════ */

export const STREAM_TAGS = {
  official: { mark: '🟦', label: 'KPMG-official Powered value stream' },
  overlay:  { mark: '🟧', label: 'CRE-specific overlay' },
};

export const VALUE_STREAMS = [
  {
    id: 'vs-l2c', label: 'Lease to Cash', icon: '💷', tag: 'overlay', color: '#155a5a',
    note: 'The CRE revenue engine — the real-estate analog of Quote to Cash (landlord-side).',
    groups: [
      { title: 'Leasing & Deal Origination', items: ['Space marketing & demand generation', 'Broker / prospect management', 'Availability & vacancy management', 'Tours & proposals', 'Letter of intent (LOI)', 'Lease negotiation', 'Tenant credit underwriting', 'Lease execution'] },
      { title: 'Lease Administration & Abstraction', items: ['Lease abstraction', 'Critical-date management', 'Lease master-data management', 'Clause & option tracking', 'Document management'] },
      { title: 'Rent Billing & Recurring Charges', items: ['Base rent billing', 'Escalations / step rents', 'Percentage rent (retail)', 'Recurring-charge setup', 'Rent-roll management'] },
      { title: 'Recoveries / CAM Management', items: ['Operating-expense pooling', 'Recovery-method config (pro rata, base year, caps)', 'CAM estimates & monthly billing', 'Year-end CAM reconciliation', 'Tax & insurance recoveries'] },
      { title: 'Cash Collections & AR', items: ['Cash application', 'Tenant AR aging', 'Collections & dunning', 'Security deposits / LOC management', 'Dispute management'] },
      { title: 'Lessor Lease Accounting & Revenue Recognition', items: ['Lease classification (operating vs. finance)', 'Straight-line rent', 'ASC 842 / IFRS 16 lessor accounting', 'Revenue recognition', 'Deferred rent & incentives'] },
      { title: 'Renewals, Options & Lease Events', items: ['Renewals', 'Expansions / contractions', 'Assignments & subleases', 'Terminations & buyouts', 'Holdover management'] },
    ],
  },
  {
    id: 'vs-a2r', label: 'Acquire to Retire', icon: '🏢', tag: 'official', color: '#4a2a6a',
    note: 'Investment & asset lifecycle — sourcing through disposition.',
    groups: [
      { title: 'Investment Strategy & Sourcing', items: ['Investment thesis & strategy', 'Market analysis', 'Deal sourcing & pipeline', 'Preliminary screening'] },
      { title: 'Underwriting & Due Diligence', items: ['Financial underwriting / modeling', 'Valuation & appraisal', 'Physical / technical DD', 'Environmental DD', 'Legal & title DD', 'Tax-structuring DD'] },
      { title: 'Acquisition / Deal Execution', items: ['Offer & PSA negotiation', 'Investment-committee approval', 'Debt sourcing', 'Closing & funding', 'Capitalization'] },
      { title: 'Asset Onboarding & Capitalization', items: ['Asset-register setup', 'Cost segregation', 'Componentization', 'Depreciation setup', 'Transition management'] },
      { title: 'Ongoing Asset Management', items: ['Business-plan execution', 'Hold / sell analysis', 'Refinancing', 'Capital-event management', 'Impairment review'] },
      { title: 'Disposition / Retirement', items: ['Disposition strategy', 'Sale process & marketing', 'Buyer-DD support', 'Closing', 'Gain / loss & retirement accounting'] },
    ],
  },
  {
    id: 'vs-p2p-plan', label: 'Plan to Perform', icon: '📊', tag: 'official', color: '#2d4a0a',
    note: 'Portfolio planning & FP&A.',
    groups: [
      { title: 'Strategic & Portfolio Planning', items: ['Portfolio strategy', 'Capital allocation', 'Fund / vehicle planning', 'ESG strategy'] },
      { title: 'Budgeting & Forecasting', items: ['Property-level budgets', 'NOI forecasting', 'Reforecasting', 'Capital (capex) budgeting', 'Debt & equity planning'] },
      { title: 'Performance Management & Analytics', items: ['NOI / occupancy / WAULT analytics', 'Investor returns (IRR, equity multiple)', 'Variance analysis', 'Benchmarking', 'KPI & dashboard reporting'] },
    ],
  },
  {
    id: 'vs-s2p', label: 'Source to Pay', icon: '🛒', tag: 'official', color: '#1a3f6a',
    note: 'Property opex & capex procurement.',
    groups: [
      { title: 'Source to Contract (S2C)', items: ['Vendor sourcing', 'Category strategy (FM, utilities, construction)', 'Contract lifecycle management', 'Vendor onboarding & risk'] },
      { title: 'Procure to Pay (P2P)', items: ['Requisition / PO', 'Service procurement', 'Invoice capture & 3-way matching', 'Accounts payable', 'Payment', 'Vendor management'] },
      { title: 'Property Expense Management', items: ['Operating-expense management', 'Utility management', 'Property-tax management', 'Insurance procurement & management'] },
    ],
  },
  {
    id: 'vs-p2r', label: 'Project to Result', icon: '🏗️', tag: 'official', color: '#6a3a1a',
    note: 'Development, construction & capital projects.',
    groups: [
      { title: 'Development & Entitlements', items: ['Feasibility / highest-and-best-use', 'Site acquisition', 'Entitlements & zoning', 'Design management'] },
      { title: 'Capital Project & Construction Mgmt', items: ['Project setup & budgeting', 'Tenant-improvement (TI) management', 'Capex project management', 'Cost control & WIP', 'Draws & funding', 'Project accounting'] },
      { title: 'Project Close & Capitalization', items: ['Completion & handover', 'Capitalization', 'Warranty management', 'Project profitability analysis'] },
    ],
  },
  {
    id: 'vs-r2r', label: 'Record to Report', icon: '📒', tag: 'official', color: '#34495e',
    note: 'Property / fund / corporate accounting (incl. Transact to Record).',
    groups: [
      { title: 'Transaction Processing & Sub-ledgers (T2R)', items: ['GL postings', 'Sub-ledger integration (AR / AP / FA)'] },
      { title: 'Property & Fund Accounting', items: ['Property-level accounting', 'Fund / JV accounting', 'Waterfall & distribution calcs', 'Intercompany'] },
      { title: 'Close & Consolidation', items: ['Period close', 'Reconciliations', 'Consolidation & eliminations'] },
      { title: 'Financial, Regulatory & Investor Reporting', items: ['Statutory / GAAP / IFRS reporting', 'REIT compliance & testing', 'Investor reporting (NAV, capital accounts)', 'Management reporting', 'ESG reporting'] },
    ],
  },
  {
    id: 'vs-tdm', label: 'Treasury & Debt Management', icon: '💰', tag: 'official', color: '#7a5a10',
    note: 'Cash, debt & capital-markets management.',
    groups: [
      { title: 'Cash & Liquidity Management', items: ['Cash positioning', 'Bank-relationship management', 'Lockbox', 'Distributions & capital calls'] },
      { title: 'Debt & Capital Markets', items: ['Debt origination / refinancing', 'Covenant compliance & monitoring', 'Debt servicing', 'Capital-markets execution'] },
      { title: 'Risk & Hedging', items: ['Interest-rate hedging', 'FX (cross-border)', 'Insurance & risk financing'] },
    ],
  },
  {
    id: 'vs-pfo', label: 'Property & Facilities Operations', icon: '🛠️', tag: 'overlay', color: '#1a5a2a',
    note: 'The "operate" value stream — typically IWMS / property-management enabled.',
    groups: [
      { title: 'Property Management Operations', items: ['Tenant services & relations', 'Work-order / service-request management', 'Move-in / move-out', 'Tenant communications'] },
      { title: 'Facilities & Maintenance Management', items: ['Preventive maintenance', 'Reactive / corrective maintenance', 'Vendor / contractor coordination', 'Building-systems management'] },
      { title: 'Space & Occupancy Management', items: ['Space planning', 'Occupancy tracking', 'Stacking plans', 'Utilization analytics'] },
      { title: 'ESG & Sustainability Operations', items: ['Energy management', 'Emissions tracking', 'Certifications (LEED, BREEAM)', 'ESG data management'] },
    ],
  },
  {
    id: 'vs-h2r', label: 'Hire to Retire', icon: '👥', tag: 'official', color: '#5a3a5a', supporting: true,
    note: 'Supporting / enabling stream — include only if the operating-model scope covers the workforce.',
    groups: [
      { title: 'Workforce Lifecycle', items: ['Recruit', 'Onboard', 'Core HR', 'Payroll', 'Performance', 'Offboard'] },
    ],
  },
];
