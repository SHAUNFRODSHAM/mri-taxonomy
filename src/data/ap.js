// ═══════════════════════════════════════════════════════════════════════════
// Accounts Payable (AP) — Module Data
//
// Structured on the AP Module Taxonomy (§3 Functional Taxonomy): 10 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// AP is the supplier-facing sub-ledger — money going OUT. It runs the full
// payables lifecycle (PO → vendor → invoice → approval → payment → bank rec),
// posts journals to GL, and must close BEFORE the GL period. MRI Vendor Pay
// (MVP, powered by AvidXchange) is an AP add-on for automated payments.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI AP SME before client delivery. Several core setup
// functions (AP Management Options, Tax Options, Expense Control) remain in the
// MRI for Windows client.
//
// Source reference: MRI PMX Accounts Payable (AP) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const ap = [

  /* ── 1. SETUP & CONFIGURATION ────────────────────────────────────────────── */
  {
    id: 'ap_setup',
    title: 'Setup & Configuration',
    processes: [
      {
        id: 'ap_setup_options',
        title: 'AP Management Options',
        type: 'process',
        desc: 'The module-wide switches that govern how AP journalises, defaults invoice behaviour and numbers documents. Set at implementation (in the MRI for Windows client), these shape how every invoice and payment behaves.',
        activities: [
          'Choose the journalising approach — Real-Time JE (AUTOJE) or run APCREAJE manually (VS/DP clients must use manual)',
          'Set the default JE detail level (detail vs summary) and whether cash-account JEs are summarised',
          'Set default invoice status (Hold, Information Only, Pay, Release) and default cash type; configure alternate numbering',
        ],
        mri_title: 'AP Management Options (MRI for Windows > MGNT-MRI > Accounts Payable Options)',
        mri_prereqs: [
          'GL entities and chart of accounts established',
          'Decision on Real-Time JE vs APCREAJE agreed (do not toggle later)',
        ],
        mri_assoc: [
          { name: 'MRI for Windows > MGNT-MRI > Accounts Payable Options', desc: 'Real-time JE, detail/summary JE, default status and numbering' },
        ],
        subs: [
          {
            id: 'ap_setup_options_je',
            title: 'Journalising & Detail Level',
            desc: 'How and at what level AP posts journals to GL.',
            activities: [
              'Set Real-Time JE (AUTOJE) or manual APCREAJE',
              'Set detail vs summary JE and cash summarisation',
            ],
            mri_title: 'MRI for Windows > MGNT-MRI > Accounts Payable Options',
            mri_assoc: [
              { name: 'MRI for Windows > MGNT-MRI > Accounts Payable Options', desc: 'Journalising options' },
            ],
          },
          {
            id: 'ap_setup_options_defaults',
            title: 'Invoice Defaults & Numbering',
            desc: 'Default invoice status/cash type and document numbering.',
            activities: [
              'Set default invoice status and cash type',
              'Configure alternate invoice/document numbering',
            ],
            mri_title: 'MRI for Windows > MGNT-MRI > Accounts Payable Options',
            mri_assoc: [
              { name: 'MRI for Windows > MGNT-MRI > Accounts Payable Options', desc: 'Invoice defaults and numbering' },
            ],
          },
        ],
      },
      {
        id: 'ap_setup_entity',
        title: 'Entity AP Setup',
        type: 'process',
        desc: 'The per-entity control accounts that tell AP where payables, inter-entity balances, retainage and withholding post. Correct entity setup is what lets AP journals land in the right GL accounts.',
        activities: [
          'Set the AP account (credited on invoice, debited on payment) and inter-entity account per entity',
          'Set the retainage account and vendor withholding account',
          'Choose the type of payable entry (agency vs regular) for the entity',
        ],
        mri_title: 'Entity AP Setup (Setup and Maintenance > General Ledger > Entities)',
        mri_prereqs: [
          'GL entities and chart of accounts in place',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > General Ledger > Entities', desc: 'AP, inter-entity, retainage and withholding account setup per entity' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. BANK SETUP ───────────────────────────────────────────────────────── */
  {
    id: 'ap_bank',
    title: 'Bank Setup',
    processes: [
      {
        id: 'ap_bank_setup',
        title: 'Bank & Check Setup',
        type: 'process',
        desc: 'Setting up the banks AP pays from and configuring check processing against them. Every payment draws from a bank, so accurate bank and check setup is a prerequisite to paying anyone.',
        activities: [
          'Set up each bank used for withdrawals/deposits with address, payer, account number and base currency',
          'Manage bank account status (active/inactive) to retain historical banks',
          'Configure check processing — printing setup, last check number (auto-sequenced per bank) and electronic signatures',
        ],
        mri_title: 'Banks (Setup and Maintenance > Accounts Payable > Banks)',
        mri_prereqs: [
          'Entities established; cash accounts available in GL',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Accounts Payable > Banks', desc: 'Bank details, status and check processing setup' },
        ],
        subs: [
          {
            id: 'ap_bank_setup_details',
            title: 'Bank Details & Status',
            desc: 'The bank record itself and its active/inactive status.',
            activities: [
              'Capture bank address, payer, account and currency',
              'Set active/inactive to retain historical banks',
            ],
            mri_title: 'Setup and Maintenance > Accounts Payable > Banks',
            mri_assoc: [
              { name: 'Setup and Maintenance > Accounts Payable > Banks', desc: 'Bank record maintenance' },
            ],
          },
          {
            id: 'ap_bank_setup_checks',
            title: 'Check Processing & Signatures',
            desc: 'Check printing configuration and electronic signatures.',
            activities: [
              'Configure check printing and last check number',
              'Set up electronic signatures on checks',
            ],
            mri_title: 'Setup and Maintenance > Accounts Payable > Banks',
            mri_assoc: [
              { name: 'Setup and Maintenance > Accounts Payable > Banks', desc: 'Check processing options' },
            ],
          },
        ],
      },
      {
        id: 'ap_bank_ach',
        title: 'ACH, Inter-Entity & Vendor Pay Banks',
        type: 'process',
        desc: 'Configuring the electronic-payment and cross-entity banking arrangements, plus the MRI Vendor Pay bank setup. These enable ACH runs, distributive/inter-entity processing and automated payments.',
        activities: [
          'Set up ACH bank records (one linked to multiple accounts) with routing for electronic payments',
          'Configure site and inter-entity/intercompany banking and auto check-clearing file formats',
          'Set up MRI Vendor Pay banks (Mark as Approved / Send to Vendor Pay / Send to Avid)',
        ],
        mri_title: 'Vendor Pay Banks (Setup and Maintenance > Accounts Payable > Vendor Pay Banks)',
        mri_prereqs: [
          'Bank records created; ACH routing details available from the bank',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Accounts Payable > Banks', desc: 'ACH and inter-entity banking' },
          { name: 'Setup and Maintenance > Accounts Payable > Vendor Pay Banks', desc: 'MRI Vendor Pay (MVP) bank setup' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. VENDOR MANAGEMENT ────────────────────────────────────────────────── */
  {
    id: 'ap_sup',
    title: 'Vendor Management',
    processes: [
      {
        id: 'ap_sup_main',
        title: 'Vendor Setup & Master Data',
        type: 'process',
        desc: 'Creating and maintaining the vendor records (the VEND table) that AP can pay — you can only pay a set-up vendor. The vendor record holds the banking, ACH, tax and address detail that drives every payment, so its accuracy is central to AP control.',
        activities: [
          'Create vendors with ID (alpha/numeric), name (required for checks and 1099) and general information — address, terms, type, check priority',
          'Capture ACH information (bank account type, encrypted transit/account number, pre-note, remittance email)',
          'Maintain alternate addresses (payment vs PO) and vendor attributes/types for classification and reporting',
        ],
        mri_title: 'Vendor Maintenance (Accounts Payable > Utilities > Vendor Maintenance)',
        mri_prereqs: [
          'Banks configured before vendor banking details are added',
          'Vendor ID convention agreed (avoid ACH-incompatible characters)',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Vendor (VEND) setup — general, ACH, addresses and attributes' },
        ],
        subs: [
          {
            id: 'ap_sup_main_general',
            title: 'Vendor ID & General Info',
            desc: 'The core vendor record — identity, address, terms and type.',
            activities: [
              'Set vendor ID and name (required for checks/1099)',
              'Capture address, discount terms, type and check priority',
            ],
            mri_title: 'Accounts Payable > Utilities > Vendor Maintenance',
            mri_assoc: [
              { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Vendor general information' },
            ],
          },
          {
            id: 'ap_sup_main_ach',
            title: 'ACH & Banking Details',
            desc: 'The (encrypted) banking details that enable electronic payment.',
            activities: [
              'Flag the vendor as ACH and capture bank details',
              'Run a pre-note and set the remittance email',
            ],
            mri_title: 'Accounts Payable > Utilities > Vendor Maintenance',
            mri_assoc: [
              { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Vendor ACH/banking (encrypted fields)' },
            ],
          },
          {
            id: 'ap_sup_main_addresses',
            title: 'Alternate Addresses & Attributes',
            desc: 'Separate payment/PO addresses and classification attributes.',
            activities: [
              'Maintain alternate payment vs PO addresses',
              'Set vendor attributes and types for reporting',
            ],
            mri_title: 'Accounts Payable > Utilities > Vendor Maintenance',
            mri_assoc: [
              { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Alternate addresses and attributes' },
            ],
          },
        ],
      },
      {
        id: 'ap_sup_compliance',
        title: 'Withholding, Certification & Special Vendors',
        type: 'process',
        desc: 'The compliance and edge-case aspects of vendor management — withholding/certification status, once-off and non-true vendors, and lifecycle controls. These keep AP compliant and the vendor master clean.',
        activities: [
          'Record withholding status and certification (UK CIS registration/subcontractor certificate, insurance expiry)',
          'Handle once-off/one-time vendors and non-true vendors (investors, entities, tenants, refunds, owner distributions)',
          'Manage active/inactive status, deletion/purge control and vendor-level early-payment discounts',
        ],
        mri_title: 'Vendor Maintenance (Accounts Payable > Utilities > Vendor Maintenance)',
        mri_prereqs: [
          'Withholding accounts configured per entity where CIS/withholding applies',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Withholding, certification and vendor lifecycle' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 4. PURCHASE ORDERS (PROCUREMENT) ────────────────────────────────────── */
  {
    id: 'ap_po',
    title: 'Purchase Orders (Procurement)',
    processes: [
      {
        id: 'ap_po_entry',
        title: 'PO Entry & Approval',
        type: 'process',
        desc: 'Raising purchase orders for goods and services and routing them for approval before commitment. POs are the front end of expense control — approving spend before it is incurred.',
        activities: [
          'Create purchase orders for goods/services, obtaining bids/RFQs from multiple vendors where needed',
          'Route POs for approval (Expense Control in Web; PUSR in Windows — POs entered in Windows cannot be approved in Web)',
          'Apply Held status so POs can be modified before approval; handle open-ended/emergency POs with retrospective documentation',
        ],
        mri_title: 'Purchase Orders (Accounts Payable > Purchase Orders)',
        mri_prereqs: [
          'Vendors set up; expense control configured for PO approval',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Purchase Orders', desc: 'PO entry, bids and held/emergency POs' },
          { name: 'Accounts Payable > Expense Control', desc: 'PO approval routing' },
        ],
        subs: [],
      },
      {
        id: 'ap_po_match',
        title: 'Receipting, Matching & Budget Control',
        type: 'process',
        desc: 'Confirming what was received, matching it to the invoice, and controlling commitments against budget. Two- and three-way matching is the core control that stops paying for goods not ordered or not received.',
        activities: [
          'Record receipt of items via goods received vouchers (GRV/receipting)',
          'Match PO to invoice (2-way / 3-way) before payment',
          'Track budget and commitments against POs (PBUD) and apply PO tax codes for partial invoicing',
        ],
        mri_title: 'Purchase Orders — Receipting & Matching (Accounts Payable > Purchase Orders)',
        mri_prereqs: [
          'POs raised and approved; budgets in place for commitment tracking',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Purchase Orders', desc: 'Receipting/GRV and invoice matching' },
        ],
        subs: [
          {
            id: 'ap_po_match_grv',
            title: 'Receipting / GRV',
            desc: 'Recording goods/services received against the PO.',
            activities: [
              'Record receipt via goods received vouchers',
              'Confirm quantities before matching',
            ],
            mri_title: 'Accounts Payable > Purchase Orders',
            mri_assoc: [
              { name: 'Accounts Payable > Purchase Orders', desc: 'Receipting / GRV' },
            ],
          },
          {
            id: 'ap_po_match_match',
            title: 'Matching & Budget Control',
            desc: 'Two/three-way matching and PO budget/commitment control.',
            activities: [
              'Match PO to invoice (2-way/3-way)',
              'Track commitments against budget (PBUD)',
            ],
            mri_title: 'Accounts Payable > Purchase Orders',
            mri_assoc: [
              { name: 'Accounts Payable > Purchase Orders', desc: 'Invoice matching and budget control' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. INVOICE ENTRY & PROCESSING ───────────────────────────────────────── */
  {
    id: 'ap_inv',
    title: 'Invoice Entry & Processing',
    processes: [
      {
        id: 'ap_inv_main',
        title: 'Invoice Entry & Coding',
        type: 'process',
        desc: 'Capturing supplier invoices and coding them to the right accounts, entities and periods. This is the heart of AP volume — where a bill becomes a payable the business can control and pay.',
        activities: [
          'Create invoices for goods/services with parent/detail line items, grouped into sessions that set the expense period (MMYY)',
          'Split line items across accounts/entities/properties and apply predefined allocations',
          'Handle applications for payment (progress/stage payments) and attach supporting documents; set invoice status (Ready to Pay, Hold, Information Only)',
        ],
        mri_title: 'Invoice Entry Management (Accounts Payable > Invoice Entry Management)',
        mri_prereqs: [
          'Vendors and banks set up; sessions/expense period defined',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'Invoice entry, sessions, splitting and attachments' },
        ],
        subs: [
          {
            id: 'ap_inv_main_entry',
            title: 'Basic Entry, Sessions & Period',
            desc: 'Core invoice capture and the session/expense-period framework.',
            activities: [
              'Enter invoices with parent/detail lines',
              'Group into sessions that set the expense period',
            ],
            mri_title: 'Accounts Payable > Invoice Entry Management',
            mri_assoc: [
              { name: 'Accounts Payable > Invoice Entry Management', desc: 'Invoice entry and sessions' },
            ],
          },
          {
            id: 'ap_inv_main_split',
            title: 'Splitting & Allocations',
            desc: 'Distributing invoice amounts across accounts, entities and properties.',
            activities: [
              'Split line items across accounts/entities/properties',
              'Apply predefined allocations',
            ],
            mri_title: 'Accounts Payable > Invoice Entry Management',
            mri_assoc: [
              { name: 'Accounts Payable > Invoice Entry Management', desc: 'Line-item splitting and allocations' },
            ],
          },
        ],
      },
      {
        id: 'ap_inv_import',
        title: 'Import, Proration & Status',
        type: 'process',
        desc: 'The bulk and housekeeping side of invoice processing — importing invoices at volume, prorating expense, and changing invoice status en masse. These keep high-volume AP efficient and controllable.',
        activities: [
          'Bulk-import AP invoices (reviewing the TB_AP_INVC_IMPORTLOG error log)',
          'Apply proration of expense where the management option is enabled',
          'Change invoice status in bulk by entity/project/session/vendor',
        ],
        mri_title: 'Invoice Import & Status (Accounts Payable > Invoice Entry Management)',
        mri_prereqs: [
          'Import file format prepared; proration option configured where used',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'Invoice import, proration and bulk status change' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 6. EXPENSE CONTROL ──────────────────────────────────────────────────── */
  {
    id: 'ap_commit',
    title: 'Expense Control',
    processes: [
      {
        id: 'ap_commit_main',
        title: 'Invoice & PO Approval',
        type: 'process',
        desc: 'The approval workflow that authorises spend before it is paid — routing POs and invoices through the right approvers by value and role. This is AP\'s primary financial control and a key segregation-of-duties point.',
        activities: [
          'Enable Expense Control (invoice authorisation required) and work the My Expense Approval Activities queue — approve, reject or modify',
          'Route approvals through multiple levels, creating the next pending approval for the next approver',
          'Apply delegation-of-authority (DOA) thresholds for value-based routing and manage web vs Windows approval and account funding',
        ],
        mri_title: 'Expense Control (Accounts Payable > Expense Control > My Expense Approval Activities)',
        mri_prereqs: [
          'Expense Control Processing option enabled (MGNT-MRI)',
          'Approval hierarchy and DOA thresholds agreed',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Expense Control > My Expense Approval Activities', desc: 'Approve/reject/modify pending POs and invoices' },
        ],
        subs: [
          {
            id: 'ap_commit_main_queue',
            title: 'Approval Queue',
            desc: 'Working the pending PO/invoice approval activities.',
            activities: [
              'Review pending POs and invoices',
              'Approve, reject or modify items',
            ],
            mri_title: 'Accounts Payable > Expense Control > My Expense Approval Activities',
            mri_assoc: [
              { name: 'Accounts Payable > Expense Control', desc: 'Approval activities queue' },
            ],
          },
          {
            id: 'ap_commit_main_routing',
            title: 'Routing & DOA',
            desc: 'Multi-level routing and delegation-of-authority thresholds.',
            activities: [
              'Route approvals through the required levels',
              'Apply value-based DOA thresholds',
            ],
            mri_title: 'Accounts Payable > Expense Control',
            mri_assoc: [
              { name: 'Accounts Payable > Expense Control', desc: 'Approval routing and DOA' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 7. PAYMENT PROCESSING ───────────────────────────────────────────────── */
  {
    id: 'ap_pay',
    title: 'Payment Processing',
    processes: [
      {
        id: 'ap_pay_main',
        title: 'Payment Selection & Checks',
        type: 'process',
        desc: 'Selecting which approved invoices to pay and producing the check run. This is the disbursement step — turning authorised payables into payments while keeping tight control over what goes out.',
        activities: [
          'Select invoices for payment via the Payment Preview report (by entity/vendor/date/bank/status), including Pay Immediate',
          'Process invoices into check batches by bank and print checks in priority order (last check number auto-sequenced)',
        ],
        mri_title: 'Check Processing (Accounts Payable > Check Processing)',
        mri_prereqs: [
          'Invoices approved and released for payment; banks and check setup complete',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Check Processing', desc: 'Select invoices, batch and print checks' },
        ],
        subs: [
          {
            id: 'ap_pay_main_select',
            title: 'Invoice Selection',
            desc: 'Choosing which invoices to pay via the Payment Preview.',
            activities: [
              'Select invoices by entity/vendor/date/bank/status',
              'Use Pay Immediate where required',
            ],
            mri_title: 'Accounts Payable > Check Processing',
            mri_assoc: [
              { name: 'Accounts Payable > Check Processing', desc: 'Payment selection / preview' },
            ],
          },
          {
            id: 'ap_pay_main_checks',
            title: 'Check Batch & Printing',
            desc: 'Processing and printing check batches by bank.',
            activities: [
              'Create check batches by bank',
              'Print checks in priority order',
            ],
            mri_title: 'Accounts Payable > Check Processing',
            mri_assoc: [
              { name: 'Accounts Payable > Check Processing', desc: 'Check batch processing and printing' },
            ],
          },
        ],
      },
      {
        id: 'ap_pay_electronic',
        title: 'ACH, Manual & Vendor Pay',
        type: 'process',
        desc: 'The non-check payment channels and payment corrections — ACH files, manual/wire/EFT payments, MRI Vendor Pay automation, and voiding/reissuing payments. These broaden how AP pays and how it fixes payment errors.',
        activities: [
          'Generate ACH files (a pre-note test run in update mode is required first) with remittance notifications',
          'Record manual/paid invoices for wire/EFT/credit-card payments (a check number is required regardless of method)',
          'Pay via MRI Vendor Pay (check/ACH/virtual card, positive-pay fraud mitigation); void, reissue and reprint payments as needed',
        ],
        mri_title: 'Check Processing — Electronic & Manual (Accounts Payable > Check Processing)',
        mri_prereqs: [
          'ACH banks set up and pre-note completed; MVP configured where used',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Check Processing', desc: 'ACH, manual payments, MVP, void & manage payments' },
        ],
        subs: [
          {
            id: 'ap_pay_electronic_ach',
            title: 'ACH & Manual Payments',
            desc: 'Electronic ACH runs and manually-recorded wire/EFT/card payments.',
            activities: [
              'Generate ACH files with remittance (pre-note first)',
              'Record manual payments with a check number',
            ],
            mri_title: 'Accounts Payable > Check Processing',
            mri_assoc: [
              { name: 'Accounts Payable > Check Processing', desc: 'ACH and manual payments' },
            ],
          },
          {
            id: 'ap_pay_electronic_void',
            title: 'MVP & Void/Manage',
            desc: 'MRI Vendor Pay automation and payment corrections.',
            activities: [
              'Pay via MRI Vendor Pay (check/ACH/virtual card)',
              'Void, reissue and reprint payments',
            ],
            mri_title: 'Accounts Payable > Check Processing',
            mri_assoc: [
              { name: 'Accounts Payable > Check Processing', desc: 'MVP and void/manage payments' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 8. TAX, VAT & WITHHOLDING ───────────────────────────────────────────── */
  {
    id: 'ap_tax',
    title: 'Tax, VAT & Withholding',
    processes: [
      {
        id: 'ap_tax_1099',
        title: '1099 Processing (US)',
        type: 'process',
        desc: 'US regulatory reporting of payments to vendors — producing 1099 forms for reportable spend. This is a statutory obligation for US operations, driven off the vendor and payment data AP already holds.',
        activities: [
          'Produce 1099-MISC / 1099-NEC forms for payments over the reporting threshold ($600)',
          'File on paper or electronically (IRS Pub 1220) with payer/state setup',
          'Run the 1099 Preview Listing and Worksheet Exception reports to validate before filing',
        ],
        mri_title: '1099 Processing (Accounts Payable > Utilities > 1099)',
        mri_prereqs: [
          'Vendor names and tax details complete; payer/state 1099 setup done',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities', desc: '1099 processing and reporting (US only)' },
        ],
        subs: [],
      },
      {
        id: 'ap_tax_vat',
        title: 'VAT & Withholding',
        type: 'process',
        desc: 'Non-US tax handling — VAT on payables and withholding deductions such as UK CIS. These ensure AP reclaims and withholds the right amounts and posts them to the correct control accounts.',
        activities: [
          'Set up VAT with reclaimable tax percentage and a VAT control account, and enable tax event processing',
          'Configure vendor withholding (e.g. UK CIS deductions for tax and National Insurance) with a withholding account per entity',
          'Maintain sales tax codes and tax accounts per entity; apply EMEA country packs (France, Germany, Italy) for e-invoicing/tax compliance',
        ],
        mri_title: 'Tax / VAT Setup (Accounts Payable > Setup and Maintenance; MGNT-MRI Tax Options)',
        mri_prereqs: [
          'VAT/withholding accounts established in GL; tax event processing enabled (MGNT-MRI)',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Accounts Payable', desc: 'VAT, sales tax and withholding setup' },
          { name: 'MRI for Windows > MGNT-MRI > AP Tax Options', desc: 'Tax event processing options' },
        ],
        subs: [
          {
            id: 'ap_tax_vat_vat',
            title: 'VAT Setup & Processing',
            desc: 'VAT configuration, reclaim and control-account posting.',
            activities: [
              'Set reclaimable VAT % and control account',
              'Enable tax event processing',
            ],
            mri_title: 'Setup and Maintenance > Accounts Payable',
            mri_assoc: [
              { name: 'Setup and Maintenance > Accounts Payable', desc: 'VAT setup' },
            ],
          },
          {
            id: 'ap_tax_vat_withholding',
            title: 'Withholding & Country Packs',
            desc: 'Vendor withholding (CIS) and EMEA country-pack compliance.',
            activities: [
              'Configure withholding (e.g. UK CIS) per entity',
              'Apply EMEA e-invoicing/tax country packs',
            ],
            mri_title: 'Setup and Maintenance > Accounts Payable',
            mri_assoc: [
              { name: 'Setup and Maintenance > Accounts Payable', desc: 'Withholding and country packs' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 9. RECURRING INVOICES & MONTHLY PROCESSING ──────────────────────────── */
  {
    id: 'ap_recon',
    title: 'Recurring Invoices & Monthly Processing',
    processes: [
      {
        id: 'ap_recon_recurring',
        title: 'Recurring Invoices & Journal Creation',
        type: 'process',
        desc: 'Automating regularly-scheduled payables and posting AP activity to the GL. Recurring invoices remove repetitive keying; journal creation is how AP feeds the ledger.',
        activities: [
          'Set up recurring invoice templates for regular payments (rent, retainers, service contracts)',
          'Run APCREAJE to create journals for AP invoices and payments and update GL (unless Real-Time JE is on)',
        ],
        mri_title: 'Recurring Invoices & APCREAJE (Accounts Payable > Utilities / Closing Procedures)',
        mri_prereqs: [
          'Vendors and expense accounts set up; JE approach configured',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities', desc: 'Recurring invoice templates' },
          { name: 'Accounts Payable > Closing Procedures', desc: 'Create journal entries (APCREAJE)' },
        ],
        subs: [],
      },
      {
        id: 'ap_recon_bank',
        title: 'Bank Reconciliation',
        type: 'process',
        desc: 'Reconciling the MRI bank to the real bank statement so cash is accurate and discrepancies or fraud are caught. This is a core month-end financial control.',
        activities: [
          'Match cash balances to the bank statement and identify discrepancies/fraud (require in-balance before commit where the option is set)',
          'Use the new bank reconciliation with auto check-clearing files, and make bank adjustments where needed',
          'Adopt Auto Bank Reconciliation (ABR) where available to automate the match',
        ],
        mri_title: 'Bank Reconciliation (Accounts Payable > Closing Procedures > Bank Reconciliations)',
        mri_prereqs: [
          'Payments processed; electronic clearing files available from the bank',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Closing Procedures > Bank Reconciliations', desc: 'Bank statement reconciliation and adjustments' },
        ],
        subs: [
          {
            id: 'ap_recon_bank_match',
            title: 'Statement Reconciliation',
            desc: 'Matching MRI cash to the bank statement.',
            activities: [
              'Match balances and identify discrepancies',
              'Use auto check-clearing files',
            ],
            mri_title: 'Accounts Payable > Closing Procedures > Bank Reconciliations',
            mri_assoc: [
              { name: 'Accounts Payable > Closing Procedures', desc: 'Bank statement reconciliation' },
            ],
          },
          {
            id: 'ap_recon_bank_adjust',
            title: 'Adjustments & ABR',
            desc: 'Bank adjustments and automated bank reconciliation.',
            activities: [
              'Make bank adjustments where needed',
              'Use Auto Bank Reconciliation where available',
            ],
            mri_title: 'Accounts Payable > Closing Procedures > Bank Reconciliations',
            mri_assoc: [
              { name: 'Accounts Payable > Closing Procedures', desc: 'Bank adjustments and ABR' },
            ],
          },
        ],
      },
      {
        id: 'ap_recon_period',
        title: 'GL Reconciliation & Period Close',
        type: 'process',
        desc: 'Reconciling the AP sub-ledger to the GL and closing the AP period — which must happen before the GL closes. This is the control gate confirming the month\'s payables are complete and agree to the ledger.',
        activities: [
          'Reconcile the AP sub-ledger to the GL control account',
          'Work the pre-closing questions, reports and corrections',
          'Close the AP period ahead of the GL close (with CM, CAR and other sub-ledgers)',
        ],
        mri_title: 'Closing Procedures (Accounts Payable > Closing Procedures)',
        mri_prereqs: [
          'All invoices and payments posted; journals created (APCREAJE) for the period',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Closing Procedures', desc: 'GL reconciliation and AP period close' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 10. INQUIRY, REPORTING & DATA MANAGEMENT ────────────────────────────── */
  {
    id: 'ap_reporting',
    title: 'Inquiry, Reporting & Data Management',
    processes: [
      {
        id: 'ap_reporting_inquiry',
        title: 'Vendor Inquiry & Data Management',
        type: 'process',
        desc: 'Looking into vendor account activity and managing AP data retention. Inquiry answers "what have we paid this supplier?"; purging keeps the vendor and invoice data controlled.',
        activities: [
          'Use Vendor Inquiry to view vendor account activity and history',
          'Purge vendors/invoices under the agreed data-retention controls',
        ],
        mri_title: 'Vendor Inquiry (Accounts Payable > Utilities > Vendor Inquiry)',
        mri_prereqs: [
          'Vendor and invoice activity posted',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities > Vendor Inquiry', desc: 'Vendor account activity inquiry' },
          { name: 'Accounts Payable > Utilities', desc: 'Data purge (retention control)' },
        ],
        subs: [],
      },
      {
        id: 'ap_reporting_reports',
        title: 'AP Reporting',
        type: 'process',
        desc: 'The reporting suite that gives finance and management visibility of payables, cash and supplier spend — from open payables through bank rec to statutory and B-BBEE supplier-spend reporting.',
        activities: [
          'Run vendor and payables reports — Vendor Listing, Open Status (incl. multi-currency), Current Period Listing',
          'Run cash and reconciliation reports — Bank Reconciliation and Cash Balance',
          'Produce ACH, 1099 and supplier-spend reporting (incl. B-BBEE spend, South Africa) and the combined CM+AP Client Statement',
        ],
        mri_title: 'Reports (Accounts Payable > Reports)',
        mri_prereqs: [
          'Period activity posted and reconciled',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Reports', desc: 'Vendor Listing, Open Status, Cash Balance, ACH and 1099 reports' },
        ],
        subs: [
          {
            id: 'ap_reporting_reports_payables',
            title: 'Payables & Cash Reports',
            desc: 'Open payables, vendor listing and cash/bank-rec reports.',
            activities: [
              'Run Vendor Listing and Open Status',
              'Run Bank Reconciliation and Cash Balance',
            ],
            mri_title: 'Accounts Payable > Reports',
            mri_assoc: [
              { name: 'Accounts Payable > Reports', desc: 'Payables and cash reporting' },
            ],
          },
          {
            id: 'ap_reporting_reports_spend',
            title: 'Statutory & Spend Reporting',
            desc: 'ACH/1099 and supplier-spend (B-BBEE) reporting.',
            activities: [
              'Produce ACH and 1099 reports',
              'Produce supplier-spend / B-BBEE reporting',
            ],
            mri_title: 'Accounts Payable > Reports',
            mri_assoc: [
              { name: 'Accounts Payable > Reports', desc: 'Statutory and supplier-spend reporting' },
            ],
          },
        ],
      },
    ],
  },

];
