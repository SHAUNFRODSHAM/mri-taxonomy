# Market Filter — Implementation Plan

**Status:** steps 1–3 built (filter, applicability tags, edit modals).
Steps 4–6 outstanding: the market notes in §6, and the export in §4 items 10–12.
**Scope:** make the Market filter (United Kingdom / United States / Pan-European) actually
filter content, and capture the market terminology differences as static notes on the
processes they belong to.

---

## 1. Problem

Three separate breaks, all confirmed in code:

1. **The filter never filters.** `businessView.js` filters cards on `matchesVerticals()`
   and `matchesCoverage()` only. There is no market predicate. `state.markets` is read in
   exactly one place — `showBusinessPanel()` — to choose which "Market Variation"
   paragraphs to print.
2. **There is nothing to filter on.** Every L3 card is seeded `market: null`
   (`business/index.js`). `valueStreams.js` — the only business data loaded — contains
   zero `market:` blocks. The 143 populated blocks are in `raw.js`, which is no longer
   loaded.
3. **The System (MRI PMX) view has no market filter at all** — only Scope. The whole
   `business-filterbar` is `display:none` outside business mode.

And the export misreports: `genModal.js` / `docxExport.js` print *"Markets: United Kingdom"*
on the cover while applying only the coverage and vertical filters. A UK client document
currently ships US content under a UK banner.

## 2. Approach

Two optional fields. No lexicon engine, no token substitution, no runtime string rewriting,
no per-market forks of the content.

| Field | Type | Purpose |
|---|---|---|
| `marketScope` | `['UK'\|'US'\|'EU']` | **Applicability.** Absent/empty = applies to every market. Drives the filter. |
| `market` | `{ UK, US, EU }` of strings | **Notes.** Terminology and regulatory differences, displayed for the selected markets only. Field already exists in the business schema and its edit modal. |

Named `marketScope` rather than `markets` to avoid three-way confusion with `state.markets`
(the filter selection) and `item.market` (the notes).

Why this stays maintainable:

- Additive and sparse — only ~8 items need a `marketScope`; the other 555 keep working untouched.
- Notes are plain prose living inline beside the content they annotate, in the same data file.
- One shared render component (mirrors the existing `clientNote.js` pattern), one predicate.
- Both fields sit on the item, so version snapshots, undo and export pick them up for free.
- Nothing to keep in sync: no dictionary that drifts from the prose, no regex that can
  corrupt an MRI navigation path.

### Hard constraint

`mri_title` and `mri_assoc[].name` are **never** localised. `CM > Recoveries > Service Charges`
is the literal MRI menu label — it reads the same on a US install. Market differences go in
notes *about* those screens, never in the paths themselves.

## 3. Filter semantics

```js
// src/data/markets.js  (new — MARKETS moves here from business/index.js)
export function matchesMarkets(item) {
  const scope = item.marketScope;
  if (!scope || !scope.length) return true;        // universal
  const sel = state.markets;
  if (!sel || !sel.length) return true;            // nothing selected → don't hide
  return scope.some(m => sel.includes(m));
}
```

Mirrors `matchesVerticals()` exactly, including the "nothing selected → show everything"
behaviour, so it composes with Scope, Coverage and Vertical without special cases.

**Subs inherit their parent's `marketScope`.** The grids gate the parent first, so an
out-of-market process takes its whole subtree with it. This is the opposite of the
"parent shows if any sub matches" rule used for scope and vertical, and it is deliberate:
without it, an out-of-market process stays visible whenever it has untagged (universal)
children — `car-vat-charges` has two, and leaked into the US view during implementation
until the rule was corrected. Inheritance also means a sub only needs its own tag when it
is *narrower* than its parent, which removes most of the tagging work.

Edit Mode continues to show everything so hidden items remain editable.

## 4. Code changes

| # | File | Change | Size |
|---|---|---|---|
| 1 | `src/data/markets.js` **(new)** | `MARKETS` (moved), `MARKET_KEYS`, `matchesMarkets()` | ~30 lines |
| 2 | `src/data/business/index.js` | re-export `MARKETS` from the new module (no breaking imports) | 2 lines |
| 3 | `src/components/marketNote.js` **(new)** | `marketNoteHTML(item)` — one `.psec` per selected market with content; renders nothing when empty. Modelled on `clientNote.js` | ~30 lines |
| 4 | `src/components/businessView.js` | add `matchesMarkets` to the process/sub filter (`:237`, `:239`, `:254`); replace the inline Market Variation block (`:447-456`) with `marketNoteHTML(item)` | ~10 lines |
| 5 | `src/components/grid.js` | add `matchesMarkets` alongside the scope filter | ~6 lines |
| 6 | `src/components/panel.js` | insert `marketNoteHTML(item)` after Core Activities, before MRI Module Reference | 2 lines |
| 7 | `src/main.js` | add a Market `makeMultiSelect` to the System filter bar next to Scope (`:804`) | ~6 lines |
| 8 | `src/components/editModal.js` | market applicability checkboxes + three note textareas; save into `marketScope` / `market` | ~35 lines |
| 9 | `src/components/businessEditModal.js` | add the applicability checkbox row (note textareas already exist at `:47`) | ~15 lines |
| 10 | `src/components/genModal.js` | add `matchesMarkets` to both `itemFilter`s (`:275`, `:403`); print market notes in the preview | ~8 lines |
| 11 | `src/components/docxExport.js` | market notes as an `obField` block per selected market, beside the Client note line (`:244`, `:454`) | ~10 lines |
| 12 | `src/styles/main.css` | reuse `.biz-market-block`; add a market key chip (Open Box palette, per brand guidelines) | ~15 lines |

No changes to `versions.js` or `state.js` — `state.markets` already exists and item fields
are already snapshotted wholesale.

### UI note

The Market dropdown in the System view reuses `makeMultiSelect` bound to the same
`state.markets`, so one selection governs both views and the export. Unlike `scopeFilters`,
market selection should **not** reset on tab switch (`main.js:194`) — market is a client
property, not a per-module one.

## 5. Applicability tags to set

Only where a process genuinely does not exist in a market. Everything else stays universal
and carries notes instead. Deliberately short — this list is the whole maintenance burden.

| Item | `marketScope` | Rationale |
|---|---|---|
| `ap_tax_1099` | `['US']` | Title already says "(US)"; a 1099 has no UK/EU analogue |
| `ap_tax_vat` | `['UK','EU']` | Description already reads "Non-US tax handling". Its two subs inherit this — no tag needed on them |
| `cm-recov-service-emea` | `['UK','EU']` | "EMEA Service-Charge Packs" — country-specific module. Tagged at sub level because its parent applies everywhere |
| `car-vat-charges` | `['UK','EU']` | VAT on charges; the US equivalent is sales & use tax, handled elsewhere. Its two subs inherit |
| `cm-cash-methods-lockbox` | `['US']` | Electronic Lockbox (CMEL) is a US bank construct — **confirm before tagging** |
| `rm-soda` items | *none* | Leave universal — SODA is the MRI statement name; UK/EU BTR clients still run move-out accounting. Notes cover the difference |

**Open question:** `ap_reporting_reports_spend` covers B-BBEE spend reporting (South Africa),
which none of the three markets represents. Either add a fourth market key (`ZA`) or leave
the item universal with a note. Recommend the note, and revisit if ZA becomes a delivery market.

## 6. Market notes content

The lexicon from the analysis, redistributed as `market: { US, UK, EU }` notes on the
original content. Each row below is a literal note set to add to that item in its data file.

### 6.1 Commercial Management — `src/data/cm.js`

**`cm-recov-setup` — Recovery Setup & Expense Pools**
- **US:** Called CAM (Common Area Maintenance). Pools are typically operating, tax,
  insurance and CAM; base-year and expense-stop structures are the office norm.
- **UK:** Called the service charge, governed by the RICS professional statement on service
  charges in commercial property. Costs are apportioned by schedule, and insurance rent is
  billed separately from the service charge rather than pooled into it.
- **EU:** Service charge — charges communes (FR), Nebenkosten (DE), spese condominiali (IT).
  What is recoverable is set by local statute and lease convention and differs by country,
  so pools are usually configured per country rather than per portfolio.

**`cm-recov-recon` — Estimates & Reconciliation**
- **US:** CAM reconciliation or true-up. Tenants commonly hold audit rights over the
  reconciliation statement, so supporting detail must be retrievable per pool.
- **UK:** Service charge year-end reconciliation, issued as a certified statement. The RICS
  professional statement expects certification within four months of the service charge
  year-end, which sets the close timetable.
- **EU:** Service charge settlement — Nebenkostenabrechnung (DE), régularisation des
  charges (FR). Statutory settlement deadlines apply in several countries.

**`cm-recov-service` — Direct & Regional Service Charges**
- **US:** Direct pass-through of metered costs; utility submetering and RUBS-style
  allocations are the common patterns.
- **UK:** Directly recharged metered supplies sit outside the apportioned service charge and
  are billed on consumption.
- **EU:** Country service-charge packs handle statutory regimes; direct metered recharge
  rules vary and are frequently prescribed by law.

**`cm-retail-percentage` — Percentage & Turnover Rent**
- **US:** Percentage rent, calculated over a natural or artificial breakpoint against
  tenant-certified sales.
- **UK:** Turnover rent — a percentage of certified gross turnover, usually on top of a base
  rent and reconciled annually against audited turnover certificates.
- **EU:** Turnover rent, common in shopping centres and often combined with an
  index-linked base rent.

**`cm-cpi-escalations` — CPI / RPI Escalations**
- **US:** Escalations or step rents — fixed annual steps, or CPI-U linked bumps with caps
  and floors.
- **UK:** Rent review — open-market (historically upward-only), RPI/CPI-linked, fixed
  uplift or turnover. Five-yearly open-market review remains the institutional norm.
- **EU:** Indexation — statutory or contractual index linkage (HICP, ILAT/ICC in France,
  VPI in Germany, ISTAT in Italy). Annual indexation is standard rather than periodic review.

**`cm-lease-admin-renewal` — Renewals & Rent Reviews**
- **US:** Renewal options and fixed-rate extensions; market-rate renewals negotiated afresh.
- **UK:** Rent review and lease renewal are distinct events. Business tenancies carry
  statutory renewal rights under the Landlord and Tenant Act 1954 unless contracted out.
- **EU:** Statutory renewal or tacit renewal rights vary widely — the 3/6/9 bail commercial
  in France, statutory notice regimes in Germany.

**`cm-billing-adv-sl` — Straight-Line Rent**
- **US:** ASC 842 (formerly FASB 13). Straight-lining of operating-lease income is required
  under US GAAP.
- **UK:** IFRS 16 for listed and adopting entities; FRS 102 Section 20 where the entity
  reports under UK GAAP.
- **EU:** IFRS 16 for consolidated reporting, but local GAAP may differ for statutory
  entity accounts — expect a dual-book requirement.

**`cm-building-suites-sqft` — Square Footage (BSQF)**
- **US:** Rentable and usable square feet measured to BOMA standards, with a load factor
  applied to derive rentable area.
- **UK:** Sq ft or m², NIA or IPMS 3, measured under the RICS property measurement standard.
- **EU:** m² under IPMS or local convention — surface utile (FR), Mietfläche per gif
  guideline (DE).

**`cm-building-accounting-method` — Accounting & Tax Setup**
- **US:** Real estate tax assessed locally, usually its own recovery pool.
- **UK:** Business rates assessed by the Valuation Office Agency. Empty-rates liability
  falls on the landlord for vacant units, so void periods carry a cost the model must hold.
- **EU:** Local property taxes — taxe foncière (FR), Grundsteuer (DE), IMU (IT).
  Recoverability from tenants varies by country.

**`cm-billing-recurring-freq` — Frequency, Advance/Arrears & Proration**
- **US:** Monthly in advance is the norm.
- **UK:** Quarterly in advance on the English quarter days (25 March, 24 June,
  29 September, 25 December) remains common in commercial leases alongside monthly.
- **EU:** Monthly or quarterly in advance by country convention; proration rules often
  statutory.

**`cm-income-special-freerent` — Free Rent & Concessions**
- **US:** Free rent and concessions; a TI allowance is treated as a lease incentive.
- **UK:** Rent-free period or inducement, typically amortised over the term to first break.
- **EU:** Rent-free period or incentive, often interacting with the indexation base.

**`cm-billing-adj-latefee` — Late Fees**
- **US:** Late fees and default interest per the lease; some states cap the rate.
- **UK:** Interest on late payment at the lease rate (commonly 4% over base). Where the
  lease is silent, the Late Payment of Commercial Debts (Interest) Act 1998 applies.
- **EU:** Late-payment interest under the EU Late Payment Directive as implemented locally.

**`cm-cash-methods-config` — Payment Methods**
- **US:** Check, ACH, wire and bank lockbox, with positive pay for fraud control.
- **UK:** BACS, Faster Payments and Direct Debit; cheques are residual. There is no lockbox
  equivalent — bank statement import is used instead.
- **EU:** SEPA Credit Transfer and SEPA Direct Debit (Core and B2B) with mandate management.

**`cm-deposits-interest-guarantee` — Bank Guarantees**
- **US:** Cash security deposit or letter of credit. Interest and segregation rules are set
  state by state.
- **UK:** Rent deposit deed, often held on trust, plus guarantor covenants. Commercial
  deposits sit outside the residential tenancy-deposit protection regime.
- **EU:** A bank guarantee is the norm — Bankgarantie/Kaution (DE, AT), garantie bancaire or
  dépôt de garantie (FR). Cash deposits are frequently required to be interest-bearing.

**`cm-lease-admin-vacate` — Vacates & Occupancy Status**
- **US:** Holdover, usually charged at 150–200% of base rent per the lease.
- **UK:** Holding over. Business tenancies carry statutory renewal rights under the
  Landlord and Tenant Act 1954 unless contracted out, so a vacate is not simply a
  date change.
- **EU:** Statutory and tacit renewal rights vary by country and can override the
  contractual expiry.

**`cm-billing-adv-fx` — Multi-Currency Billing**
- **US:** Single-currency (USD) portfolios are typical; multi-currency is needed only for
  cross-border owners.
- **UK:** GBP functional currency, with EUR leases in Ireland and cross-border portfolios.
- **EU:** Multi-currency is the default — EUR plus CHF, SEK, NOK, DKK, PLN — so FX
  revaluation and reporting-currency translation are in scope from day one.

### 6.2 Accounts Payable — `src/data/ap.js`

**`ap_tax_1099` — 1099 Processing** *(US-only item)*
- **US:** 1099-MISC and 1099-NEC. W-9 collection and TIN matching at onboarding, $600
  reporting threshold, plus state filing where applicable.

**`ap_tax_vat_vat` — VAT Setup & Processing** *(UK + EU item)*
- **UK:** VAT at 20% standard rate. Partial exemption is common for property, the option to
  tax drives recoverability, and filing is through Making Tax Digital.
- **EU:** VAT / TVA / MwSt / IVA / BTW at country rates, reverse charge on cross-border
  services, and e-invoicing mandates (FR, IT, DE, PL) handled by the country packs.

**`ap_tax_vat_withholding` — Withholding & Country Packs** *(UK + EU item)*
- **UK:** CIS (Construction Industry Scheme) — 20% or 30% deduction, subcontractor
  verification, monthly CIS300 return, and a withholding control account per entity.
- **EU:** Local withholding regimes — retenue à la source (FR), Bauabzugsteuer (DE) — each
  with its own certificates and periodic returns.

**`ap_bank_ach` — ACH, Inter-Entity & Vendor Pay Banks**
- **US:** ACH in NACHA format, check printing with signature files, positive pay and
  virtual card.
- **UK:** BACS on a three-day cycle plus Faster Payments, usually submitted through a
  service bureau. Cheque runs are residual.
- **EU:** SEPA Credit Transfer (pain.001) and SEPA Direct Debit. IBAN and BIC validation
  replaces routing-number logic.

**`ap_pay_electronic_ach` — ACH & Manual Payments**
- **US:** ACH runs with a pre-note test; wire and virtual card for exceptions.
- **UK:** BACS submission files and Faster Payments for same-day; the pre-note concept has
  no direct equivalent, so bank-detail validation happens at onboarding instead.
- **EU:** SEPA files per country bank; payment approval limits often set by local mandate rules.

**`ap_bank_setup_checks` — Check Processing & Signatures**
- **US:** Check runs are still a primary rail; MICR stock, signature files and positive pay
  all in scope.
- **UK:** Cheque volumes are minimal — configure the bank record but expect BACS to carry
  the volume.
- **EU:** Cheques are effectively obsolete in most countries; treat as an exception channel only.

**`ap_sup_main_general` — Vendor ID & General Info**
- **US:** Vendor. W-9 on file before first payment; TIN drives 1099 reporting.
- **UK:** Supplier. VAT registration number captured, plus CIS/UTR verification for
  construction trades.
- **EU:** Supplier. VAT ID validated against VIES where cross-border reverse charge applies.

**`ap_sup_compliance` — Withholding, Certification & Special Vendors**
- **US:** W-9 status, backup withholding at 24% where the TIN is missing or invalid, and
  certificate-of-insurance tracking.
- **UK:** CIS registration status and subcontractor certificate, gross-payment status
  verification, and insurance expiry tracking.
- **EU:** Country-specific withholding certificates and social-security clearance
  documents (e.g. attestation de vigilance in France).

**`ap_reporting_reports_spend` — Statutory & Spend Reporting**
- **US:** 1099 reporting, diversity/MWBE supplier-spend reporting where mandated by
  investors or public contracts.
- **UK:** CIS returns and payment-practices reporting (Duty to Report on Payment Practices
  and Performance) for large entities.
- **EU:** Country statutory spend and e-invoicing reporting. Note the module also carries
  B-BBEE spend reporting for South Africa, which sits outside the three markets modelled here.

### 6.3 General Ledger — `src/data/gl.js`

**`gl-framework-coa` — Chart of Accounts & Ledger Codes**
- **US:** No statutory chart — the group COA governs.
- **UK:** No statutory chart — the group COA governs.
- **EU:** Several countries mandate a statutory chart of accounts — Plan Comptable Général
  (FR), SKR03/SKR04 (DE). The alternate chart is normally used to map the group COA onto it,
  so plan for that mapping rather than a second ledger.

**`gl-close-year` — Fiscal Year-End Close**
- **US:** Fiscal year, commonly calendar-year for REITs.
- **UK:** Financial year — both 31 March and 31 December are common; Companies House
  filing deadlines drive the timetable.
- **EU:** Financial year per country statute. Local statutory accounts may sit on a
  different basis to the IFRS consolidation, so two close calendars can coexist.

**`gl-reporting-management-statements` — Core Statements**
- **US:** US GAAP statements, NAREIT FFO/AFFO and NCREIF NOI definitions for investor
  reporting, and SOX documentation over the close.
- **UK:** IFRS or FRS 102, with EPRA Best Practice Recommendations (EPRA earnings, NRI,
  NTA) for listed entities and MSCI/IPD benchmarking.
- **EU:** IFRS consolidation plus local statutory GAAP; EPRA BPR and INREV SDDS for funds,
  and AIFMD Annex IV for regulated vehicles.

**`gl-bank-recon` — Reconciliation & Multi-Currency Cash**
- **US:** Bank statements via BAI2.
- **UK:** MT940, increasingly Open Banking feeds.
- **EU:** CAMT.053 (ISO 20022) is the norm.

### 6.4 Residential Management — `src/data/rm.js`

**`rm-property-units-types` — Unit Types & Units**
- **US:** Resident, unit, apartment community. Unit mix and floor plans drive the type setup.
- **UK:** Tenant, unit or flat, BTR scheme or block. Unit types map to bedroom count and
  amenity tier.
- **EU:** Tenant, apartment, residential complex; area recorded in m².

**`rm-leasing-application` — Application Processing & Tenant Screening**
- **US:** Credit, criminal and eviction screening. The Fair Housing Act and FCRA
  adverse-action rules constrain the criteria and the record-keeping.
- **UK:** Referencing plus Right to Rent immigration checks in England. Tenant fees are
  banned under the Tenant Fees Act 2019, so screening cost sits with the landlord.
- **EU:** Referencing per country; GDPR limits what may be retained and several countries
  restrict what can be demanded of guarantors.

**`rm-leasing-execution-lease` — Lease Execution & SecureSign**
- **US:** Lease plus addenda; e-signature widely accepted.
- **UK:** Assured shorthold tenancy (AST) with prescribed information, EPC, gas safety
  certificate and How to Rent guide served at or before execution.
- **EU:** Statutory tenancy contract forms and mandatory disclosures vary by country;
  some require wet-ink or notarised execution.

**`rm-residents-admin` — Resident Account Administration**
- **US:** Notice periods and the eviction process are set state by state.
- **UK:** AST managed through Section 21 and Section 8 notice routes, subject to the
  Renters' Rights reforms; periodic tenancy arises after the fixed term.
- **EU:** Strong statutory tenant protection — indefinite tenancies and long notice periods
  are normal (DE, NL), which changes what "lease expiry" means operationally.

**`rm-deposits-interest` — Security Deposits & Interest**
- **US:** Security deposit; interest-bearing and segregation rules vary by state, and the
  SODA statement is issued on move-out.
- **UK:** A tenancy deposit for an AST must be protected in a government-authorised scheme
  within 30 days and is capped at five weeks' rent under the Tenant Fees Act 2019. Deposit
  interest is generally not payable to the tenant.
- **EU:** Kaution or dépôt de garantie, commonly capped (three months' rent in Germany,
  one to two in France) and often required to be held in a separate interest-bearing account.

**`rm-residents-moveout` — Move-Out & SODA Processing**
- **US:** SODA (Statement of Deposit Accounting) itemising deductions, issued within the
  state-mandated window.
- **UK:** Check-out, dilapidations and damage deductions, then deposit release through the
  protection scheme — typically within 10 days of agreement, with disputes going to scheme
  adjudication rather than the courts.
- **EU:** Handover protocol (Übergabeprotokoll, état des lieux de sortie) with statutory
  deadlines for returning the deposit.

**`rm-billing-delinquency` — Charges, Adjustments & Aged Delinquency**
- **US:** Delinquency; late fee per lease subject to state caps.
- **UK:** Arrears. Rent arrears management follows a pre-action protocol before possession
  proceedings, so the dunning ladder is legally shaped.
- **EU:** Arrears, recovered through court-led processes with statutory grace periods.

**`rm-integrations-payments` — Resident Connect & Payments**
- **US:** ACH, card and cash-pay networks (e.g. retail pay-in) through the resident portal.
- **UK:** Direct Debit is the dominant rail, plus open-banking payments and card.
- **EU:** SEPA Direct Debit with mandate capture; card acceptance varies by country.

### 6.5 Corporate AR — `src/data/car.js`

**`car-vat-charges` — VAT / Tax on Charges** *(UK + EU item)*
- **UK:** VAT at 20% on property income where the option to tax applies; MTD filing.
- **EU:** VAT per country, reverse charge for cross-border services, and e-invoicing
  mandates in an increasing number of countries.

**`car-charges-categories` — Income / Billing Categories**
- **US:** Sales and use tax by state and locality; nexus rules determine where
  registration is required, which affects how categories are coded.
- **UK:** VAT treatment per category — standard, exempt or outside scope — drives the
  tax-code mapping.
- **EU:** Category-to-VAT-code mapping needed per country, not per portfolio.

**`car-reporting-aged` — Aged Invoice List**
- **US:** AR aging.
- **UK:** Aged debtors; ageing buckets often aligned to quarter days rather than 30/60/90.
- **EU:** Aged debtors, with dunning stages frequently prescribed by local practice.

### 6.6 Fixed Asset Accounting — `src/data/faa.js`

**`faa-multibook-books` — Multi-Book & Accounting Standards**
- **US:** A US GAAP book plus a MACRS tax book; cost segregation drives component lives.
  GASB applies for public-sector owners.
- **UK:** IFRS or FRS 102. Investment property is held at fair value under IAS 40 with no
  depreciation, and capital allowances are tracked separately from book depreciation.
- **EU:** An IFRS group book plus local statutory and tax books — degressive depreciation
  (DE), component approach (FR). Multi-book is mandatory rather than optional.

**`faa-acquisition-policy` — Capitalisation Policy**
- **US:** De minimis capitalisation thresholds and the tangible property regulations
  (repair vs improvement) shape the policy.
- **UK:** Capitalisation policy set by accounting policy; repairs vs improvements matters
  for capital allowances rather than a statutory threshold.
- **EU:** Statutory thresholds exist in some countries (e.g. GWG limits in Germany).

**`faa-register-hierarchy` — Hierarchy & Component Accounting**
- **US:** Componentisation driven by cost segregation for tax depreciation.
- **UK:** Component accounting required under IAS 16 where parts have different useful lives.
- **EU:** Component approach mandated in several local GAAPs as well as IFRS.

### 6.7 Job Cost — `src/data/jc.js`

**`jc-contracts-lifecycle` — Contract Lifecycle**
- **US:** AIA contract forms; change orders and schedule-of-values billing.
- **UK:** JCT or NEC forms; variations, interim valuations and practical completion.
- **EU:** FIDIC internationally, VOB (DE) or marché de travaux (FR) domestically.

**`jc-payments-draws` — Draws & Invoices**
- **US:** Draw request package to the lender with lien waivers and title updates.
- **UK:** Interim valuation and certificate under the building contract, with monitoring
  surveyor sign-off for lender drawdowns.
- **EU:** Progress certificate per the local contract form, often with statutory payment
  timetables.

**`jc-payments-retainage` — Retainage**
- **US:** Retainage, typically 5–10%, released at substantial completion. State prompt-pay
  statutes govern timing.
- **UK:** Retention under JCT/NEC, typically 3–5%, half released at practical completion and
  the balance at the end of the defects liability period.
- **EU:** Retention or guarantee per local construction law — Bürgschaft (DE), retenue de
  garantie at 5% (FR).

### 6.8 Investment Accounting — `src/data/ia.js`

**`ia-structure-legal` — Entity Types, Legal Form & Share Classes**
- **US:** REIT, TRS, LP/LLC and blocker structures; UPREIT/OP-unit structures for
  contributed assets.
- **UK:** UK REIT, JPUT, LP and Authorised Contractual Scheme; non-resident structures
  affected by CGT and ATED rules.
- **EU:** Country regimes — SIIC (FR), FBI (NL), SOCIMI (ES), G-REIT (DE) — plus Luxembourg
  and Irish fund vehicles for pan-European portfolios.

**`ia-investor-reporting-statements` — Capital & Position Statements**
- **US:** NCREIF and ODCE reporting, capital-account statements per the LPA, and ILPA
  templates for fee reporting.
- **UK:** INREV and AREF guidelines, with MSCI UK benchmarking.
- **EU:** INREV SDDS quarterly reporting, AIFMD Annex IV, and ESMA-aligned disclosures.

### 6.9 Value Streams — `src/data/business/valueStreams.js`

The business view carries the same differences at L3. Notes to add:

| Item | Note theme |
|---|---|
| `vs-l2c-g3-p2` Escalations / step rents | escalation vs rent review vs indexation (as `cm-cpi-escalations`) |
| `vs-l2c-g3-p3` Percentage rent (retail) | percentage rent vs turnover rent (as `cm-retail-percentage`) |
| `vs-l2c-g4-p1` Operating-expense pooling | CAM vs service charge vs local regimes (as `cm-recov-setup`) |
| `vs-l2c-g4-p3` CAM estimates & monthly billing | on-account estimates vs CAM estimates; RICS budget/certificate cycle |
| `vs-l2c-g4-p4` Year-end CAM reconciliation | true-up vs certified reconciliation vs settlement (as `cm-recov-recon`) |
| `vs-l2c-g4-p5` Tax & insurance recoveries | real estate tax vs business rates vs local property taxes; insurance rent |
| `vs-l2c-g5-p2` Tenant AR aging | AR aging vs aged debtors; quarter-day ageing |
| `vs-l2c-g5-p3` Collections & dunning | collections vs arrears management; Late Payment Act / EU directive |
| `vs-l2c-g5-p4` Security deposits / LOC management | LOC vs rent deposit deed vs bank guarantee (as `cm-deposits-interest-guarantee`) |
| `vs-l2c-g6-p3` ASC 842 / IFRS 16 lessor accounting | which standard applies per market (as `cm-billing-adv-sl`) |
| `vs-l2c-g6-p5` Deferred rent & incentives | free rent vs rent-free/inducement amortisation |
| `vs-l2c-g7-p5` Holdover management | holdover vs holding over + LTA 1954 vs statutory renewal |
| `vs-l2c-g1-p7` Tenant credit underwriting | bureau + guaranty/LOC (US) vs company checks + deposit deed (UK) vs bank guarantee (EU) |
| `vs-q2c-g4-p1` Service revenue recognition | ASC 606 vs IFRS 15 |
| `vs-s2p-g2-p5` Payment | ACH/check vs BACS/Faster Payments vs SEPA (as `ap_bank_ach`) |
| `vs-s2p-g3-p3` Property-tax management | real estate tax vs business rates (incl. empty rates) vs local taxes |
| `vs-a2r-g2-p2` Valuation & appraisal | USPAP/MAI vs RICS Red Book registered valuer vs TEGoVA EVS |
| `vs-a2r-g2-p6` Tax-structuring DD | 1031/FIRPTA/opportunity zones vs SDLT/ATED/non-resident CGT vs RETT-blocker and share-vs-asset deal |
| `vs-r2r-g4-p1` Statutory / GAAP / IFRS reporting | US GAAP vs IFRS/FRS 102 vs IFRS + local statutory (as `gl-reporting-management-statements`) |
| `vs-r2r-g4-p2` REIT compliance & testing | US REIT asset/income/distribution tests vs UK REIT balance-of-business and 90% PID vs SIIC/FBI/SOCIMI/G-REIT |
| `vs-r2r-g4-p3` Investor reporting (NAV, capital accounts) | NCREIF/ILPA vs INREV/AREF vs INREV SDDS + AIFMD |
| `vs-r2r-g4-p5` ESG reporting | SEC climate rule + city building-performance standards vs SECR/TCFD vs CSRD/ESRS + EU Taxonomy |
| `vs-p2p-plan-g3-p4` Benchmarking | NAREIT/NCREIF/BOMA vs EPRA/MSCI-IPD/BCO vs EPRA BPR/INREV |
| `vs-pfo-g4-p3` Certifications (LEED, BREEAM) | LEED/ENERGY STAR/Fitwel vs BREEAM/EPC-MEES/NABERS UK vs BREEAM/DGNB/HQE + EPBD |
| `vs-pfo-g4-p2` Emissions tracking | SEC + NYC LL97/BERDO vs SECR/MEES vs CSRD/EPBD |
| `vs-tdm-g2-p1` Debt origination / refinancing | SOFR + CMBS/agency debt vs SONIA + clearing-bank/debt-fund vs EURIBOR + Pfandbrief/bank club |
| `vs-h2r-g1-p4` Payroll | US federal/state payroll and benefits vs PAYE/NIC/pension auto-enrolment vs country payroll and social security |

Also worth a spelling note rather than a rule: the app's own copy is UK English throughout
(see `CLAUDE.md`), and it should stay that way. Notes describe the market's vocabulary; they
do not re-spell the surrounding content.

## 7. Delivery sequence

| Step | Content | Outcome |
|---|---|---|
| 1 | Items 1–7 of §4 (filter, predicate, note component, both grids, panel, System-view dropdown) | The filter works. Notes render where they exist. |
| 2 | §5 applicability tags | The eight genuinely market-bound items hide correctly. |
| 3 | Items 8–9 of §4 (edit modals) | Consultants can tag and annotate during discovery; persists per version. |
| 4 | §6.1–6.8 notes (system modules) | System view carries the terminology detail. |
| 5 | §6.9 notes (value streams) | Business view carries it too. |
| 6 | Items 10–12 of §4 (export + styling) | The Word/PDF cover statement becomes true; notes appear in client documents. |

Steps 1–3 are the functional change and are independently shippable. Steps 4–5 are content
and can land module by module without touching code.

## 8. Verification

- Select **United Kingdom** only: `ap_tax_1099` and `cm-cash-methods-lockbox` disappear
  from the System view; `ap_tax_vat` remains.
- Select **United States** only: `ap_tax_vat` and its subs and `cm-recov-service-emea`
  disappear; `ap_tax_1099` remains.
- Select all three or none: every item shows — no item is ever hidden by default.
- Open `cm-recov-recon` with one market selected: exactly one market note section renders.
- Combine Market with Scope and Coverage: filters intersect, and a parent stays visible
  while any sub matches.
- Edit Mode: nothing is hidden regardless of selection.
- Export with United Kingdom selected: the cover's market statement matches the body, and
  the shown/total count reflects the market filter.
- Save a version, reload it: `marketScope` and `market` survive the round-trip; undo
  restores both.
