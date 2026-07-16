// ═══════════════════════════════════════════════════════════════════════════
// Residential Management (RM) — Module Data
//
// Structured on the RM Module Taxonomy (§3 Functional Taxonomy): the taxonomy's
// 10 sub-domains, PLUS two operational columns retained from the prior model —
// "Maintenance & Property Operations" and "Vendor & Payables Management". The
// taxonomy scopes RM to the residential financial lifecycle; these two areas are
// real RM operations and are referenced by the value-stream link registry, so
// they are kept. Content is written business-first per the rules in CLAUDE.md.
//
// RM is the tenant-facing sub-ledger for RESIDENTIAL (multifamily) properties:
// prospects → application/screening → lease → RentUp billing → cash receipts →
// renewals → move-out/SODA. It posts journals to GL and closes before GL. RM
// shares its data model with Affordable Housing, Public Housing and Condo Mgmt.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI RM SME before client delivery.
//
// Source reference: MRI PMX Residential Management (RM) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const rm = [

  /* ── 1. PROPERTY, BUILDING & UNIT SETUP ──────────────────────────────────── */
  {
    id: 'rm-property',
    title: 'Property, Building & Unit Setup',
    processes: [
      {
        id: 'rm-property-setup',
        title: 'Property & Building Setup',
        type: 'process',
        desc: 'Establishing the residential property and its buildings — the top of the RM hierarchy that everything else attaches to. The Property Setup Assistant walks required steps (location, entity, billing) and the entity determines where journals are sent.',
        activities: [
          'Complete base property information via the Property Setup Assistant (location, entity, billing, charge-code exclusions)',
          'Set up RM buildings (at least one per property) that contain the leasable units',
          'Migrate any properties originally built in the MRI for Windows client to Web',
        ],
        mri_title: 'Property Setup (Setup and Maintenance > Residential Management > Property Setup)',
        mri_prereqs: [
          'GL entity established (the entity is where RM journals are sent)',
          'Charge codes planned so billing steps can be completed',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Residential Management > Property Setup', desc: 'Property Setup Assistant — required steps' },
        ],
        subs: [
          {
            id: 'rm-property-setup-base',
            title: 'Base Property Info',
            desc: 'The property record — location, entity and billing basics.',
            activities: [
              'Complete location, entity and billing steps',
              'Set charge-code exclusions',
            ],
            mri_title: 'Setup and Maintenance > Residential Management > Property Setup',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management > Property Setup', desc: 'Base property information' },
            ],
          },
          {
            id: 'rm-property-setup-buildings',
            title: 'RM Buildings',
            desc: 'The building structures within a property that hold units.',
            activities: [
              'Create at least one building per property',
              'Review the Building List report',
            ],
            mri_title: 'Setup and Maintenance > Residential Management > Property Setup',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management > Property Setup', desc: 'RM building setup' },
            ],
          },
        ],
      },
      {
        id: 'rm-property-units',
        title: 'Units, Types & Amenities',
        type: 'process',
        desc: 'Defining the dwellings themselves — unit types with default settings, the individual units and their status, and the amenities that drive charges. Units are the leasable inventory RM markets, leases and bills.',
        activities: [
          'Set up unit types (bedrooms, bathrooms, base rent) whose defaults apply when assigned',
          'Create units and track status (available, occupied, make-ready)',
          'Configure property and unit amenities; use Quick Rent Roll for rapid unit/rent setup',
        ],
        mri_title: 'Units & Amenities (Setup and Maintenance > Residential Management)',
        mri_prereqs: [
          'Buildings created before units can be added',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Residential Management > Property Setup', desc: 'Unit types, units and amenity setup' },
        ],
        subs: [
          {
            id: 'rm-property-units-types',
            title: 'Unit Types & Units',
            desc: 'Unit-type templates and the individual dwellings.',
            activities: [
              'Define unit types with default settings',
              'Create units and track status',
            ],
            mri_title: 'Setup and Maintenance > Residential Management',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management', desc: 'Unit type and unit setup' },
            ],
          },
          {
            id: 'rm-property-units-amenities',
            title: 'Amenities & Quick Rent Roll',
            desc: 'Property/unit amenities and rapid rent-roll setup.',
            activities: [
              'Configure property and unit amenities',
              'Use Quick Rent Roll during configuration',
            ],
            mri_title: 'Setup and Maintenance > Residential Management',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management', desc: 'Amenities and Quick Rent Roll' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 2. CHARGE CODES, SECURITY CODES & BILLING OPTIONS ───────────────────── */
  {
    id: 'rm-charges',
    title: 'Charge Codes, Security Codes & Billing Options',
    processes: [
      {
        id: 'rm-charges-codes',
        title: 'Charge & Security Codes',
        type: 'process',
        desc: 'The "buckets" that categorise every resident-ledger transaction (rent, pet rent, parking, utilities) and security deposits, and map each to the GL. These codes are the vocabulary of RM billing — they tell the system how to journalise income.',
        activities: [
          'Set up charge codes with description, late-fee eligibility, frequency, cash type and GL mapping',
          'Set up security codes for deposits (billing security creates a deposit receipt on the resident ledger)',
          'Configure charge-code groups and concession/prepayment code mappings; set rent tax groups',
        ],
        mri_title: 'Charge Code Setup (Setup and Maintenance > Residential Management > Charge Code Setup)',
        mri_prereqs: [
          'GL chart of accounts finalised so codes can be mapped',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Residential Management > Charge Code Setup', desc: 'Charge/security code setup and GL mapping' },
        ],
        subs: [
          {
            id: 'rm-charges-codes-charge',
            title: 'Charge Codes',
            desc: 'Income buckets for rent and recurring charges, mapped to GL.',
            activities: [
              'Define charge codes with frequency and late-fee eligibility',
              'Map each code to its GL account and cash type',
            ],
            mri_title: 'Setup and Maintenance > Residential Management > Charge Code Setup',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management > Charge Code Setup', desc: 'Charge code setup' },
            ],
          },
          {
            id: 'rm-charges-codes-security',
            title: 'Security Codes',
            desc: 'Deposit codes that create security receipts on the resident ledger.',
            activities: [
              'Set up security codes for deposits',
              'Map security codes to the deposit GL account',
            ],
            mri_title: 'Setup and Maintenance > Residential Management > Security Deposit Codes',
            mri_assoc: [
              { name: 'Setup and Maintenance > Residential Management', desc: 'Security code setup' },
            ],
          },
        ],
      },
      {
        id: 'rm-charges-billing',
        title: 'Billing Options & Event-Based Billing',
        type: 'process',
        desc: 'The property-level billing rules — frequency, mid-month billing, ePayments — and event-based billing that updates recurring charges when lease events occur. These control how and when residents are billed.',
        activities: [
          'Configure billing options (frequency, mid-month billing, direct debit/ePayments; block ePayments per lease where needed)',
          'Set up Event Based Billing (EBB) to update recurring charges on lease events',
        ],
        mri_title: 'Billing Options (Setup and Maintenance > Residential Management > Property Setup — Step 4)',
        mri_prereqs: [
          'Charge codes configured',
        ],
        mri_assoc: [
          { name: 'Setup and Maintenance > Residential Management > Property Setup', desc: 'Billing options and event-based billing' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. LEASING & PROSPECT MANAGEMENT ────────────────────────────────────── */
  {
    id: 'rm-leasing',
    title: 'Leasing & Prospect Management',
    processes: [
      {
        id: 'rm-leasing-prospects',
        title: 'Prospect Engagement & Guest Card Management',
        type: 'process',
        desc: 'Capturing and nurturing prospective residents from first enquiry — the top of the leasing funnel. Guest cards record what a prospect wants and the contact history that moves them toward an application.',
        activities: [
          'Capture guest cards (contact, unit preference, budget, move-in date) and maintain a phone log',
          'Track the leasing pipeline and marketing sources for traffic reporting',
        ],
        mri_title: 'Leasing — Prospects (Residential Management > Leasing)',
        mri_prereqs: [
          'Units and pricing available to offer prospects',
        ],
        mri_assoc: [
          { name: 'Residential Management > Leasing', desc: 'Guest card / prospect capture and pipeline' },
        ],
        subs: [],
      },
      {
        id: 'rm-leasing-application',
        title: 'Application Processing & Tenant Screening',
        type: 'process',
        desc: 'Turning a prospect into a qualified applicant — running screening/background checks and making an approve/deny decision, all within fair-housing rules. This is the risk-control gate before a lease is offered.',
        activities: [
          'Run credit and background checks via the integrated screening service against qualifying criteria',
          'Process the application (unit search, application fee) and record an approve/deny decision with rationale',
          'Place holds or add to the waitlist to reserve a unit during application',
        ],
        mri_title: 'Leasing — Application (Residential Management > Leasing)',
        mri_prereqs: [
          'Screening service integrated; qualifying criteria agreed',
        ],
        mri_assoc: [
          { name: 'Residential Management > Leasing', desc: 'Application, screening, holds and waitlist' },
        ],
        subs: [],
      },
      {
        id: 'rm-leasing-execution',
        title: 'Lease Execution & Move-In',
        type: 'process',
        desc: 'Converting an approved application into an active lease, signing it and moving the resident in. This is where the resident relationship and the recurring revenue formally begin.',
        activities: [
          'Create the lease (start/end, rent, concessions, deposits, amenity charges, rentable items) and collect move-in funds',
          'Sign the lease electronically via SecureSign (mobile/email/print)',
          'Confirm unit make-ready, complete the move-in inspection and issue keys/portal access',
        ],
        mri_title: 'Leasing — Leasing Process (Residential Management > Leasing)',
        mri_prereqs: [
          'Application approved; unit make-ready; pricing from the Global Pricing Worksheet',
        ],
        mri_assoc: [
          { name: 'Residential Management > Leasing', desc: 'Lease execution and move-in' },
          { name: 'Residential Management > Leasing > SecureSign', desc: 'E-signature for the lease' },
        ],
        subs: [
          {
            id: 'rm-leasing-execution-lease',
            title: 'Lease Execution & SecureSign',
            desc: 'Creating and e-signing the lease with its terms and move-in funds.',
            activities: [
              'Set lease terms, deposits and amenity charges',
              'Collect move-in funds and sign via SecureSign',
            ],
            mri_title: 'Residential Management > Leasing',
            mri_assoc: [
              { name: 'Residential Management > Leasing', desc: 'Lease execution and signing' },
            ],
          },
          {
            id: 'rm-leasing-execution-movein',
            title: 'Move-In & Make-Ready',
            desc: 'Confirming the unit is ready and moving the resident in.',
            activities: [
              'Confirm make-ready and complete the move-in inspection',
              'Issue keys and portal access',
            ],
            mri_title: 'Residential Management > Leasing',
            mri_assoc: [
              { name: 'Residential Management > Leasing', desc: 'Move-in and make-ready' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. RESIDENT LIFECYCLE MANAGEMENT ────────────────────────────────────── */
  {
    id: 'rm-residents',
    title: 'Resident Lifecycle Management',
    processes: [
      {
        id: 'rm-residents-admin',
        title: 'Resident Account Administration',
        type: 'process',
        desc: 'Maintaining the resident record and everyone associated with the lease across the tenancy — profiles, occupants, guarantors, vehicles and legal actions. This is the master record for the resident relationship.',
        activities: [
          'Maintain the resident profile (contacts, emergency contacts, alternate invoice address, communication preferences)',
          'Record occupants, guarantors and vehicle assignments',
          'Log notes/actions and track legal actions with resolution codes',
        ],
        mri_title: 'Manage Residents (Residential Management > Residents > Manage Residents)',
        mri_prereqs: [
          'Active lease and resident created at move-in',
        ],
        mri_assoc: [
          { name: 'Residential Management > Residents > Manage Residents', desc: 'Resident search, profile and lease tab' },
        ],
        subs: [
          {
            id: 'rm-residents-admin-profile',
            title: 'Profile & Occupants',
            desc: 'The resident profile plus occupants and guarantors.',
            activities: [
              'Maintain resident and emergency contacts',
              'Record occupants and guarantors',
            ],
            mri_title: 'Residential Management > Residents > Manage Residents',
            mri_assoc: [
              { name: 'Residential Management > Residents', desc: 'Resident profile and occupants' },
            ],
          },
          {
            id: 'rm-residents-admin-legal',
            title: 'Vehicles & Legal Actions',
            desc: 'Vehicle records and tracked legal actions.',
            activities: [
              'Record vehicles and parking assignment',
              'Track legal actions with resolution codes',
            ],
            mri_title: 'Residential Management > Residents',
            mri_assoc: [
              { name: 'Residential Management > Residents', desc: 'Vehicles and legal actions' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. LEASE AMENDMENTS & RENEWALS ──────────────────────────────────────── */
  {
    id: 'rm-renewals',
    title: 'Lease Amendments & Renewals',
    processes: [
      {
        id: 'rm-residents-renewal',
        title: 'Amendments, Step-Ups & Renewals',
        type: 'process',
        desc: 'Changing a lease mid-term and renewing it at expiry — rent adjustments, step-ups, concessions and the renewal worksheet run ~90 days ahead. Renewals protect occupancy and income continuity, and include rent-stabilisation regimes where they apply.',
        activities: [
          'Amend leases mid-term (rent adjustments, concession/deposit changes, rentable items, other fees)',
          'Create scheduled rent step-ups and manage committed step-ups',
          'Run the renewal worksheet ~90 days ahead, review/adjust/submit, and make renewal offers with flexible concessions (incl. DHCR/NYC rent stabilisation)',
        ],
        mri_title: 'Renewals (Residential Management > Residents > Renewals)',
        mri_prereqs: [
          'Active leases approaching renewal; renewal concession codes configured',
        ],
        mri_assoc: [
          { name: 'Residential Management > Residents > Renewals', desc: 'Renewal worksheet, offers and concessions' },
          { name: 'Residential Management > Residents > Amend Lease', desc: 'Mid-term lease amendments and step-ups' },
        ],
        subs: [
          {
            id: 'rm-residents-renewal-amend',
            title: 'Amendments & Step-Ups',
            desc: 'Mid-term lease changes and scheduled rent step-ups.',
            activities: [
              'Amend rent, concessions, deposits and fees',
              'Create and manage committed step-ups',
            ],
            mri_title: 'Residential Management > Residents > Amend Lease',
            mri_assoc: [
              { name: 'Residential Management > Residents', desc: 'Lease amendments and step-ups' },
            ],
          },
          {
            id: 'rm-residents-renewal-renew',
            title: 'Renewal Worksheet & Concessions',
            desc: 'The renewal worksheet, offers and renewal concessions.',
            activities: [
              'Run and review the renewal worksheet ~90 days ahead',
              'Make renewal offers with flexible concessions',
            ],
            mri_title: 'Residential Management > Residents > Renewals',
            mri_assoc: [
              { name: 'Residential Management > Residents > Renewals', desc: 'Renewal worksheet and offers' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 6. TRANSACTIONS & RECEIVABLES (AR PROCESSING) ───────────────────────── */
  {
    id: 'rm-ar',
    title: 'Transactions & Receivables',
    processes: [
      {
        id: 'rm-billing-receipts',
        title: 'Cash Receipts & Payments',
        type: 'process',
        desc: 'Recording resident payments and handling the exceptions — NSF, reversals and prepayments. Clean, prompt receipting keeps resident balances accurate and delinquency reporting meaningful.',
        activities: [
          'Record cash receipts / individual checks (check scanner supported)',
          'Handle NSF (non-sufficient funds) via NSF batch entry',
          'Process payment reversals and prepayments',
        ],
        mri_title: 'Receivables — Payments (Residential Management > Receivables)',
        mri_prereqs: [
          'Charges present on the resident ledger; cash types mapped',
        ],
        mri_assoc: [
          { name: 'Residential Management > Receivables', desc: 'Cash receipts, NSF and reversals' },
        ],
        subs: [
          {
            id: 'rm-billing-receipts-cash',
            title: 'Cash Receipts',
            desc: 'Recording resident payments, including scanned checks.',
            activities: [
              'Record individual receipts/checks',
              'Apply receipts to the resident ledger',
            ],
            mri_title: 'Residential Management > Receivables',
            mri_assoc: [
              { name: 'Residential Management > Receivables', desc: 'Cash receipt entry' },
            ],
          },
          {
            id: 'rm-billing-receipts-nsf',
            title: 'NSF, Reversals & Prepayments',
            desc: 'Handling bounced payments, reversals and advance payments.',
            activities: [
              'Process NSF batch entries',
              'Reverse payments and track prepayments',
            ],
            mri_title: 'Residential Management > Receivables',
            mri_assoc: [
              { name: 'Residential Management > Receivables', desc: 'NSF, reversals and prepayments' },
            ],
          },
        ],
      },
      {
        id: 'rm-billing-delinquency',
        title: 'Charges, Adjustments & Aged Delinquency',
        type: 'process',
        desc: 'The rest of resident-ledger activity — ad-hoc charges/credits, security adjustments, write-offs, and tracking who has and hasn\'t paid. Aged delinquency is the lens collections works from.',
        activities: [
          'Post ad-hoc charges and credits to the resident ledger',
          'Apply security adjustments (apply all/part of a deposit to open receivables; refund all/part) and process bad-debt write-offs',
          'Track aged delinquency to drive collections',
        ],
        mri_title: 'Receivables — Charges/Credits & Security (Residential Management > Receivables)',
        mri_prereqs: [
          'Resident ledgers active with balances',
        ],
        mri_assoc: [
          { name: 'Residential Management > Receivables', desc: 'Charges/credits, security adjustments and write-offs' },
        ],
        subs: [
          {
            id: 'rm-billing-delinquency-charges',
            title: 'Charges, Credits & Write-Offs',
            desc: 'Ad-hoc ledger activity and bad-debt write-offs.',
            activities: [
              'Post ad-hoc charges and credits',
              'Process bad-debt write-offs',
            ],
            mri_title: 'Residential Management > Receivables',
            mri_assoc: [
              { name: 'Residential Management > Receivables', desc: 'Charges, credits and write-offs' },
            ],
          },
          {
            id: 'rm-billing-delinquency-security',
            title: 'Security Adjustments & Aged Delinquency',
            desc: 'Applying/refunding deposits and monitoring delinquency.',
            activities: [
              'Apply or refund security deposits against receivables',
              'Track aged delinquency for collections',
            ],
            mri_title: 'Residential Management > Receivables > Security Adjustments',
            mri_assoc: [
              { name: 'Residential Management > Receivables', desc: 'Security adjustments and aged delinquency' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 7. RENTUP & MONTHLY PROCESSING ──────────────────────────────────────── */
  {
    id: 'rm-rentup',
    title: 'RentUp & Monthly Processing',
    processes: [
      {
        id: 'rm-billing-charges',
        title: 'RentUp — Recurring Charges',
        type: 'process',
        desc: 'The monthly RentUp that generates next month\'s recurring charges for every resident from their lease terms — RM\'s core revenue-producing run. Charges are determined in advance and posted to resident ledgers on update.',
        activities: [
          'Preview all residents/charges via the RM Rental Update List before committing',
          'Run RentUp in update mode to post recurring charges (utilities, pet rent, parking) to resident ledgers',
          'Enable Enhanced RentUp (required for accelerated rent in SODA) and reconcile charge-code/account mapping',
        ],
        mri_title: 'Create Next Month\'s Charges / RentUp (Residential Management > Create Next Month\'s Charges — WEB_RMRENTUP)',
        mri_prereqs: [
          'Leases with recurring charges configured; charge codes mapped to GL',
          'Prior period closed',
        ],
        mri_assoc: [
          { name: 'Residential Management > Create Next Month\'s Charges', desc: 'RentUp preview and update run' },
        ],
        subs: [
          {
            id: 'rm-billing-charges-run',
            title: 'RentUp Run',
            desc: 'Previewing and posting the monthly recurring charges.',
            activities: [
              'Preview the RM Rental Update List',
              'Run in update mode to post to resident ledgers',
            ],
            mri_title: 'Residential Management > Create Next Month\'s Charges',
            mri_assoc: [
              { name: 'Residential Management > Create Next Month\'s Charges', desc: 'RentUp execution' },
            ],
          },
          {
            id: 'rm-billing-charges-recon',
            title: 'Enhanced RentUp & Reconciliation',
            desc: 'Enhanced RentUp and charge/account-mapping reconciliation.',
            activities: [
              'Enable Enhanced RentUp where required',
              'Reconcile charge-code and account mapping',
            ],
            mri_title: 'Setup and Maintenance > Management Options > RM',
            mri_assoc: [
              { name: 'Setup and Maintenance > Management Options > RM', desc: 'Enhanced RentUp option' },
            ],
          },
        ],
      },
      {
        id: 'rm-close-period',
        title: 'Journal Creation & Period Close',
        type: 'process',
        desc: 'Journalising RM activity to the GL and closing the RM period, which must happen before the GL close. This is the control gate that confirms the month\'s residential activity is complete and posted.',
        activities: [
          'Create RM journal entries (WEB_RMCREAJE) to journalise charges, cash receipts and transactions to GL',
          'Set up and run the late fee worksheet (formulas assigned to properties)',
          'Close the RM period ahead of the GL close',
        ],
        mri_title: 'Monthly Activities (Residential Management > Monthly Activities)',
        mri_prereqs: [
          'RentUp run and receipts posted for the period',
        ],
        mri_assoc: [
          { name: 'Residential Management > Monthly Activities', desc: 'Create journals, late fees and period close' },
        ],
        subs: [
          {
            id: 'rm-close-period-journals',
            title: 'Create RM Journals',
            desc: 'Journalising RM charges, receipts and transactions to GL.',
            activities: [
              'Run Create RM Journal Entries',
              'Confirm journals reflect all activity',
            ],
            mri_title: 'Residential Management > Monthly Activities',
            mri_assoc: [
              { name: 'Residential Management > Monthly Activities', desc: 'RM journal creation' },
            ],
          },
          {
            id: 'rm-close-period-close',
            title: 'Late Fees & Close',
            desc: 'Late-fee processing and the RM period close.',
            activities: [
              'Run the late fee worksheet',
              'Close the RM period before GL',
            ],
            mri_title: 'Residential Management > Monthly Activities',
            mri_assoc: [
              { name: 'Residential Management > Monthly Activities', desc: 'Late fees and period close' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 8. SODA (STATEMENT OF DEPOSIT ACCOUNTING) ───────────────────────────── */
  {
    id: 'rm-soda',
    title: 'SODA (Statement of Deposit Accounting)',
    processes: [
      {
        id: 'rm-deposits-interest',
        title: 'Security Deposits & Interest',
        type: 'process',
        desc: 'Holding resident security deposits and calculating any interest due under state/regional law. Deposits are the resident\'s money held on account and are administered separately from income.',
        activities: [
          'Bill and receive security deposits via security codes',
          'Calculate security-deposit interest per state/regional law',
        ],
        mri_title: 'Security Deposits (Residential Management > Receivables / Setup)',
        mri_prereqs: [
          'Security codes configured and mapped to the deposit ledger',
        ],
        mri_assoc: [
          { name: 'Residential Management > Receivables', desc: 'Deposit receipt and interest' },
        ],
        subs: [],
      },
      {
        id: 'rm-residents-moveout',
        title: 'Move-Out & SODA Processing',
        type: 'process',
        desc: 'The move-out process that determines how much deposit a resident gets back — Statement of Deposit Accounting. It is legally time-boxed (often 30 days), follows a set step order, and sends refunds to AP on commit.',
        activities: [
          'Work the SODA steps in order: start → forwarding address → deposit interest → concession chargebacks → additional charges/credits → reconcile open items → print → commit',
          'Choose the SODA type (Preliminary/Open/Applicant/Final/Revised/Modified); a committed SODA needs a Revised SODA to change',
          'Handle broken leases via Accelerated Rent OR Bill Broken Lease Through Expiration (mutually exclusive); refunds flow to AP on commit',
        ],
        mri_title: 'Statement of Deposit (Residential Management > Residents > Statement of Deposit)',
        mri_prereqs: [
          'Set Account Numbers for AP Processing (Security + Rent Refund clearing accounts) — critical for AP refunds',
          'Enhanced RentUp enabled where accelerated rent is used',
        ],
        mri_assoc: [
          { name: 'Residential Management > Residents > Statement of Deposit', desc: 'SODA processing — steps, types, commit/revise' },
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'AP refund — vendor and invoice created for the resident on SODA commit' },
        ],
        subs: [
          {
            id: 'rm-residents-moveout-steps',
            title: 'SODA Steps & Types',
            desc: 'The ordered SODA workflow and the SODA type lifecycle.',
            activities: [
              'Work the SODA steps in the recommended order',
              'Manage SODA type (Open → Final; Revised to amend)',
            ],
            mri_title: 'Residential Management > Residents > Statement of Deposit',
            mri_assoc: [
              { name: 'Residential Management > Residents > Statement of Deposit', desc: 'SODA steps and types' },
            ],
          },
          {
            id: 'rm-residents-moveout-ap',
            title: 'Refunds & AP Integration',
            desc: 'Interest, broken-lease billing and the refund flow to AP.',
            activities: [
              'Calculate interest and handle broken-lease billing',
              'Send the refund to AP on commit (manual AP adjustment if revised)',
            ],
            mri_title: 'Residential Management > Residents > Statement of Deposit',
            mri_assoc: [
              { name: 'Accounts Payable > Invoice Entry Management', desc: 'AP refund vendor/invoice on SODA commit' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 9. INTEGRATIONS & RESIDENT SELF-SERVICE ─────────────────────────────── */
  {
    id: 'rm-integrations',
    title: 'Integrations & Resident Self-Service',
    processes: [
      {
        id: 'rm-integrations-payments',
        title: 'Resident Connect & Payments',
        type: 'process',
        desc: 'The resident-facing payment channels that let residents pay online and self-serve. Self-service reduces manual receipting and improves on-time payment.',
        activities: [
          'Enable Resident Connect for single and recurring online payments (incl. checking-account payments)',
          'Integrate RentPayment for online rent payment (mind the X.5→X.7 migration)',
          'Use the check scanner at cash-receipt entry and manage received payments',
        ],
        mri_title: 'Resident Connect / RentPayment (Residential Management integrations)',
        mri_prereqs: [
          'Payment integration provisioned; charge codes and cash types mapped',
        ],
        mri_assoc: [
          { name: 'Residential Management > Receivables', desc: 'Received-payment management from self-service channels' },
        ],
        subs: [],
      },
      {
        id: 'rm-integrations-docs',
        title: 'SecureSign, Forms & Screening',
        type: 'process',
        desc: 'The document and screening integrations that support leasing — e-signature, integrated lease forms and background checks. These streamline the leasing paperwork and compliance.',
        activities: [
          'Use SecureSign for e-signature of lease documents',
          'Use Bluemoon integrated lease forms (edits save in the form, not the MRI database)',
          'Integrate screening services (credit/background via the MITS API) and mobile/AI features (MRI On the Go / Ask Agora)',
        ],
        mri_title: 'SecureSign / Bluemoon / Screening (Residential Management integrations)',
        mri_prereqs: [
          'Integration accounts provisioned with the relevant providers',
        ],
        mri_assoc: [
          { name: 'Residential Management > Leasing', desc: 'SecureSign, Bluemoon forms and screening integrations' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 10. REPORTING, DASHBOARDS & ROLE PAGES ──────────────────────────────── */
  {
    id: 'rm-reporting',
    title: 'Reporting, Dashboards & Role Pages',
    processes: [
      {
        id: 'rm-close-reporting',
        title: 'Reporting, Dashboards & Role Pages',
        type: 'process',
        desc: 'The reporting and role-based views that give each team the picture they need — from aged delinquency and rent roll to SODA reports and configurable dashboards. This is where RM data becomes operational insight.',
        activities: [
          'Run key reports — Aged Delinquency, Rent Roll, Property List/Status, SODA (Detail/Summary), and state compliance (DHCR, Minnesota CRP)',
          'Use role pages (Regional/Property/Leasing/Service/Portfolio/Call Center) and dashboards for role-appropriate views',
          'Configure panels (fields, charts, graphs) on Summary, Lease and Resident Profile pages',
        ],
        mri_title: 'Reports & Role Pages (Residential Management > Reports / Role Pages)',
        mri_prereqs: [
          'Period activity posted and reconciled',
        ],
        mri_assoc: [
          { name: 'Residential Management > Reports', desc: 'Aged delinquency, rent roll, SODA and compliance reports' },
          { name: 'Residential Management > Role Pages', desc: 'Role-based dashboards and views' },
        ],
        subs: [
          {
            id: 'rm-close-reporting-reports',
            title: 'Key Reports',
            desc: 'The core RM reporting suite and compliance reports.',
            activities: [
              'Run aged delinquency, rent roll and SODA reports',
              'Produce state compliance reports (DHCR, CRP)',
            ],
            mri_title: 'Residential Management > Reports',
            mri_assoc: [
              { name: 'Residential Management > Reports', desc: 'RM reporting suite' },
            ],
          },
          {
            id: 'rm-close-reporting-roles',
            title: 'Role Pages & Dashboards',
            desc: 'Role-based pages, dashboards and configurable panels.',
            activities: [
              'Use role pages and dashboards per team',
              'Configure panels on key pages',
            ],
            mri_title: 'Residential Management > Role Pages',
            mri_assoc: [
              { name: 'Residential Management > Role Pages', desc: 'Role pages and dashboards' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 11. MAINTENANCE & PROPERTY OPERATIONS (operational; link-referenced) ── */
  {
    id: 'rm-maintenance',
    title: 'Maintenance & Property Operations',
    processes: [
      {
        id: 'rm-maintenance-requests',
        title: 'Service Request Management',
        type: 'process',
        desc: 'Capturing and resolving resident maintenance requests — the day-to-day operations that keep units habitable and residents satisfied. (Operational area beyond the RM financial taxonomy; retained as it maps to the Property Operations value stream.)',
        activities: [
          'Log resident service/maintenance requests with priority',
          'Assign and track work through to completion',
          'Keep residents informed of status',
        ],
        mri_title: 'Service Requests (Residential Management — operations)',
        mri_prereqs: [
          'Units and residents set up',
        ],
        mri_assoc: [
          { name: 'Residential Management > Residents', desc: 'Resident service-request logging and tracking' },
        ],
        subs: [],
      },
      {
        id: 'rm-maintenance-makeready',
        title: 'Unit Make-Ready & Turnover',
        type: 'process',
        desc: 'Turning a vacated unit around and getting it back to lease-ready — the turnover work that minimises vacancy loss between residents.',
        activities: [
          'Schedule and track make-ready work after move-out',
          'Confirm the unit is inspection-passed and lease-ready',
          'Update unit status so it can be re-marketed',
        ],
        mri_title: 'Make-Ready (Residential Management — operations)',
        mri_prereqs: [
          'Move-out recorded; unit status available for turnover',
        ],
        mri_assoc: [
          { name: 'Residential Management > Leasing', desc: 'Unit make-ready and status for re-marketing' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 12. VENDOR & PAYABLES MANAGEMENT (operational; link-referenced) ─────── */
  {
    id: 'rm-vendor',
    title: 'Vendor & Payables Management',
    processes: [
      {
        id: 'rm-vendor-onboarding',
        title: 'Vendor Onboarding & Maintenance',
        type: 'process',
        desc: 'Setting up and maintaining the vendors that service residential properties. (Property-level payables area; the vendor master itself lives in AP, so this maps closely to the AP module and the Source-to-Pay value stream.)',
        activities: [
          'Onboard vendors that service the property and capture their details',
          'Maintain vendor records for accurate payment and reporting',
        ],
        mri_title: 'Vendor Maintenance (Accounts Payable > Utilities > Vendor Maintenance, via RM > Payables)',
        mri_prereqs: [
          'AP configured — RM vendor/payables flow through AP',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Utilities > Vendor Maintenance', desc: 'Vendor setup used by RM payables' },
        ],
        subs: [],
      },
      {
        id: 'rm-vendor-invoices',
        title: 'Purchase Order & Invoice Processing',
        type: 'process',
        desc: 'Raising POs and processing supplier invoices for residential property costs, feeding the AP payment cycle.',
        activities: [
          'Raise purchase orders for property goods/services',
          'Process supplier invoices for payment through AP',
        ],
        mri_title: 'Invoice Entry (Accounts Payable > Invoice Entry Management, via RM > Payables)',
        mri_prereqs: [
          'Vendors onboarded; AP invoice processing configured',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Invoice Entry Management', desc: 'PO and invoice processing for RM property costs' },
        ],
        subs: [],
      },
      {
        id: 'rm-vendor-expense',
        title: 'Expense Approval & Control',
        type: 'process',
        desc: 'Approving property expenditure before payment — the control that ensures residential property spend is authorised.',
        activities: [
          'Route property invoices/POs through the approval workflow',
          'Approve, reject or modify pending expenditure within authority limits',
        ],
        mri_title: 'Expense Control (Accounts Payable > Expense Control, via RM > Payables)',
        mri_prereqs: [
          'Expense control and approval hierarchy configured in AP',
        ],
        mri_assoc: [
          { name: 'Accounts Payable > Expense Control', desc: 'Approval of RM property expenditure' },
        ],
        subs: [],
      },
    ],
  },

];
