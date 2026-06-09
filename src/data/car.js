// ═══════════════════════════════════════════════════════════════════════════
// Corporate Accounts Receivable (CAR) — Module Data
//
// ⚠️  PLACEHOLDER CONTENT — THIS FILE REQUIRES CONTENT REVIEW
// All process descriptions, activities, prerequisites, and MRI screen
// associations below are PLACEHOLDER text derived from the CAR taxonomy
// summary document (June 2026).  Each field that needs review is prefixed
// with [PLACEHOLDER] so it is visible in both the source and the UI.
//
// To complete this module:
//   1. Replace every [PLACEHOLDER] value with accurate, business-first content
//      following the content writing rules in CLAUDE.md.
//   2. Remove this warning block once all content has been reviewed and signed off.
//
// Source reference: MRI PMX CAR Module Taxonomy (Open Box Software, June 2026)
// ═══════════════════════════════════════════════════════════════════════════

const PH = '[PLACEHOLDER] '; // prefix applied to every unreviewed field value

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
        desc: PH + 'Creation and ongoing management of non-tenant accounts, including entity linking, contact details, and account configuration for businesses and individuals outside the standard landlord-tenant relationship.',
        activities: [
          PH + 'Create new non-tenant account records, capturing legal name, contact details, and entity association',
          PH + 'Link accounts to the correct entity (CAR is entity-based, not property-based)',
          PH + 'Maintain account data to ensure accuracy for billing and reporting purposes',
          PH + 'Inactivate accounts that are no longer in use following agreed review process',
        ],
        mri_title: PH + 'CAR > Account Maintenance',
        mri_prereqs: [
          PH + 'Entity setup complete in GL before creating CAR accounts',
          PH + 'Income/billing categories configured before raising charges',
          PH + 'GL Chart of Accounts finalised so billing categories can be mapped correctly',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Account Maintenance', desc: PH + 'Non-tenant account setup — legal name, contact details, entity linking, and account configuration' },
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Inquiry', desc: PH + 'Account inquiry and ledger views — review account activity, balances, and transaction history' },
        ],
        subs: [],
      },
      {
        id: 'car-acct-tracking',
        title: 'Account Tracking',
        type: 'process',
        desc: PH + 'Ongoing monitoring of non-tenant account balances, kept separate from tenant ledgers maintained in CM and RM. Provides visibility of outstanding corporate receivables at entity level.',
        activities: [
          PH + 'Monitor non-tenant account balances on a regular basis',
          PH + 'Review account activity to identify anomalies or unallocated items',
          PH + 'Distinguish CAR balances from CM/RM tenant ledger balances in reporting',
        ],
        mri_title: PH + 'CAR > Inquiry',
        mri_prereqs: [
          PH + 'Account Maintenance records created and active',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Inquiry', desc: PH + 'Real-time account balance and activity inquiry for non-tenant accounts' },
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Receivables', desc: PH + 'Outstanding balance views and receivable management across all non-tenant accounts' },
        ],
        subs: [],
      },
      {
        id: 'car-acct-recon',
        title: 'Account Reconciliation',
        type: 'process',
        desc: PH + 'Reconciliation of non-tenant account balances against source documentation to ensure the CAR sub-ledger agrees to the General Ledger and supporting records prior to period close.',
        activities: [
          PH + 'Reconcile CAR sub-ledger balances to GL control accounts at period end',
          PH + 'Investigate and resolve any discrepancies between the CAR ledger and source documents',
          PH + 'Confirm all postings for the period are complete before initiating CAR close',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Create Journal Entries',
        mri_prereqs: [
          PH + 'All batch transactions posted for the period',
          PH + 'Outstanding charges and receipts reviewed before reconciliation',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Reports > Open Status', desc: PH + 'Outstanding balance report used as a reconciliation tool to verify open items' },
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities', desc: PH + 'Period-end processing menu — journal creation and close sequence' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 2. CHARGES & CREDITS ────────────────────────────────────────────────── */
  {
    id: 'car-charges',
    title: 'Charges & Credits',
    processes: [
      {
        id: 'car-charges-categories',
        title: 'Income Category Setup',
        type: 'process',
        desc: PH + 'Configuration and maintenance of billing categories that link charges and credits raised in CAR to the correct GL Chart of Accounts codes. Categories must be established before any charges can be posted.',
        activities: [
          PH + 'Define billing categories aligned to the chart of accounts (e.g. service fees, management fees, ad-hoc charges)',
          PH + 'Map each income category to the relevant GL account code',
          PH + 'Review and update categories when chart of accounts changes are made',
        ],
        mri_title: PH + 'CAR > Income Categories',
        mri_prereqs: [
          PH + 'GL Chart of Accounts finalised and approved',
          PH + 'Entity setup complete with appropriate ledger codes',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Income Categories', desc: PH + 'Setup and maintenance of billing categories linked to GL — all CAR charges reference an income category' },
        ],
        subs: [],
      },
      {
        id: 'car-charges-onetime',
        title: 'One-Time Charges',
        type: 'process',
        desc: PH + 'Manual posting of ad-hoc charges to non-tenant accounts for invoicing purposes, where the charge does not form part of a recurring billing arrangement.',
        activities: [
          PH + 'Identify the non-tenant account and income category for the charge',
          PH + 'Post the charge to the account via batch entry or direct charge posting',
          PH + 'Obtain appropriate authorisation before posting high-value ad-hoc charges',
          PH + 'Assign department code where applicable',
        ],
        mri_title: PH + 'CAR > Batch Activities > Charges & Credits',
        mri_prereqs: [
          PH + 'Non-tenant account active in Account Maintenance',
          PH + 'Income category configured and mapped to GL',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: PH + 'Batch entry screen for posting charges and credits to non-tenant accounts' },
        ],
        subs: [],
      },
      {
        id: 'car-charges-credits',
        title: 'Credits & Charge Allocation',
        type: 'process',
        desc: PH + 'Processing of non-cash credits against outstanding charges, and allocation of charges across multiple entities or cost centres where required.',
        activities: [
          PH + 'Post non-cash credits to non-tenant accounts and apply against specific outstanding charges',
          PH + 'Allocate charges across multiple entities or cost centres where cost-sharing applies',
          PH + 'Assign department codes to transactions for management reporting purposes',
          PH + 'Review credit balances periodically to determine whether refund or application is appropriate',
        ],
        mri_title: PH + 'CAR > Batch Activities > Charges & Credits',
        mri_prereqs: [
          PH + 'Outstanding charge records exist on the account before credits are applied',
          PH + 'Department codes configured if department tracking is required',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: PH + 'Entry point for credits, charge adjustments, and department-assigned transactions' },
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Credit Applies', desc: PH + 'Apply credits to specific outstanding charge lines against a non-tenant account' },
        ],
        subs: [],
      },
      {
        id: 'car-charges-journals',
        title: 'Journal Entries for Corporate Receivables',
        type: 'process',
        desc: PH + 'Creation of journal entries for corporate receivable transactions, either automated as part of monthly processing or manually where adjustments are required outside the standard billing cycle.',
        activities: [
          PH + 'Review CAR activity requiring journal entry at period end',
          PH + 'Create manual journal entries where adjustments cannot be processed through standard billing',
          PH + 'Run automated journal creation as part of monthly close to post CAR activity to GL',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Create Journal Entries',
        mri_prereqs: [
          PH + 'All batch transactions reviewed and posted before journal creation',
          PH + 'GL period open and available to receive CAR postings',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities > Create Journal Entries', desc: PH + 'Month-end journal creation that posts all CAR activity to the General Ledger' },
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
        desc: PH + 'Processing and recording of incoming payments from non-tenant entities, regardless of payment method. Cash receipts are matched to the relevant account and allocated against outstanding charges.',
        activities: [
          PH + 'Identify and verify incoming payments from non-tenant debtors',
          PH + 'Record cash receipts against the correct non-tenant account',
          PH + 'Allocate receipts to specific outstanding charge lines where known',
          PH + 'Process bulk receipts via batch entry where multiple accounts are settled together',
        ],
        mri_title: PH + 'CAR > Batch Activities > Cash Receipts',
        mri_prereqs: [
          PH + 'Non-tenant account and outstanding charges exist before receipt can be applied',
          PH + 'Bank account configured in GL for receipt posting',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Cash Receipts', desc: PH + 'Primary screen for recording incoming payments — supports allocation to 10+ charge lines in a single batch' },
        ],
        subs: [
          {
            id: 'car-payments-receipts-prepay',
            title: 'Prepayments',
            desc: PH + 'Recording and managing advance payments from non-tenant debtors where the payment is received before the corresponding charge is raised. Prepayment balances are tracked separately from regular receipts.',
            activities: [
              PH + 'Record prepayments against the non-tenant account at time of receipt',
              PH + 'Track prepayment balances separately from standard payment allocations',
              PH + 'Apply prepayment balance against charges when they are subsequently raised',
            ],
            mri_title: PH + 'CAR > Batch Activities > Cash Receipts (Prepayment)',
            mri_prereqs: [
              PH + 'Account configured to accept prepayments',
            ],
            mri_assoc: [
              { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Cash Receipts', desc: PH + 'Prepayment entry — record advance payment and track separately for future charge application' },
            ],
          },
          {
            id: 'car-payments-receipts-nsf',
            title: 'NSF & Payment Reversals',
            desc: PH + 'Processing of non-sufficient funds (NSF) reversals for bounced payments, and standard payment reversals for correction of incorrectly posted receipts.',
            activities: [
              PH + 'Identify NSF notifications from banking and match to posted receipts',
              PH + 'Reverse the original receipt posting and reinstate the outstanding charge',
              PH + 'Process standard reversals for receipts posted to incorrect accounts or amounts',
              PH + 'Notify the non-tenant debtor and agree a plan for resubmission',
            ],
            mri_title: PH + 'CAR > Batch Activities > Cash Receipts (NSF / Reversal)',
            mri_prereqs: [
              PH + 'Original receipt posting must exist before a reversal can be processed',
            ],
            mri_assoc: [
              { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Cash Receipts', desc: PH + 'NSF and reversal processing — reinstate outstanding charges and record the failed payment event' },
            ],
          },
        ],
      },
      {
        id: 'car-payments-allocation',
        title: 'Payment Allocation & Credit Applies',
        type: 'process',
        desc: PH + 'Matching of cash receipts and credit balances against specific outstanding charge lines. Credit applies use the user-specified transaction date and maintain the department association of the original posting.',
        activities: [
          PH + 'Match received payments to specific open charge lines on the non-tenant account',
          PH + 'Apply credit balances as credit applies using the user-specified transaction date',
          PH + 'Ensure department association of the original posting is preserved during batch credit application',
          PH + 'Review unallocated payment balances periodically and resolve with the debtor',
        ],
        mri_title: PH + 'CAR > Batch Activities > Credit Applies',
        mri_prereqs: [
          PH + 'Cash receipt or credit balance must exist on the account before allocation',
          PH + 'Outstanding charge lines must be open and unmatched',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Credit Applies', desc: PH + 'Apply credits and cash receipts to specific outstanding charge lines — department association preserved from original posting' },
        ],
        subs: [],
      },
      {
        id: 'car-payments-methods',
        title: 'Payment Methods & Refunds',
        type: 'process',
        desc: PH + 'Management of supported payment methods for non-tenant debtors, and the authorised process for refunding credit balances where the debtor does not have future charges to absorb the credit.',
        activities: [
          PH + 'Confirm payment method with the non-tenant debtor (EFT, debit order, direct debit, etc.)',
          PH + 'Record payment method against the account for processing and remittance purposes',
          PH + 'Review credit balances and assess whether to apply to future charges or refund',
          PH + 'Obtain required authorisation before processing a refund to a non-tenant debtor',
        ],
        mri_title: PH + 'CAR > Account Maintenance (Payment Method)',
        mri_prereqs: [
          PH + 'Account active in Account Maintenance',
          PH + 'Authorisation policy for refunds agreed and documented',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Account Maintenance', desc: PH + 'Payment method recorded against non-tenant account — EFT, debit order, direct debit supported' },
        ],
        subs: [],
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
        desc: PH + 'Processing of CAR transactions — cash receipts, charges, and credits — via the batch entry workflow. Batches support high-volume entry including applying receipts to 10 or more charge lines in a single batch.',
        activities: [
          PH + 'Create a new batch and select the appropriate batch type (Cash Receipts, Charges & Credits, or Credit Applies)',
          PH + 'Enter transactions into the batch, assigning account, amount, income category, and department',
          PH + 'Stamp GL segment values on transactions where segmentation is enabled',
          PH + 'Balance and verify the batch before posting',
        ],
        mri_title: PH + 'CAR > Batch Activities > New Batch',
        mri_prereqs: [
          PH + 'Non-tenant accounts active in Account Maintenance',
          PH + 'Income categories configured and mapped to GL',
          PH + 'GL segmentation values defined if segment stamping is required',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Select Batch', desc: PH + 'Access existing batches or create new batch for Cash Receipts, Charges & Credits, or Credit Applies' },
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > New Batch', desc: PH + 'Create a new batch — select batch type then enter transaction lines with account, category, amount, and department' },
        ],
        subs: [],
      },
      {
        id: 'car-batch-posting',
        title: 'Batch Posting',
        type: 'process',
        desc: PH + 'Finalisation and posting of completed batches to update non-tenant account ledgers and submit the corresponding journal entries to the General Ledger.',
        activities: [
          PH + 'Review completed batch for accuracy and completeness before posting',
          PH + 'Post the batch to update the non-tenant account ledger and generate GL entries',
          PH + 'Confirm posted transactions appear correctly on the account inquiry screen',
          PH + 'Handle negative value prompts appropriately when negative payment amounts are entered',
        ],
        mri_title: PH + 'CAR > Batch Activities > Post Batch',
        mri_prereqs: [
          PH + 'Batch entry complete and balanced',
          PH + 'GL period open for the transaction date',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities', desc: PH + 'Batch posting updates account ledgers and generates GL journal entries — negative values trigger system prompts for confirmation' },
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
        title: 'VAT on Charges',
        type: 'process',
        desc: PH + 'Application of tax or VAT to corporate receivable charges where the transaction is taxable. VAT is calculated and posted to a separate VAT control account in GL. Note: VAT configuration is managed at entity and international setup levels, not within the CAR module itself.',
        activities: [
          PH + 'Identify which charge types are subject to VAT based on entity and international configuration',
          PH + 'Apply the correct VAT rate to taxable charges at point of entry',
          PH + 'Ensure VAT posts to the designated VAT control account in GL',
          PH + 'Distinguish between taxable and non-taxable charges when processing batches',
        ],
        mri_title: PH + 'CAR > Batch Activities > Charges & Credits (VAT)',
        mri_prereqs: [
          PH + 'VAT/tax configuration completed at Entity level (not within CAR)',
          PH + 'VAT control account set up in GL Chart of Accounts',
          PH + 'Tax charge codes defined for accurate billing and reporting',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities > Charges & Credits', desc: PH + 'VAT applied to charges at entry — tax amount posts separately to VAT control account in GL' },
        ],
        subs: [
          {
            id: 'car-vat-nontaxable',
            title: 'Non-Taxable Charges',
            desc: PH + 'Some charges or credits raised in CAR may be non-taxable (e.g. pass-through costs, internal resource transfers). These must be coded correctly to avoid incorrect VAT calculation and reporting.',
            activities: [
              PH + 'Identify charges that are exempt from VAT based on the nature of the transaction',
              PH + 'Select the correct non-taxable income category when posting the charge',
              PH + 'Review VAT reports to confirm non-taxable items are excluded from VAT control account postings',
            ],
            mri_title: PH + 'CAR > Income Categories (Non-Taxable)',
            mri_prereqs: [
              PH + 'Non-taxable income categories configured and clearly labelled',
            ],
            mri_assoc: [
              { name: PH + 'Application Menu > Corporate Accounts Receivable > Income Categories', desc: PH + 'Income category configuration — set taxable/non-taxable flag on each category to control VAT treatment' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 6. MONTHLY PROCESSING / PERIOD CLOSE ───────────────────────────────── */
  {
    id: 'car-close',
    title: 'Monthly Processing & Period Close',
    processes: [
      {
        id: 'car-close-statements',
        title: 'Print Statements',
        type: 'process',
        desc: PH + 'Generation and distribution of account statements for non-tenant debtors as part of the monthly processing cycle. Statements provide debtors with a summary of charges, payments, and outstanding balances for the period.',
        activities: [
          PH + 'Run the statement generation process for all active non-tenant accounts at period end',
          PH + 'Review statements before distribution to confirm accuracy of balances and transactions',
          PH + 'Distribute statements to non-tenant debtors via agreed method (email, post, or portal)',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Print Statements',
        mri_prereqs: [
          PH + 'All charges and receipts for the period posted before statements are generated',
          PH + 'Account contact details current in Account Maintenance for distribution',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities > Print Statements', desc: PH + 'Generate debtor statements for non-tenant accounts — review before distributing to debtors' },
        ],
        subs: [],
      },
      {
        id: 'car-close-journals',
        title: 'Create Journal Entries',
        type: 'process',
        desc: PH + 'Month-end journal creation that consolidates all CAR activity for the period and posts it to the General Ledger. This step must be completed before the CAR period can be closed.',
        activities: [
          PH + 'Confirm all batch transactions for the period are posted and no items are in progress',
          PH + 'Run the Create Journal Entries process to post CAR activity to GL',
          PH + 'Review the journal output and confirm postings agree to CAR account balances',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Create Journal Entries',
        mri_prereqs: [
          PH + 'All CAR batch transactions posted for the period',
          PH + 'GL period open for the relevant accounting period',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities > Create Journal Entries', desc: PH + 'Automated journal creation — consolidates all CAR postings and sends to GL for the period' },
        ],
        subs: [],
      },
      {
        id: 'car-close-period',
        title: 'Hard Close & Period Reconciliation',
        type: 'process',
        desc: PH + 'Final period reconciliation and hard close of the CAR sub-ledger. The CAR period must be closed before the GL period can be closed. Once hard-closed, no further postings to the closed period are permitted.',
        activities: [
          PH + 'Reconcile all CAR activity for the period against GL postings before closing',
          PH + 'Confirm journal entries have been created and posted to GL',
          PH + 'Obtain sign-off from Finance on period balances before initiating close',
          PH + 'Execute the hard close to lock the period against further postings',
          PH + 'Confirm CAR close is complete before proceeding with GL period close',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Close Period',
        mri_prereqs: [
          PH + 'All batch transactions posted and journal entries created for the period',
          PH + 'Period reconciliation reviewed and agreed',
          PH + 'AP and CM closes completed for the same period (CAR closes alongside these before GL)',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities > Close Period', desc: PH + 'Hard close — locks the CAR period against further postings; must be completed before GL close' },
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
        desc: PH + 'Reporting on outstanding balances across all non-tenant accounts. The Open Status report is the primary tool for monitoring the corporate receivables ledger and supports period-end reconciliation.',
        activities: [
          PH + 'Run the Open Status report at period end to identify all outstanding non-tenant balances',
          PH + 'Use the report to prioritise collection activity on overdue accounts',
          PH + 'Reconcile the Open Status report total against the GL CAR control account balance',
        ],
        mri_title: PH + 'CAR > Reports > Open Status',
        mri_prereqs: [
          PH + 'Charges and receipts posted for the period before running the report',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Reports > Open Status', desc: PH + 'Outstanding balance report across all non-tenant accounts — primary reconciliation and collection tool' },
        ],
        subs: [],
      },
      {
        id: 'car-reporting-aged',
        title: 'Aged Invoice List',
        type: 'process',
        desc: PH + 'Ageing analysis of outstanding receivables from non-tenant debtors. Provides a breakdown of overdue balances by ageing bucket to support collections management and provisioning decisions.',
        activities: [
          PH + 'Run the Aged Invoice List at period end or on demand for collections review',
          PH + 'Analyse balances by ageing bucket to identify accounts requiring escalation',
          PH + 'Use ageing data to support bad debt provisioning and write-off decisions',
        ],
        mri_title: PH + 'CAR > Reports > Aged Invoice List',
        mri_prereqs: [
          PH + 'Charges and receipts current before running ageing report',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Reports > Aged Invoice List', desc: PH + 'Ageing analysis of corporate receivables — breakdowns by bucket support collections and provisioning' },
        ],
        subs: [],
      },
      {
        id: 'car-reporting-compliance',
        title: 'Compliance & Management Reporting',
        type: 'process',
        desc: PH + 'Category-based compliance reporting and operational reports tailored to user roles (property managers, asset managers, finance teams). Provides management-level visibility of corporate receivable performance.',
        activities: [
          PH + 'Run compliance reports by income category to support management or regulatory requirements',
          PH + 'Generate operational reports aligned to user role and responsibility level',
          PH + 'Distribute reports to relevant stakeholders as part of the monthly reporting pack',
        ],
        mri_title: PH + 'CAR > Reports',
        mri_prereqs: [
          PH + 'Income categories and accounts configured to support meaningful report segmentation',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Reports', desc: PH + 'Full suite of CAR reports — Open Status, Aged Invoice List, Compliance, and operational reports by role' },
        ],
        subs: [],
      },
    ],
  },

  /* ── 8. INTEGRATION & SYSTEM IMPACT ─────────────────────────────────────── */
  {
    id: 'car-integration',
    title: 'Integration & System Impact',
    processes: [
      {
        id: 'car-integration-gl',
        title: 'GL Integration',
        type: 'process',
        desc: PH + 'All CAR transactions generate journal entries that post to the General Ledger. CAR operates as a sub-ledger to GL and must be closed before the GL period can be closed. Transactions are input by Entity, not by property or building.',
        activities: [
          PH + 'Ensure all CAR transactions are coded to the correct entity for GL posting',
          PH + 'Review GL postings from CAR as part of period-end reconciliation',
          PH + 'Close the CAR sub-ledger before initiating the GL period close',
          PH + 'Note: inter-entity accounting is NOT available in CAR — inter-entity transactions must use AP or CM/RM',
        ],
        mri_title: PH + 'CAR > Monthly Activities > Create Journal Entries',
        mri_prereqs: [
          PH + 'Entity and GL account structure configured before CAR transactions can post',
          PH + 'GL segmentation enabled at entity level if segment stamping on CAR batches is required',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Monthly Activities > Create Journal Entries', desc: PH + 'Journal entries from CAR post to GL — entity-based (not property-based); CAR must close before GL each period' },
        ],
        subs: [],
      },
      {
        id: 'car-integration-segmentation',
        title: 'GL Segmentation Support',
        type: 'process',
        desc: PH + 'When GL segmentation is enabled at entity level, segment values can be stamped on CAR batch transactions to support multi-dimensional financial reporting. Department association is maintained through batch processing.',
        activities: [
          PH + 'Confirm GL segmentation is enabled at entity level before stamping segment values on CAR transactions',
          PH + 'Assign segment values to batch transactions during entry where reporting requires segmentation',
          PH + 'Assign department codes to transactions; confirm batch processing maintains department association',
        ],
        mri_title: PH + 'CAR > Batch Activities (GL Segmentation)',
        mri_prereqs: [
          PH + 'GL segmentation structure defined and enabled at entity level',
          PH + 'Segment values configured before batch entry begins',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable > Batch Activities', desc: PH + 'GL segment values can be stamped on batch transactions when segmentation is enabled — department association preserved through batch close' },
        ],
        subs: [],
      },
      {
        id: 'car-integration-limitations',
        title: 'Key Limitations & Boundaries',
        type: 'process',
        desc: PH + 'Important boundaries of the CAR module that consultants and clients must understand before configuring or using it. Understanding these limitations prevents incorrect use of CAR for transactions that belong in CM, RM, or AP.',
        activities: [
          PH + 'Communicate to clients that inter-entity accounting is NOT available in CAR — direct inter-entity transactions to AP or CM/RM',
          PH + 'Confirm that CAR is for non-tenant entities only — tenant-related billing belongs in CM or RM',
          PH + 'Note that all CAR transactions are entity-based, not property/building-based',
          PH + 'Confirm CAR must close before GL each period alongside AP, CM, and other sub-ledgers',
          PH + 'Note that VAT configuration is managed at Entity and International levels, not within CAR',
        ],
        mri_title: PH + 'CAR — Module Scope & Limitations (No single screen)',
        mri_prereqs: [
          PH + 'Design decision required: confirm which receivables belong in CAR vs CM/RM before go-live',
        ],
        mri_assoc: [
          { name: PH + 'Application Menu > Corporate Accounts Receivable', desc: PH + 'CAR module home — non-tenant, entity-based only. Inter-entity accounting not supported. Closes before GL.' },
        ],
        subs: [],
      },
    ],
  },

];
