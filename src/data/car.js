// ═══════════════════════════════════════════════════════════════════════════
// Corporate Accounts Receivable (CAR) — Module Data
//
// Structured on the CAR Module Taxonomy (§3 Functional Taxonomy): 8 sub-domains
// (columns) → process cards → sub-processes. Content is written business-first
// per the rules in CLAUDE.md.
//
// CAR tracks charges and collects payments from NON-TENANT entities (corporate
// clients, vendors, internal departments) — receivables outside the CM/RM
// landlord-tenant relationship. It is entity-based and posts journals to GL.
//
// NOTE: Content is AI-drafted from the taxonomy reference and should be
// validated by an MRI CAR SME before client delivery.
//
// Source reference: MRI PMX Corporate Accounts Receivable (CAR) Module Taxonomy
// (Open Box Software, June 2026).
// ═══════════════════════════════════════════════════════════════════════════

export const car = [

  /* ── 1. ACCOUNT MANAGEMENT ───────────────────────────────────────────────── */
  {
    id: 'car-acct',
    title: 'Account Management',
    processes: [
      {
        id: 'car-acct-setup',
        title: 'Account Setup & Maintenance',
        type: 'process',
        desc: 'Creating and maintaining the non-tenant accounts CAR bills — corporate clients, vendors, internal departments and other parties outside the lease structure. These accounts are the equivalent of the tenant record in CM, and everything CAR does hangs off them.',
        activities: [
          'Create non-tenant accounts with legal name, contact details and entity association',
          'Link each account to the correct GL entity (CAR is entity-based, not property-based)',
          'Maintain account data and inactivate accounts no longer in use',
        ],
        mri_title: 'Account Maintenance (Corporate Accounts Receivable > Account Maintenance)',
        mri_prereqs: [
          'GL entity structure established before creating CAR accounts',
          'Billing categories and GL Chart of Accounts available for mapping charges',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Account Maintenance', desc: 'Non-tenant account setup — name, contacts, entity linking' },
          { name: 'Corporate Accounts Receivable > Inquiry', desc: 'Account and ledger inquiry views' },
        ],
        subs: [
          {
            id: 'car-acct-setup-create',
            title: 'Create Account',
            desc: 'Setting up a new non-tenant account and linking it to its entity.',
            activities: [
              'Capture legal name, contacts and entity association',
              'Confirm the account is not a CM/RM tenant',
            ],
            mri_title: 'Corporate Accounts Receivable > Account Maintenance',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Account Maintenance', desc: 'New account creation' },
            ],
          },
          {
            id: 'car-acct-setup-maintain',
            title: 'Maintain & Inactivate',
            desc: 'Keeping account data current and retiring accounts no longer in use.',
            activities: [
              'Update contact and entity details as they change',
              'Inactivate accounts following the agreed review process',
            ],
            mri_title: 'Corporate Accounts Receivable > Account Maintenance',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Account Maintenance', desc: 'Account maintenance and inactivation' },
            ],
          },
        ],
      },
      {
        id: 'car-acct-tracking',
        title: 'Account Tracking',
        type: 'process',
        desc: 'Monitoring non-tenant account balances and activity, kept distinct from the tenant ledgers held in CM and RM. This gives finance a clear view of corporate receivables at entity level.',
        activities: [
          'Monitor non-tenant account balances and activity',
          'Distinguish CAR balances from CM/RM tenant ledger balances in reporting',
          'Identify unallocated items and anomalies for follow-up',
        ],
        mri_title: 'Inquiry (Corporate Accounts Receivable > Inquiry)',
        mri_prereqs: [
          'Active CAR accounts with posted transactions',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Inquiry', desc: 'Real-time balance and activity inquiry' },
          { name: 'Corporate Accounts Receivable > Receivables', desc: 'Outstanding-balance and receivable views' },
        ],
        subs: [],
      },
      {
        id: 'car-acct-recon',
        title: 'Account Reconciliation',
        type: 'process',
        desc: 'Reconciling non-tenant balances to source documentation so the CAR sub-ledger agrees to the GL before period close. This is the control that keeps corporate receivables trustworthy.',
        activities: [
          'Reconcile CAR sub-ledger balances to GL control accounts at period end',
          'Investigate and resolve discrepancies against source documents',
          'Confirm all postings are complete before initiating CAR close',
        ],
        mri_title: 'CAR Reconciliation (Corporate Accounts Receivable > Monthly Activities)',
        mri_prereqs: [
          'All batch transactions posted for the period',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Reports > Open Status', desc: 'Outstanding-balance report used as a reconciliation tool' },
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'Period-end journal and close sequence' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. CHARGES & CREDITS (DEBTORS) ──────────────────────────────────────── */
  {
    id: 'car-charges',
    title: 'Charges & Credits',
    processes: [
      {
        id: 'car-charges-categories',
        title: 'Income / Billing Categories',
        type: 'process',
        desc: 'The billing categories that classify each corporate charge or credit and link it to the GL Chart of Accounts. These are the vocabulary of CAR billing — service fees, management fees, ad-hoc charges and the like.',
        activities: [
          'Set up billing categories for the charge types the business raises',
          'Link each category to its GL account for correct posting',
        ],
        mri_title: 'Income Categories (Corporate Accounts Receivable > Income Categories)',
        mri_prereqs: [
          'GL Chart of Accounts finalised so categories can be mapped',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Income Categories', desc: 'Billing category setup and GL mapping' },
        ],
        subs: [],
      },
      {
        id: 'car-charges-onetime',
        title: 'One-Time Charges',
        type: 'process',
        desc: 'Posting ad-hoc charges to non-tenant accounts for invoicing — the primary way CAR raises corporate receivables.',
        activities: [
          'Post one-off charges to the relevant non-tenant account',
          'Assign the correct billing category and (where applicable) department',
        ],
        mri_title: 'Charges & Credits (Corporate Accounts Receivable > Batch Activities > Charges & Credits)',
        mri_prereqs: [
          'Billing categories configured and mapped to GL',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: 'Manual posting of ad-hoc charges' },
        ],
        subs: [],
      },
      {
        id: 'car-charges-credits',
        title: 'Credits & Charge Allocation',
        type: 'process',
        desc: 'Applying non-cash credits against outstanding charges and allocating charges across multiple entities or cost centres. This keeps corporate balances accurate and correctly attributed.',
        activities: [
          'Raise non-cash credits and apply them against outstanding charges',
          'Allocate charges across entities or cost centres where shared',
          'Maintain department association on allocated transactions',
        ],
        mri_title: 'Charges & Credits (Corporate Accounts Receivable > Batch Activities > Charges & Credits)',
        mri_prereqs: [
          'Charges posted against the account',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: 'Credit entry and charge allocation' },
        ],
        subs: [
          {
            id: 'car-charges-credits-credit',
            title: 'Credits',
            desc: 'Non-cash credits applied against outstanding corporate charges.',
            activities: [
              'Raise the credit against the account',
              'Apply it to the relevant open charge',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Credit entry' },
            ],
          },
          {
            id: 'car-charges-credits-allocation',
            title: 'Charge Allocation',
            desc: 'Splitting charges across multiple entities or cost centres.',
            activities: [
              'Allocate the charge across entities/cost centres',
              'Preserve department association on the split',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Charge allocation' },
            ],
          },
        ],
      },
      {
        id: 'car-charges-journals',
        title: 'Journal Entries',
        type: 'process',
        desc: 'Creating the journal entries that post corporate-receivable activity to the GL, whether generated by monthly processing or entered manually.',
        activities: [
          'Generate CAR-to-GL journal entries from posted activity',
          'Enter manual journals where required, with department association',
        ],
        mri_title: 'Create Journal Entries (Corporate Accounts Receivable > Monthly Activities > Create Journal Entries)',
        mri_prereqs: [
          'Charges, credits and receipts posted for the period',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'CAR-to-GL journal creation' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 3. PAYMENTS & RECEIPTS ──────────────────────────────────────────────── */
  {
    id: 'car-payments',
    title: 'Payments & Receipts',
    processes: [
      {
        id: 'car-payments-receipts',
        title: 'Cash Receipts',
        type: 'process',
        desc: 'Recording incoming payments from non-tenant entities, whatever the payment method. Prompt, accurate receipting keeps corporate balances current.',
        activities: [
          'Record incoming payments against the correct account',
          'Capture the payment method and reference',
        ],
        mri_title: 'Cash Receipts (Corporate Accounts Receivable > Batch Activities > Cash Receipts)',
        mri_prereqs: [
          'Non-tenant accounts with open charges',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities > Cash Receipts', desc: 'Non-tenant payment entry' },
        ],
        subs: [],
      },
      {
        id: 'car-payments-allocation',
        title: 'Payment Allocation & Credit Applies',
        type: 'process',
        desc: 'Matching received payments to the charges they settle, or holding them against the debtor account. Credit applies use a user-specified transaction date, and a single batch can apply a receipt across many charge lines.',
        activities: [
          'Match payments to specific open charges',
          'Apply credits against outstanding charges (credit applies)',
          'Allocate unmatched amounts to the debtor account',
        ],
        mri_title: 'Credit Applies (Corporate Accounts Receivable > Batch Activities > Credit Applies)',
        mri_prereqs: [
          'Receipts and open charges present on the account',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities > Credit Applies', desc: 'Payment allocation and credit applies' },
        ],
        subs: [],
      },
      {
        id: 'car-payments-methods',
        title: 'Payment Methods, Prepayments & Refunds',
        type: 'process',
        desc: 'The payment channels CAR accepts and the handling of advance payments, credit balances and reversals — including NSF reversals for bounced payments.',
        activities: [
          'Support EFT, debit order, direct debit and other payment methods',
          'Record prepayments and track balances separately from regular payments',
          'Apply credit balances to future charges or refund with authorisation; process NSF and payment reversals',
        ],
        mri_title: 'Batch Activities (Corporate Accounts Receivable > Batch Activities)',
        mri_prereqs: [
          'Payment channels and refund authorisation process agreed',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Payment methods, prepayments, refunds and reversals' },
        ],
        subs: [
          {
            id: 'car-payments-methods-prepay',
            title: 'Prepayments',
            desc: 'Recording advance payments and tracking them separately until due.',
            activities: [
              'Record the prepayment against the account',
              'Apply it when the related charge is raised',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities > Cash Receipts',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Prepayment handling' },
            ],
          },
          {
            id: 'car-payments-methods-refund',
            title: 'Refunds & Reversals',
            desc: 'Refunding credit balances and reversing erroneous or bounced (NSF) payments.',
            activities: [
              'Refund credit balances with authorisation',
              'Process NSF and standard payment reversals',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Refund and reversal processing' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. BATCH PROCESSING ─────────────────────────────────────────────────── */
  {
    id: 'car-batch',
    title: 'Batch Processing',
    processes: [
      {
        id: 'car-batch-entry',
        title: 'Batch Entry',
        type: 'process',
        desc: 'Entering cash receipts, charges and credits through controlled batches — the common entry point that gives a review point before anything reaches the ledger. A single batch can apply a receipt across ten or more charge lines.',
        activities: [
          'Enter receipts, charges and credits into a batch',
          'Apply receipts across multiple charge lines where needed',
          'Preserve department association when applying credits in a batch',
        ],
        mri_title: 'Batch Activities (Corporate Accounts Receivable > Batch Activities)',
        mri_prereqs: [
          'Billing categories and accounts configured',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Batch entry of receipts, charges and credits' },
        ],
        subs: [],
      },
      {
        id: 'car-batch-posting',
        title: 'Batch Posting',
        type: 'process',
        desc: 'Validating and posting completed batches so account ledgers and the GL are updated. This is the control step that commits batch activity.',
        activities: [
          'Review and validate the batch so totals agree',
          'Post the batch to update the account ledger and GL',
          'Stamp GL segment values where segmentation is enabled',
        ],
        mri_title: 'Batch Activities (Corporate Accounts Receivable > Batch Activities)',
        mri_prereqs: [
          'Transactions entered in an open batch',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Batch validation and posting' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 5. VAT & TAX ────────────────────────────────────────────────────────── */
  {
    id: 'car-vat',
    title: 'VAT & Tax',
    processes: [
      {
        id: 'car-vat-charges',
        title: 'VAT / Tax on Charges',
        type: 'process',
        desc: 'Applying VAT or tax to corporate receivable charges where due, recording it as a separate charge code and posting it to the VAT control account in GL. VAT configuration itself lives at entity/international level, not in CAR.',
        activities: [
          'Bill VAT/tax on charges where applicable, using a separate tax charge code',
          'Flag non-taxable charges and credits correctly',
          'Ensure VAT calculates and posts to the GL VAT control account',
        ],
        mri_title: 'Charges & Credits (Corporate Accounts Receivable > Batch Activities > Charges & Credits)',
        mri_prereqs: [
          'VAT/tax configured at entity and international setup levels',
          'Tax charge codes and VAT control account established in GL',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: 'Tax charge entry on corporate receivables' },
        ],
        subs: [
          {
            id: 'car-vat-charges-taxable',
            title: 'Taxable Charges',
            desc: 'Billing VAT/tax on chargeable items via a separate tax charge code.',
            activities: [
              'Apply the tax charge code to taxable charges',
              'Confirm VAT posts to the control account',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Taxable charge entry' },
            ],
          },
          {
            id: 'car-vat-charges-exempt',
            title: 'Non-Taxable Items',
            desc: 'Handling charges and credits that are exempt from VAT/tax.',
            activities: [
              'Flag charges/credits as non-taxable',
              'Verify they are excluded from VAT reporting',
            ],
            mri_title: 'Corporate Accounts Receivable > Batch Activities > Charges & Credits',
            mri_assoc: [
              { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Non-taxable item handling' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 6. MONTHLY PROCESSING & PERIOD CLOSE ────────────────────────────────── */
  {
    id: 'car-close',
    title: 'Monthly Processing & Period Close',
    processes: [
      {
        id: 'car-close-statements',
        title: 'Print Statements',
        type: 'process',
        desc: 'Producing statements for non-tenant accounts so debtors have a clear record of what they owe.',
        activities: [
          'Generate statements for the period',
          'Distribute statements to the relevant corporate accounts',
        ],
        mri_title: 'Print Statements (Corporate Accounts Receivable > Monthly Activities > Print Statements)',
        mri_prereqs: [
          'Charges and receipts posted for the period',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'Statement generation for non-tenant accounts' },
        ],
        subs: [],
      },
      {
        id: 'car-close-journals',
        title: 'Create Journal Entries',
        type: 'process',
        desc: 'The month-end journal creation that posts the period\'s CAR activity to the GL.',
        activities: [
          'Create the month-end CAR-to-GL journals',
          'Confirm journals reflect all posted activity',
        ],
        mri_title: 'Create Journal Entries (Corporate Accounts Receivable > Monthly Activities > Create Journal Entries)',
        mri_prereqs: [
          'All batches posted for the period',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'Month-end journal creation' },
        ],
        subs: [],
      },
      {
        id: 'car-close-period',
        title: 'Hard Close & Period Reconciliation',
        type: 'process',
        desc: 'Reconciling all CAR activity and hard-closing the period so no further postings are possible. CAR must close before the GL period can close.',
        activities: [
          'Reconcile all CAR activity for the period',
          'Run the hard close to prevent further postings',
          'Close CAR ahead of the GL close (with AP, CM and other sub-ledgers)',
        ],
        mri_title: 'Close Period (Corporate Accounts Receivable > Monthly Activities > Close Period)',
        mri_prereqs: [
          'Statements produced and journals created; reconciliation complete',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'Hard close and period reconciliation' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 7. REPORTING ────────────────────────────────────────────────────────── */
  {
    id: 'car-reporting',
    title: 'Reporting',
    processes: [
      {
        id: 'car-reporting-open',
        title: 'Open Status Report',
        type: 'process',
        desc: 'Reporting outstanding balances on non-tenant accounts — the primary view of what corporate debtors owe.',
        activities: [
          'Run the Open Status report for outstanding balances',
          'Use it as a reconciliation and collections tool',
        ],
        mri_title: 'Open Status (Corporate Accounts Receivable > Reports > Open Status)',
        mri_prereqs: [
          'Charges and receipts posted for the period',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Reports', desc: 'Open Status outstanding-balance report' },
        ],
        subs: [],
      },
      {
        id: 'car-reporting-aged',
        title: 'Aged Invoice List',
        type: 'process',
        desc: 'Ageing analysis of outstanding corporate receivables, showing how overdue each balance is to drive collections.',
        activities: [
          'Run the Aged Invoice List for the period',
          'Prioritise collections from the ageing buckets',
        ],
        mri_title: 'Aged Invoice List (Corporate Accounts Receivable > Reports > Aged Invoice List)',
        mri_prereqs: [
          'Charges and receipts posted and reconciled',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Reports', desc: 'Ageing analysis of outstanding receivables' },
        ],
        subs: [],
      },
      {
        id: 'car-reporting-compliance',
        title: 'Compliance & Management Reporting',
        type: 'process',
        desc: 'Category-based reporting for management and compliance, tailored to the audience — property managers, asset managers and finance teams.',
        activities: [
          'Run compliance reporting by category',
          'Produce operational and management reports tailored to role',
        ],
        mri_title: 'Reports (Corporate Accounts Receivable > Reports)',
        mri_prereqs: [
          'Period data posted and reconciled',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Reports', desc: 'Compliance and management reporting' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. INTEGRATION & SYSTEM IMPACT ──────────────────────────────────────── */
  {
    id: 'car-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'car-integration-gl',
        title: 'GL Integration',
        type: 'process',
        desc: 'The posting relationship between CAR and the General Ledger — CAR journals feed the GL, and the CAR period must close before the GL period.',
        activities: [
          'Post CAR journal entries to the GL',
          'Sequence the CAR close ahead of the GL close',
        ],
        mri_title: 'GL Integration (Corporate Accounts Receivable > Monthly Activities > Create Journal Entries)',
        mri_prereqs: [
          'GL entity structure and Chart of Accounts in place',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Monthly Activities', desc: 'CAR-to-GL journal posting' },
        ],
        subs: [],
      },
      {
        id: 'car-integration-segmentation',
        title: 'GL Segmentation Support',
        type: 'process',
        desc: 'Stamping GL segment values on CAR batch transactions where segmentation is enabled, giving richer GL analysis of corporate receivables.',
        activities: [
          'Enable segmentation on CAR batch entry',
          'Stamp segment values on batch transactions',
        ],
        mri_title: 'Batch Activities (Corporate Accounts Receivable > Batch Activities)',
        mri_prereqs: [
          'GL segmentation configured at entity level',
        ],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable > Batch Activities', desc: 'Segment values on batch transactions' },
        ],
        subs: [],
      },
      {
        id: 'car-integration-limitations',
        title: 'Key Limitations & Boundaries',
        type: 'process',
        desc: 'The boundaries that shape how CAR is used — no inter-entity accounting, entity-based (not property-based) input, and strictly non-tenant receivables (tenant billing belongs in CM/RM).',
        activities: [
          'Keep tenant-related billing in CM/RM, not CAR',
          'Use AP or CM/RM where inter-entity postings are required',
          'Note CAR is entity-based; some clients use it to shift internal resources between entities/departments',
        ],
        mri_title: 'CAR — scope and boundaries (reference)',
        mri_prereqs: [],
        mri_assoc: [
          { name: 'Corporate Accounts Receivable', desc: 'Module scope: non-tenant, entity-based receivables' },
        ],
        subs: [],
      },
    ],
  },

];
