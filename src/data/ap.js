export const ap = [

  /* ── 1. SUPPLIER MANAGEMENT ──────────────────────────────────────────────── */
  {
    id: 'ap_sup',
    title: 'Supplier Management',
    processes: [
      {
        id: 'ap_sup_main',
        title: 'Vendor Master Governance',
        type: 'process',
        desc: 'Establish and govern the authoritative record of every supplier the organisation pays — ensuring vendor data is accurate, properly authorised, and fit for purpose across onboarding, payment processing, tax reporting, and compliance obligations.',
        activities: [
          'Define and enforce the vendor onboarding policy: required data, approval authority, and activation controls',
          'Maintain vendor master records covering legal name, payment terms, bank details, and tax registration',
          'Conduct periodic vendor master reviews to identify inactive, duplicate, or erroneous records',
          'Apply data quality controls: single-person bank detail change controls, audit trail of all amendments',
          'Archive or inactivate vendors with no activity within the agreed review period',
        ],
        mri_title: 'AP > Setup > Vendors',
        mri_prereqs: [
          'Entity setup complete in GL with AP sub-tab configured',
          'Vendor type codes defined before creating vendor records',
          'Vendor attribute categories established for insurance, trade, and licence tracking',
          'AP ledger codes configured and assigned to entities',
        ],
        mri_assoc: [
          { name: 'AP > Setup > Vendors', desc: 'Vendor master record — legal name, address, tax ID, payment terms, default GL account, and bank details' },
          { name: 'AP > Setup > Vendor Types', desc: 'Classifies vendors by category (contractor, utility, professional services) — used for reporting and filtering' },
          { name: 'AP > Setup > Vendor Attributes', desc: 'Records insurance certificate expiry, trade licence numbers, and other compliance attributes against the vendor' },
          { name: 'AP > Setup > Vendor Priorities', desc: 'Sets payment priority ranking — used to sequence vendors when cash availability constrains the payment run' },
        ],
        subs: [
          {
            id: 'ap_sup_onboard',
            title: 'Vendor Onboarding & Due Diligence',
            desc: 'Manage the structured approval process for registering new suppliers — conducting due diligence checks and obtaining the required authorisation — before any invoices can be raised against the vendor.',
            activities: [
              'Receive and validate new supplier request: legal name, registration number, bank details, and tax ID',
              'Conduct financial and reputational due diligence appropriate to the spend value',
              'Screen against sanctions lists before activating the vendor record',
              'Obtain Finance Manager or Accounts Payable Manager approval before activating',
              'Create the vendor record in MRI and confirm the first invoice can be raised',
              'Issue the supplier with confirmation of registration and agreed payment terms',
            ],
            mri_title: 'AP > Setup > Vendors (Add New Vendor)',
            mri_prereqs: [
              'Vendor type codes and attribute categories configured before onboarding begins',
              'Approval workflow for new vendors defined and communicated',
              'Vendor set to inactive status until all due diligence is complete and approved',
            ],
            mri_assoc: [
              { name: 'AP > Setup > Vendors', desc: 'New vendor record entry — populate all required fields before activating: legal name, address, tax ID, bank details, and payment terms' },
              { name: 'AP > Setup > Vendors > Alternate Addresses', desc: 'Add alternate remittance addresses for vendors with multiple locations or different payment destinations' },
              { name: 'AP > Setup > Vendor Attributes', desc: 'Record insurance certificate expiry, trade licence, and compliance data at the point of onboarding' },
            ],
          },
          {
            id: 'ap_sup_maintenance',
            title: 'Vendor Master Maintenance',
            desc: 'Maintain the accuracy and completeness of all vendor master records on an ongoing basis — managing changes to bank details, payment terms, and contact information with appropriate authorisation controls to prevent fraud and ensure payment accuracy.',
            activities: [
              'Process bank detail change requests with dual authorisation and independent supplier confirmation',
              'Update payment terms following renegotiation with the supplier',
              'Maintain remittance email addresses, escalation contacts, and alternate payment addresses',
              'Manage supplier name changes, mergers, and entity restructures',
              'Run the duplicate vendor report quarterly and resolve any identified duplicates',
            ],
            mri_title: 'AP > Setup > Vendors (Modify Vendor)',
            mri_prereqs: [
              'Change authorisation process documented — bank detail changes must not be made by the same person who requested them',
              'Vendor change audit trail enabled to record all amendments with user identity and timestamp',
            ],
            mri_assoc: [
              { name: 'AP > Setup > Vendors', desc: 'Modify existing vendor record — payment terms, default GL account, status (active/inactive), and contact details' },
              { name: 'AP > Setup > Vendors > Alternate Addresses', desc: 'Update or add remittance addresses — used to route specific invoice payments to a different location' },
            ],
          },
          {
            id: 'ap_sup_statement',
            title: 'Supplier Statement Reconciliation',
            desc: 'Reconcile supplier account statements against the AP ledger balance in MRI — identifying timing differences, unregistered invoices, unapplied credits, or disputed items — and resolving discrepancies within the agreed timeframe.',
            activities: [
              'Request or receive supplier statements for all active vendors on a monthly or quarterly cycle',
              'Compare supplier statement balance to MRI AP ledger balance per vendor',
              'Identify reconciling items: unregistered invoices, unapplied credits, or disputed amounts',
              'Investigate and resolve discrepancies, registering any missing invoices and applying outstanding credits',
              'Obtain AP Manager sign-off on reconciliation for key or high-value vendors',
            ],
            mri_title: 'AP > Inquiries > Vendor Inquiry / AP > Reports > Open Invoice Listing',
            mri_prereqs: [
              'Posted AP transactions exist for the vendor and period being reconciled',
              'Vendor inquiry access configured for the AP team',
            ],
            mri_assoc: [
              { name: 'AP > Inquiries > Vendor Inquiry', desc: 'Displays full vendor transaction history — invoices, payments, and open balances — used as the AP side of the statement reconciliation' },
              { name: 'AP > Reports > Open Invoice Listing', desc: 'Lists all unpaid invoices by vendor — compared to the supplier\'s outstanding items on their statement' },
              { name: 'AP > Reports > Invoice Register', desc: 'Complete invoice register for the period — supports identification of items on the supplier statement not yet in MRI' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 2. INVOICE APPROVAL & EXPENDITURE CONTROL ───────────────────────────── */
  {
    id: 'ap_commit',
    title: 'Invoice Approval & Expenditure Control',
    processes: [
      {
        id: 'ap_commit_main',
        title: 'Invoice Approval & Hold Management',
        type: 'process',
        desc: 'Ensure all supplier invoices are reviewed and approved by the appropriate authority before payment — applying holds to disputed or unverified items and releasing only approved invoices into the payment run — to maintain financial control and prevent erroneous or unauthorised payments.',
        activities: [
          'Establish the delegation of authority matrix: who can approve invoices at each value threshold',
          'Route invoices to the appropriate budget holder or cost centre owner for approval',
          'Place invoices on hold where approval is pending, the invoice is disputed, or budget is exceeded',
          'Release approved invoices from hold status to make them eligible for payment selection',
          'Track and chase outstanding approvals to avoid late payment penalties',
          'Report on invoices on hold by age and approver to maintain AP processing velocity',
        ],
        mri_title: 'AP > Invoices > Change Invoice Payment Status',
        mri_prereqs: [
          'Invoice approval workflow defined with named approvers per entity and spend category',
          'Delegation of authority limits agreed and communicated',
          'Invoice hold reason codes configured',
        ],
        mri_assoc: [
          { name: 'AP > Invoices > Change Invoice Payment Status', desc: 'Places an invoice on hold (preventing payment selection) or releases it — used to manage approval status and dispute holds' },
          { name: 'AP > Invoices > Enter Invoice', desc: 'Invoice entry screen — invoices can be saved with a held status at entry pending approval' },
          { name: 'AP > Reports > Open Invoice Listing', desc: 'Lists all open (unpaid) invoices including held items — primary tool for monitoring approval backlog' },
        ],
        subs: [
          {
            id: 'ap_commit_alloc',
            title: 'Predefined Allocations & Cost Coding',
            desc: 'Define and apply predefined allocation templates that automatically split invoice costs across multiple GL accounts, departments, or entities — reducing manual coding effort, improving consistency, and ensuring expenditure is attributed correctly across the portfolio.',
            activities: [
              'Identify recurring invoice types that are consistently split across multiple cost centres',
              'Build predefined allocation templates with percentage splits by GL account and department',
              'Apply predefined allocations at invoice entry to auto-populate the cost distribution',
              'Review allocation distributions for accuracy before posting',
              'Maintain allocation templates when property ownership, entity structure, or GL accounts change',
            ],
            mri_title: 'AP > Setup > Predefined Allocations',
            mri_prereqs: [
              'Chart of accounts finalised before allocation templates are built',
              'Entity and department structure configured in GL',
              'Recurring invoice types identified and allocation percentages agreed with finance',
            ],
            mri_assoc: [
              { name: 'AP > Setup > Predefined Allocations', desc: 'Creates reusable cost split templates — percentage distributions across GL accounts, entities, and departments' },
              { name: 'AP > Invoices > Enter Invoice', desc: 'Predefined allocations are applied at invoice entry — the template populates all distribution lines automatically' },
            ],
          },
          {
            id: 'ap_commit_recurring',
            title: 'Recurring Invoice Management',
            desc: 'Set up and manage recurring invoice schedules for suppliers with regular periodic charges — such as maintenance contracts, utilities, and standing orders — ensuring invoices are generated consistently each period without manual re-entry.',
            activities: [
              'Identify suppliers whose invoices repeat on a predictable schedule with consistent amounts',
              'Create recurring invoice records with amount, GL coding, frequency, and expiry',
              'Generate recurring invoices each period and review before posting',
              'Amend recurring invoice templates when contract amounts change or agreements end',
              'Confirm recurring invoices appear in the payment run and are not duplicated',
            ],
            mri_title: 'AP > Invoices > Recurring Invoices',
            mri_prereqs: [
              'Vendor records active',
              'GL accounts for all recurring expense types defined',
              'Contract or agreement amounts confirmed before building the recurring template',
            ],
            mri_assoc: [
              { name: 'AP > Invoices > Recurring Invoices', desc: 'Template-based recurring invoice setup — defines vendor, amount, GL coding, and generation schedule' },
              { name: 'AP > Periodic > AP Closing > Recurring Invoices', desc: 'Generates the recurring invoice batch as part of the period-end AP closing process' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 3. INVOICE MANAGEMENT ───────────────────────────────────────────────── */
  {
    id: 'ap_inv',
    title: 'Invoice Management',
    processes: [
      {
        id: 'ap_inv_main',
        title: 'Invoice Registration & Coding',
        type: 'process',
        desc: 'Receive, validate, and register all supplier invoices in the AP ledger — ensuring invoices are correctly coded to the right entity, GL account, department, and period before they enter the approval and payment workflow.',
        activities: [
          'Receive invoices from suppliers (paper, email, or portal) and validate basic information: vendor, amount, GST/VAT, and invoice date',
          'Confirm the invoice relates to goods or services that have been received and approved',
          'Code the invoice to the correct entity, GL account, department, and accounting period',
          'Apply predefined allocation templates where the cost is split across multiple cost centres',
          'Enter the invoice in MRI, confirm distribution lines balance to the invoice total, and save',
          'Review posted invoices in the open invoice listing to confirm registration is complete',
        ],
        mri_title: 'AP > Invoices > Enter Invoice',
        mri_prereqs: [
          'Vendor record active in the system',
          'GL accounts for all expenditure categories defined in the chart of accounts',
          'Accounting period open for the invoice date',
          'Entity AP sub-tab configured with default AP ledger code',
        ],
        mri_assoc: [
          { name: 'AP > Invoices > Enter Invoice', desc: 'Primary invoice entry screen — header (vendor, entity, date, amount) and distribution lines (GL account, department, amount)' },
          { name: 'AP > Setup > Predefined Allocations', desc: 'Reusable cost split templates — applied at invoice entry to auto-populate multi-line GL distributions' },
          { name: 'AP > Reports > Invoice Register', desc: 'Complete register of all invoices entered in the period — used to confirm registration is complete and accurate' },
          { name: 'AP > Reports > Open Invoice Listing', desc: 'Lists all unpaid registered invoices — primary tool for monitoring what is in the AP pipeline awaiting payment' },
        ],
        subs: [
          {
            id: 'ap_inv_dispute',
            title: 'Invoice Exception & Dispute Resolution',
            desc: 'Manage invoices that cannot be processed in the normal workflow due to errors, missing PO references, pricing discrepancies, or receipt disputes — resolving exceptions promptly to avoid late payment penalties while protecting the organisation from paying for incorrect or unauthorised charges.',
            activities: [
              'Log the invoice exception with nature of dispute and responsible party for resolution',
              'Place the invoice on hold in MRI pending resolution',
              'Engage the budget holder, procurement team, or supplier to resolve the discrepancy',
              'Obtain a corrected invoice or credit note from the supplier where the original is incorrect',
              'Release the hold once the exception is resolved and the invoice is approved for payment',
              'Track exception volumes and resolution times to identify recurring supplier issues',
            ],
            mri_title: 'AP > Invoices > Change Invoice Payment Status',
            mri_prereqs: ['Invoice registered in the system', 'Hold status codes configured'],
            mri_assoc: [
              { name: 'AP > Invoices > Change Invoice Payment Status', desc: 'Places a hold on a registered invoice to prevent it entering the payment run until the dispute is resolved' },
              { name: 'AP > Inquiries > Vendor Inquiry', desc: 'Reviews the vendor\'s full invoice and payment history — used to investigate discrepancies and trace prior credits' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 4. SUPPLIER PAYMENT EXECUTION ──────────────────────────────────────── */
  {
    id: 'ap_pay',
    title: 'Supplier Payment Execution',
    processes: [
      {
        id: 'ap_pay_main',
        title: 'Payment Selection & Preparation',
        type: 'process',
        desc: 'Select approved invoices for payment, prepare the payment batch, and execute the payment run — ensuring suppliers are paid accurately, on time, and from the correct bank account in compliance with the organisation\'s payment controls.',
        activities: [
          'Review the open invoice listing and identify invoices due for payment in the current run',
          'Select invoices to pay by vendor, entity, due date, or manual selection',
          'Review the proposed payment batch for completeness and accuracy before generating checks or EFT files',
          'Obtain the required second-level authorisation before executing the payment run',
          'Generate and print checks or create the electronic payment file',
          'Post the payment batch to the AP ledger and confirm GL cash account entries are correct',
          'Distribute remittance advice to suppliers confirming payment details and invoice references',
        ],
        mri_title: 'AP > Payments > Manual Payment (Multiple) / Check Preparation',
        mri_prereqs: [
          'Invoices registered and approved (not on hold)',
          'Bank accounts configured with correct GL cash account mapping',
          'Check or EFT format configured for each bank account',
          'Payment authorisation controls agreed and user permissions set accordingly',
        ],
        mri_assoc: [
          { name: 'AP > Payments > Manual Payment (Multiple)', desc: 'Batch payment selection — choose invoices by vendor, entity, or due date criteria to build the payment run' },
          { name: 'AP > Payments > Manual Payment (Individual)', desc: 'Single-vendor payment — processes one vendor\'s selected invoices outside the standard batch cycle' },
          { name: 'AP > Payments > Check Preparation', desc: 'Prepares the check run — selects invoices, previews the check register, and prints checks from the configured format' },
          { name: 'AP > Payments > Preview Checks', desc: 'Review the check register before printing — last opportunity to remove invoices from the run without voiding' },
        ],
        subs: [
          {
            id: 'ap_pay_void',
            title: 'Check Voiding & Reissuance',
            desc: 'Manage the controlled voiding of issued checks — whether lost, stale, or incorrectly produced — and reissue replacement payments to suppliers, maintaining a complete and auditable payment record.',
            activities: [
              'Identify the need to void a check: lost in post, stale-dated, or incorrectly printed',
              'Obtain management authorisation before voiding',
              'Void the check in MRI to reverse the payment and reinstate the invoice as unpaid',
              'Confirm the AP ledger and GL cash account are updated correctly after voiding',
              'Reissue the replacement check or EFT payment to the supplier',
              'Notify the bank to stop payment on the original check where it may still be presented',
            ],
            mri_title: 'AP > Payments > Void Check',
            mri_prereqs: ['Original check posted and recorded in MRI', 'Void authorisation level defined'],
            mri_assoc: [
              { name: 'AP > Payments > Void Check', desc: 'Voids the selected check — reverses the payment entry and reinstates the invoice as open for re-payment' },
            ],
          },
        ],
      },
    ],
  },

  /* ── 5. RECONCILIATION & CONTROLS ───────────────────────────────────────── */
  {
    id: 'ap_recon',
    title: 'Reconciliation & Controls',
    processes: [
      {
        id: 'ap_recon_bank',
        title: 'Bank Reconciliation',
        type: 'process',
        desc: 'Reconcile the GL cash account balance to the bank statement balance each period — identifying outstanding checks, uncleared deposits, and bank errors — to confirm the organisation\'s actual cash position and detect fraudulent or erroneous transactions.',
        activities: [
          'Obtain the bank statement for each bank account at the period-end date',
          'Match checks issued in MRI against checks cleared on the bank statement',
          'Identify outstanding checks not yet cleared at the period-end date',
          'Record and investigate any bank charges, interest, or transactions not yet in MRI',
          'Post any bank-initiated entries not yet in MRI (bank fees, interest received)',
          'Confirm the reconciled GL balance agrees to the adjusted bank statement balance',
          'Obtain Finance Manager sign-off on the bank reconciliation before the period is closed',
        ],
        mri_title: 'AP > Periodic > Bank Reconciliation',
        mri_prereqs: [
          'Bank accounts configured in AP with correct GL cash account mapping',
          'All payments and receipts for the period posted to MRI before reconciliation begins',
          'Bank statement received for each account being reconciled',
        ],
        mri_assoc: [
          { name: 'AP > Periodic > Bank Reconciliation > Setup', desc: 'Configures bank reconciliation parameters — balance type, bank account, and starting balance for the period' },
          { name: 'AP > Periodic > Bank Reconciliation > Processing', desc: 'Main reconciliation screen — mark checks as cleared, enter bank-side adjustments, and view the running difference' },
          { name: 'AP > Periodic > Bank Reconciliation > Clear Automatically', desc: 'Imports bank statement data to auto-match and clear transactions — reduces manual matching effort' },
          { name: 'AP > Periodic > Bank Reconciliation > Summary', desc: 'Reconciliation summary report — shows GL balance, cleared items, outstanding items, and bank statement balance' },
          { name: 'AP > Periodic > Bank Reconciliation > GL Reconciliation', desc: 'Confirms the bank reconciliation ties to the GL cash account — final sign-off step' },
        ],
      },
      {
        id: 'ap_recon_period',
        title: 'AP Period Close & Sub-Ledger Reconciliation',
        type: 'process',
        desc: 'Close the AP accounting period to prevent further posting and ensure the AP sub-ledger reconciles to the GL creditors control account — producing a complete and auditable AP position for the period.',
        activities: [
          'Confirm all invoices and payments for the period are entered and posted',
          'Generate recurring invoices for the period as part of the AP close process',
          'Create and review the AP-to-GL journal entries for the period',
          'Reconcile the AP sub-ledger total to the GL creditors control account',
          'Resolve any variance between AP ledger and GL before closing the period',
          'Close the AP accounting period to lock it from further modification',
          'Distribute the period-end AP reports: aged creditor, open invoice listing, and YTD disbursements',
        ],
        mri_title: 'AP > Periodic > AP Closing',
        mri_prereqs: [
          'All invoices and payments for the period entered and posted',
          'Bank reconciliation completed and signed off',
          'GL period still open to receive AP journal entries',
        ],
        mri_assoc: [
          { name: 'AP > Periodic > AP Closing > Create Journal Entries', desc: 'Generates the AP-to-GL journal entries for the period — review distributions before posting to GL' },
          { name: 'AP > Periodic > AP Closing > Close Period', desc: 'Locks the AP accounting period from further modification — run after all invoices and payments are confirmed complete' },
          { name: 'AP > Periodic > AP Closing > Recurring Invoices', desc: 'Generates the period\'s recurring invoice batch as part of the AP close process' },
          { name: 'AP > Reports > Open Invoice Listing', desc: 'Lists all unpaid invoices — used to confirm period-end AP liability position before closing' },
          { name: 'AP > Inquiries > Vendor Inquiry', desc: 'Vendor-level balance and transaction inquiry — used to verify AP ledger balances in the reconciliation' },
        ],
      },
      {
        id: 'ap_recon_aged',
        title: 'Aged Creditor Review & Management',
        type: 'process',
        desc: 'Review and manage the aged creditor report to ensure supplier balances are current, long-outstanding items are investigated, and the AP position fairly reflects the organisation\'s genuine payment obligations.',
        activities: [
          'Run the aged creditor report at each period-end and review for anomalies',
          'Investigate items aged beyond the payment terms to identify disputes, missing credits, or processing errors',
          'Action old credit balances: confirm they are valid liabilities or return to the supplier',
          'Escalate long-outstanding invoices that have not been approved for payment',
          'Provide the aged creditor report to finance management as part of the period-end reporting pack',
        ],
        mri_title: 'AP > Reports > Open Invoice Listing / Vendor Inquiry',
        mri_prereqs: ['AP period closed or all transactions for the period posted'],
        mri_assoc: [
          { name: 'AP > Reports > Open Invoice Listing', desc: 'Primary aged creditor tool — lists all unpaid invoices with invoice date, due date, and ageing bucket' },
          { name: 'AP > Inquiries > Vendor Inquiry', desc: 'Drill into individual vendor balances — trace open items and payment history to resolve aged items' },
          { name: 'AP > Reports > YTD Vendor Disbursements', desc: 'Year-to-date payment summary by vendor — used for supplier spend analysis and payment pattern review' },
        ],
      },
    ],
  },

  /* ── 6. COMPLIANCE & STATUTORY REPORTING ────────────────────────────────── */
  {
    id: 'ap_compliance',
    title: 'Compliance & Statutory Reporting',
    processes: [
      {
        id: 'ap_compliance_main',
        title: '1099 & Withholding Tax Reporting',
        type: 'process',
        desc: 'Ensure all vendor payments subject to IRS 1099 reporting or withholding tax obligations are correctly classified in the system, accurately extracted at year-end, and submitted to the relevant tax authority within the statutory deadline.',
        activities: [
          'Confirm all vendors subject to 1099 reporting are correctly classified (vendor type, tax ID, 1099 code) in the vendor master',
          'Review 1099 amounts quarterly to catch misclassifications before year-end',
          'Run the year-end 1099 extract and review for completeness and accuracy',
          'Correct any vendor records with missing or incorrect TIN data before filing',
          'Submit 1099 forms to vendors and file with the IRS within the statutory deadline',
          'Manage B-Notices from the IRS relating to mismatched vendor TINs',
        ],
        mri_title: 'AP > Setup > Vendors (Tax Classification) / AP Reporting',
        mri_prereqs: [
          'Vendor records created with 1099 type and TIN populated for all reportable vendors',
          'Vendor type and tax classification configured to flag 1099-eligible payments',
          'All payments for the reporting year posted before the 1099 extract is run',
        ],
        mri_assoc: [
          { name: 'AP > Setup > Vendors', desc: 'Tax classification fields — 1099 code, TIN, and tax status — must be accurate before payments are posted to ensure correct 1099 capture' },
          { name: 'AP > Reports > YTD Vendor Disbursements', desc: 'Year-to-date payment totals by vendor — primary source data for 1099 amount verification before filing' },
          { name: 'AP > Reports > Communication Center', desc: 'Report generation and scheduling hub — used to produce and distribute compliance reports on a defined schedule' },
        ],
      },
      {
        id: 'ap_compliance_audit',
        title: 'AP Audit Trail & Control Reporting',
        type: 'process',
        desc: 'Maintain a complete, tamper-evident audit trail of all AP transactions — invoices, approvals, payments, and voids — and produce the control reports required for internal audit, external audit, and regulatory review.',
        activities: [
          'Confirm the AP system retains a complete change log: who entered, modified, or approved each transaction and when',
          'Produce the invoice register and payment register for audit evidence',
          'Run the YTD vendor disbursements report to support audit of significant supplier relationships',
          'Respond to internal and external audit queries by providing MRI transaction evidence',
          'Review user access controls periodically: confirm payment approval and vendor master change permissions are appropriate',
          'Schedule and distribute standard AP compliance reports through the Communication Center',
        ],
        mri_title: 'AP > Reports > Communication Center / Reporting Suite',
        mri_prereqs: [
          'User access roles defined with appropriate segregation of duties',
          'All AP transactions posted for the reporting period',
        ],
        mri_assoc: [
          { name: 'AP > Reports > Invoice Register', desc: 'Complete invoice register for the period — lists every invoice entered with vendor, amount, GL coding, and status' },
          { name: 'AP > Reports > YTD Vendor Disbursements', desc: 'Year-to-date payment summary by vendor — supports audit of significant or related-party supplier payments' },
          { name: 'AP > Reports > Open Invoice Listing', desc: 'Period-end open (unpaid) invoice listing — supports AP accrual and liability disclosure for audit' },
          { name: 'AP > Reports > Communication Center', desc: 'Centralised report generation, scheduling, and distribution hub — set up recurring compliance report packs for audit and management' },
        ],
        subs: [
          {
            id: 'ap_compliance_reporting',
            title: 'AP Reporting & Communication Center',
            desc: 'Produce, schedule, and distribute the standard AP reporting suite — vendor disbursements, aged creditor, open invoice, and period-end summary reports — through the MRI Communication Center to ensure stakeholders receive timely and accurate AP information.',
            activities: [
              'Access the Communication Center and select the relevant AP report',
              'Set report parameters: entity, period, vendor range, and output format',
              'Save report settings as a favourite for repeatable use',
              'Schedule recurring AP reports to run automatically after each period close',
              'Share reports with finance management, property managers, or auditors',
              'Export reports in PDF or Excel format for distribution outside the system',
            ],
            mri_title: 'AP > Reports > Communication Center',
            mri_prereqs: ['AP period closed or transactions posted for the reporting period', 'User access to Communication Center granted'],
            mri_assoc: [
              { name: 'AP > Reports > Communication Center', desc: 'Central hub for generating, scheduling, and distributing all AP reports — supports favourites, recurring schedules, and export' },
              { name: 'AP > Reports > YTD Vendor Disbursements', desc: 'Year-to-date payment totals by vendor — available through the Communication Center for scheduled distribution' },
              { name: 'AP > Reports > Open Invoice Listing', desc: 'Period-end open invoice report — scheduled for automatic distribution after each AP period close' },
            ],
          },
        ],
      },
    ],
  },
];
