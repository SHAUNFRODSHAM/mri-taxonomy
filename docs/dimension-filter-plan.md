# Client Dimension Filtering — Implementation Plan

**Status:** market steps 1–3 built and committed (`7a0ef07`): the filter, four applicability
tags, and the edit-modal fields. Everything in §2–§5 below is the refactor that generalises
that work to the Vertical dimension. §7 (market notes) and §8 (vertical notes) are content,
still outstanding, as is the export in §5.

**Scope:** the taxonomy has two *client dimensions* — **Market** (United Kingdom / United
States / Pan-European) and **Vertical** (Retail / Industrial / Office / Residential). Both
answer the same question: *does this process apply to this client, and what is different
about it for them?* This plan makes them one mechanism instead of two half-built ones.

Entity type (`state.entities`) is a third candidate but is out of scope here — it is
currently unused by any renderer.

---

## 1. Problem

### Market was visibly broken

1. **The filter never filtered.** `businessView.js` filtered on `matchesVerticals()` and
   `matchesCoverage()` only. `state.markets` was read in exactly one place —
   `showBusinessPanel()` — to choose which "Market Variation" paragraphs to print.
2. **There was nothing to filter on.** Every L3 card is seeded `market: null`. The 143
   populated blocks live in `raw.js`, which nothing imports.
3. **The System view had no market control at all** — only Scope.
4. **The export misreported:** it printed *"Markets: United Kingdom"* on the cover while
   filtering on coverage and vertical only.

Items 1–3 are fixed in `7a0ef07`. Item 4 is still open (§5, items 11–13).

### Vertical is invisibly broken, which is worse

The mechanism is wired and looks functional, so the defects only surface once anyone
authors content — which is exactly what §7 and §8 do.

1. **There is no sector data either.** 177 loaded L3 items, **0** with `vertical` data.
   Same story as market: 143 blocks stranded in `raw.js`.

2. **Notes are doing double duty as applicability.** `item.vertical` is a *notes* object,
   but `matchesVerticals()` filters on whether a key is *present*. Visibility therefore
   depends on where an author happened to have something to say. Running the function as
   written:

   | Item as authored | All four | Office only | R+I+O |
   |---|---|---|---|
   | Base rent billing — notes on all 4 sectors | shown | shown | shown |
   | Percentage rent — Retail note only | shown | HIDDEN | shown |
   | **Base rent billing — Retail note only** | shown | **HIDDEN** | shown |
   | Item authored with `vertical.All` | shown | **HIDDEN** | **HIDDEN** |
   | No vertical data | shown | shown | shown |

   Rows 2 and 3 are authored identically but mean opposite things. Percentage rent *should*
   vanish from an Office view; base rent billing must not. The filter cannot tell them apart.

   The `if (sel.length === SECTORS.length) return true` early return exists to stop the
   `some()` test from wrongly hiding things — and because all four sectors are selected by
   default, it masks the flaw in the state everyone sees.

3. **`vertical.All` is a trap, and backwards.** `VERTICALS` exports `'All'` and
   `VERTICAL_COLOURS` gives it a swatch, but `SECTORS` strips it from the selection. So the
   filter *hides* `All`-keyed items on any partial selection, and the panel
   (`sel.filter(v => item.vertical[v])`) never renders an `All` note at all.

4. **No Vertical control in the System view**, where sector applicability is real: the whole
   RM module is Residential (47 items) and `cm-retail` is Retail-only (9 items).

5. **The export filters on vertical but never discloses it** — the inverse of the market
   bug. Market lied about its scope; vertical conceals it.

6. **Four names for one concept:** `state.verticals`, UI label "Vertical", internal
   `SECTORS`, notes field `vertical`.

### Why now is the moment

Because **0 loaded items carry `vertical` data**, replacing the notes-as-applicability
behaviour is a no-op on live content. Do it after §8 authoring and it is a breaking change
to real content.

## 2. The shared abstraction

One registry describes both dimensions; every renderer loops over it instead of naming
Market or Vertical.

```js
// src/data/dimensions.js  (absorbs markets.js)
export const DIMENSIONS = [
  {
    key: 'market', label: 'Market', noteLabel: 'Market Notes',
    stateKey: 'markets',            // state.markets — the live selection
    scopeField: 'marketScope',      // applicability, on item / column / module
    notesField: 'market',           // per-key prose
    options: [
      { key: 'UK', label: '🇬🇧 United Kingdom' },
      { key: 'US', label: '🇺🇸 United States' },
      { key: 'EU', label: '🇪🇺 Pan-European' },
    ],
  },
  {
    key: 'vertical', label: 'Vertical', noteLabel: 'Sector Notes',
    stateKey: 'verticals',
    scopeField: 'verticalScope',
    notesField: 'vertical',
    options: [
      { key: 'Retail',      label: 'Retail',      colour: '#c0440e' },
      { key: 'Industrial',  label: 'Industrial',  colour: '#1a5fa8' },
      { key: 'Office',      label: 'Office',      colour: '#5b4acb' },
      { key: 'Residential', label: 'Residential', colour: '#1a8a4a' },
    ],
  },
];
```

**Field names are unchanged from what shipped.** `marketScope` / `market` keep their names,
so there is no data migration, the four committed tags stay valid, and the schema block in
`CLAUDE.md` stays correct. `verticalScope` is new; `vertical` already exists as notes and
keeps that meaning — it simply stops driving the filter.

Each dimension contributes, automatically and with no per-dimension code:

- a `makeMultiSelect` in both filter bars, bound to its `stateKey`
- a clause in the grid filter
- a notes section in both detail panels
- an applicability + notes block in both edit modals
- a line on the export cover and a block in the exported body

### Hard constraint (unchanged)

`mri_title` and `mri_assoc[].name` are **never** localised or sector-qualified.
`CM > Recoveries > Service Charges` is the literal MRI menu label — it reads the same on a
US install and in an industrial portfolio. Differences go in notes *about* those screens.

## 3. Filter semantics

```js
/** Scope resolved most-specific-first: item → column → module → universal. */
export function resolveScope(dim, item, col, moduleKey, cfg) {
  const f = dim.scopeField;
  if (item?.[f]?.length) return item[f];
  if (col?.[f]?.length)  return col[f];
  if (cfg?.[moduleKey]?.[f]?.length) return cfg[moduleKey][f];
  return null;                                   // universal
}

/** Does an item apply, on this dimension, to anything currently selected? */
export function matchesDimension(dim, scope) {
  if (!scope || !scope.length) return true;      // universal
  const sel = state[dim.stateKey];
  if (!sel || !sel.length) return true;          // nothing selected → hide nothing
  return scope.some(k => sel.includes(k));
}

/** Every dimension ANDed — the single predicate both grids call. */
export function matchesAllDimensions(item, col, moduleKey, cfg) {
  return DIMENSIONS.every(d =>
    matchesDimension(d, resolveScope(d, item, col, moduleKey, cfg)));
}
```

Two rules, both generalisations of decisions already made:

**Nearest ancestor wins, and gates the subtree.** A sub inherits its process, a process
inherits its column, a column inherits its module. Anything absent means universal. This
generalises the inheritance fix made during the market build — without it, an out-of-scope
parent stays visible whenever it has untagged (therefore universal) children, which is how
`car-vat-charges` leaked into the US view. It is deliberately the opposite of the "parent
shows if any sub matches" rule used for Scope and Coverage.

Module and column levels are what make Vertical tractable: RM becomes **one** tag instead
of 47, `cm-retail` **one** instead of 9.

**An empty selection hides nothing.** Unticking everything is treated as "no opinion", not
"exclude everything" — an empty grid is never the answer to a filter question.

Edit Mode continues to show everything, so hidden items stay editable.

### Behaviour changes to accept

| Today | After |
|---|---|
| `vertical` notes decide visibility | `verticalScope` decides visibility; notes are only prose |
| All-four-selected early return | Gone — subsumed by the generic predicate |
| `vertical.All` hides an item on partial selections | `'All'` removed from `VERTICALS`; absence already means universal |
| Market gated at item level only | Market also honours column and module scope, for free |

## 4. Migrating the shipped market code

The market work is committed, so this is a refactor of live code, not a greenfield build.
Sequenced so the tree builds at every step.

| Step | Action |
|---|---|
| 4a | Create `dimensions.js` with the registry and the four generic functions above. |
| 4b | Reimplement `matchesMarkets`, `marketFilterActive`, `selectedMarketNotes` in terms of the generics, still exported from `markets.js`. Nothing else changes yet — the tree builds and all 24 tests pass. |
| 4c | Rename `marketNote.js` → `dimensionNotes.js`; make `marketNoteHTML` / `marketFieldsHTML` / `readMarketFields` loop over `DIMENSIONS`. Their signatures do not change, so the four call sites are untouched. |
| 4d | Switch `grid.js`, `businessView.js`, `panel.js`, `main.js` to the generic names; delete `markets.js` and the shim. |
| 4e | Delete `matchesVerticals` and the `SECTORS` const; `matchesItem` becomes `matchesAllDimensions` + `matchesCoverage`. |

The edit-modal form fragment needs one real change: its CSS hooks are currently
`.mkt-scope` / `.mkt-note`, read back by `document.querySelectorAll`. With two dimensions
in one modal these must become `data-dim`-qualified (`.dim-scope[data-dim="market"]`), or
the vertical checkboxes will be read into `marketScope`. **This is the one place a careless
refactor silently corrupts data.**

## 5. Code changes

| # | File | Change |
|---|---|---|
| 1 | `src/data/dimensions.js` **(new)** | Registry + `resolveScope`, `matchesDimension`, `matchesAllDimensions`, `dimensionFilterActive`, `selectedNotes` |
| 2 | `src/data/markets.js` | Deleted at step 4d (thin shim in between) |
| 3 | `src/components/dimensionNotes.js` | Renamed from `marketNote.js`; loops `DIMENSIONS` for the panel section, the modal fragment and the read-back |
| 4 | `src/components/businessView.js` | Drop `matchesVerticals` + `SECTORS` + `VERTICAL_COLOURS`; filter via `matchesAllDimensions`; build both filter dropdowns from the registry; replace the bespoke "Vertical Detail" block with the generic notes section |
| 5 | `src/components/grid.js` | Generic predicate; pass `col` and `state.currentTab` so column/module scope resolves |
| 6 | `src/components/panel.js` | Already calls one notes function — no change needed |
| 7 | `src/main.js` | Build System-view dropdowns from the registry (Market is there; Vertical is added) |
| 8 | `src/components/editModal.js` | No change — the fragment functions keep their signatures |
| 9 | `src/components/businessEditModal.js` | Remove its bespoke per-sector textareas; the generic fragment covers them |
| 10 | `src/data/business/index.js` | Remove `'All'` from `VERTICALS`, or delete the export once the registry owns the options |
| 11 | `src/components/genModal.js` | Disclose **every** dimension on the cover, not just Markets; add the generic predicate to both `itemFilter`s |
| 12 | `src/components/docxExport.js` | Notes block per dimension beside the Client note line |
| 13 | `src/styles/main.css` | Generalise `.market-note*` / `.market-scope*` to `.dim-note*` / `.dim-scope*`; keep the Open Box palette and use each dimension's `colour` for the sector swatch |

`state.js` and `versions.js` are untouched: `state.markets` and `state.verticals` both
already exist, and item fields are snapshotted wholesale.

### UI notes

Both dropdowns bind to the same state in both views, so one selection governs the System
view, the Value Streams view and the export. Neither resets on tab switch (unlike
`scopeFilters` at `main.js:194`) — client dimensions are properties of the engagement, not
of the module being viewed.

With Scope, Coverage, Market and Vertical all in one bar, the filter bar needs a visible
"filters active" affordance so a narrowed grid is never mistaken for missing content. The
existing `anyFilterActive` flag already drives the empty-state message; surface it as a
chip with a "clear all" action, in the Open Box palette.

## 6. Applicability tags

Tag only where a process genuinely does not exist for that market or sector. Everything
else stays universal and carries notes instead. These two lists are the entire maintenance
burden of the feature — keep them short on purpose.

### 6.1 Market — `marketScope` (built)

| Item | `marketScope` | Rationale |
|---|---|---|
| `ap_tax_1099` | `['US']` | Title already says "(US)"; a 1099 has no UK/EU analogue |
| `ap_tax_vat` | `['UK','EU']` | Description already reads "Non-US tax handling". Its two subs inherit this — no tag needed on them |
| `cm-recov-service-emea` | `['UK','EU']` | "EMEA Service-Charge Packs" — country-specific module. Tagged at sub level because its parent applies everywhere |
| `car-vat-charges` | `['UK','EU']` | VAT on charges; the US equivalent is sales & use tax, handled elsewhere. Its two subs inherit |
| `cm-cash-methods-lockbox` | `['US']` | Electronic Lockbox (CMEL) is a US bank construct — **confirm before tagging** |
| `gl-vat` column | `['UK','EU']` | **New** — master added a VAT & Tax Compliance column. VAT has no US analogue; sales & use tax is handled separately. One column tag covers all 6 items |
| `gl-vat-mtd` | `['UK']` | **New** — Making Tax Digital is an HMRC regime. Narrower than its column, so it needs its own tag; its two subs inherit |
| `vs-r2r` VAT / MTD card | `['UK','EU']` | **New** — the value-stream counterpart of `gl-vat`, added by the same change |
| `rm-soda` items | *none* | Leave universal — SODA is the MRI statement name; UK/EU BTR clients still run move-out accounting. Notes cover the difference |

`gl-vat` is the worked example of the §3 resolution rule: tag the **column** `['UK','EU']`,
then let one **item** narrow to `['UK']`. Six items, two tags, and a US-only client sees
neither.

**Open question:** `ap_reporting_reports_spend` covers B-BBEE spend reporting (South Africa),
which none of the three markets represents. Either add a fourth market key (`ZA`) or leave
the item universal with a note. Recommend the note, and revisit if ZA becomes a delivery market.

### 6.2 Vertical — `verticalScope` (new)

Sector applicability is mostly structural, which is why the module and column levels matter:
three structural tags (one module, one column, one sub) cover 66 system items that would
otherwise need a tag each.

| Target | Level | `verticalScope` | Rationale |
|---|---|---|---|
| `rm` module | `MODULE_CONFIG.rm` | `['Residential']` | Residential Management is the residential system. One tag covers 47 items |
| `cm-retail` column | column | `['Retail']` | Retail Management — percentage rent, sales capture, retail categories. Covers 18 items since master's Advanced Retail expansion |
| `cm-setup-options-retail` | sub | `['Retail']` | "Retail Options" — retail-only configuration, in a setup column that applies to all sectors |
| `cm-deposits-interest-guarantee` | sub | *none* | Bank guarantees skew EU/commercial, but all four sectors use them. Notes, not a tag |
| `vs-l2c-g3-p3` Percentage rent (retail) | item | `['Retail']` | The title already declares it |
| `vs-pfo-g4-p3` Certifications | item | *none* | BREEAM/LEED apply across sectors; the *ratings* differ. Notes |

**Do not tag** the recoveries, billing, AR, close or reporting processes. They apply to every
sector and differ only in emphasis — that is what §8 notes are for. Over-tagging here is how
the filter starts hiding content people expect to see.

**Open question — residential in CM.** UK Build-to-Rent is often run in CM rather than RM
(commercial lease structures, service charges, quarterly billing). If that is a delivery
pattern for Open Box, `rm` being `['Residential']` is right but *`cm` must stay universal* —
do not be tempted to tag CM `['Retail','Industrial','Office']`. Flagging because it is the
obvious next tag someone would add, and it would wrongly hide CM from a BTR client.

## 7. Market notes content

The lexicon from the analysis, redistributed as `market: { US, UK, EU }` notes on the
original content. Each row below is a literal note set to add to that item in its data file.

### 7.1 Commercial Management — `src/data/cm.js`

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

### 7.2 Accounts Payable — `src/data/ap.js`

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

### 7.3 General Ledger — `src/data/gl.js`

**`gl-vat-setup` — VAT / Tax Code Configuration** *(UK+EU via the column tag)*
- **UK:** Standard, reduced, zero-rated and exempt codes, plus the option to tax on
  property income. Partial exemption calculations drive the recoverable percentage.
- **EU:** Rates and codes per country, with reverse-charge codes for cross-border supply.
  A single tax-code set rarely survives a multi-country portfolio.

**`gl-vat-mapping` — GL Account to VAT Box Mapping** *(UK+EU via the column tag)*
- **UK:** Nine-box VAT return; the mapping must reconcile boxes 1–9 back to the ledger for
  audit.
- **EU:** Box structures differ by country, so the mapping is per jurisdiction rather than
  per group.

**`gl-vat-mtd` — Making Tax Digital (MTD) Compliance** *(UK-only — narrower than its column)*
- **UK:** HMRC requires digital record keeping, unbroken digital links from source to
  return, and API submission. Spreadsheet re-keying anywhere in the chain breaks the digital
  link requirement, which is the usual implementation constraint.

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

### 7.4 Residential Management — `src/data/rm.js`

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

### 7.5 Corporate AR — `src/data/car.js`

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

### 7.6 Fixed Asset Accounting — `src/data/faa.js`

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

### 7.7 Job Cost — `src/data/jc.js`

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

### 7.8 Investment Accounting — `src/data/ia.js`

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

### 7.9 Value Streams — `src/data/business/valueStreams.js`

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

## 8. Vertical notes content

Sector differences are rarely about *whether* a process runs — they are about emphasis,
structure and which numbers matter. That is why §6.2 is a handful of tags and this section
carries the substance.

Written as `vertical: { Retail, Industrial, Office, Residential }` notes on the item. Omit
a sector where there is nothing distinctive to say; unlike today, omission no longer hides
anything.

### 8.1 Commercial Management — `src/data/cm.js`

**`cm-recov-setup` — Recovery Setup & Expense Pools**
- **Retail:** Pools split between mall common area (security, cleaning, seasonal
  decoration) and a separate marketing or promotional levy that tenants fund but the
  landlord directs. Anchors frequently negotiate caps or a fixed CAM contribution.
- **Industrial:** Minimal common area. Single-let assets are usually FRI (UK) or
  triple-net (US), so the tenant contracts direct and there is little to pool; multi-let
  estates pool estate roads, lighting and security only.
- **Office:** The most complex pooling — base year and expense-stop structures, gross-up
  provisions for vacancy, and separate pools for chilled water or after-hours HVAC.
- **Residential:** US multifamily generally has no tenant recovery; costs sit with the
  landlord and are recovered through gross rent, with RUBS or submetering for utilities
  only. UK BTR does levy a service charge on the commercial model.

**`cm-recov-setup-share` — Pro-Rata Share Basis**
- **Retail:** GLA-based, with anchors often excluded from the denominator — which changes
  every other tenant's share.
- **Industrial:** Site area or GIA; yard and hardstanding may be apportioned separately
  from buildings.
- **Office:** Rentable area including a load factor for common parts; gross-up to an
  assumed occupancy is standard.
- **Residential:** Per-unit or per-bedroom rather than by area.

**`cm-building-suites-sqft` — Square Footage (BSQF)**
- **Retail:** GLA (Gross Leasable Area). UK retail rental analysis is zoned (Zone A/B/C),
  so a single area figure does not carry the valuation logic.
- **Industrial:** GIA, with eaves height and yard area held separately. Office content
  inside a warehouse is measured apart and rented at a different rate.
- **Office:** NIA or IPMS 3 with a load factor to rentable; the common-area factor is
  negotiated, not derived.
- **Residential:** Unit and bed counts matter more than area; NIA per unit for BTR.

**`cm-lease-setup-lease` — Lease Record (LEAS)**
- **Retail:** 5–10 year terms carrying turnover provisions, keep-open and radius clauses,
  and fit-out obligations.
- **Industrial:** Long institutional terms (10–15 years) with fixed uplifts, often
  single-tenant with full repairing obligations on the occupier.
- **Office:** 5–10 years with break options, rent-free periods and Cat-B/TI
  contributions; assignment and sublet provisions carry real weight.
- **Residential:** 6–12 month ASTs (UK) or 12-month leases (US). The system challenge is
  volume and turnover, not clause complexity.

**`cm-cpi-escalations` — CPI / RPI Escalations**
- **Retail:** Base-rent uplift is secondary to turnover rent; indexation caps are common
  to protect the occupancy cost ratio.
- **Industrial:** Fixed annual uplifts or index linkage with a collar and cap — the
  dominant institutional structure.
- **Office:** Open-market review (UK) or stepped/CPI (US). Outcomes are negotiated rather
  than calculated, so the system records the result rather than deriving it.
- **Residential:** Annual increases, frequently capped by statute or scheme rules, applied
  across the whole rent roll in one run.

**`cm-billing-adj-latefee` — Late Fees**
- **Retail:** Enforced — occupancy cost monitoring means arrears are chased hard.
- **Industrial:** Rare; single strong-covenant tenants pay on the due date.
- **Office:** Applied per lease terms, often waived for strategic tenants.
- **Residential:** High volume and legally constrained — caps and grace periods are
  statutory in many jurisdictions.

**`cm-deposits-interest-guarantee` — Bank Guarantees**
- **Retail:** Guarantees sized against the fit-out contribution as well as rent;
  parent-company guarantees common for multiples.
- **Industrial:** Modest deposits — covenant strength usually substitutes for security.
- **Office:** Letters of credit for growth-stage tenants, rent deposit deeds for the rest.
- **Residential:** Small per-unit deposits at very high volume, where scheme protection
  (UK) and state rules (US) dominate the process.

**`cm-retail-percentage` — Percentage & Turnover Rent** *(Retail-only via the column tag)*
- **Retail:** Turnover certificates per unit, breakpoints per lease, and occupancy cost
  ratio monitoring that feeds the renewal decision.

**`cm-monthly-reporting-reports` — Key Reports**
- **Retail:** Footfall, sales per sq ft, occupancy cost ratio, tenant mix by category.
- **Industrial:** WAULT, rent per sq ft, site coverage, vacancy by unit-size band.
- **Office:** Occupancy vs utilisation, stacking, rent-free burn-off, WAULT to break.
- **Residential:** Occupancy, renewal rate, churn, arrears ageing, rent per bed.

### 8.2 Value Streams — `src/data/business/valueStreams.js`

**`vs-l2c-g1-p1` — Space marketing & demand generation**
- **Retail:** Leasing to a tenant-mix and category plan, not simply to demand.
- **Industrial:** Agent-led, a small number of large requirements, plus build-to-suit enquiries.
- **Office:** Fit-out-ready and managed-space products now compete with conventional leasing.
- **Residential:** Always-on portal marketing at scale; cost per lease is the metric.

**`vs-l2c-g1-p7` — Tenant credit underwriting**
- **Retail:** Covenant plus trading history — a weaker covenant may be accepted for the
  right brand and mix position.
- **Industrial:** Single-tenant concentration makes covenant the dominant risk.
- **Office:** Growth-company tenants underwritten on funding rounds, mitigated by a letter
  of credit or a larger deposit.
- **Residential:** Affordability multiple and referencing at volume; guarantors common for
  students and first-time renters.

**`vs-l2c-g7-p1` — Renewals**
- **Retail:** A re-merchandising decision as much as a commercial one — the mix plan may
  prefer a different category in that unit.
- **Industrial:** High renewal probability; relocation cost for the occupier is prohibitive.
- **Office:** Renewal competes with fit-out incentives elsewhere, and break options drive
  the calendar.
- **Residential:** High-volume automated renewal cycles, where churn is the KPI.

**`vs-a2r-g2-p2` — Valuation & appraisal**
- **Retail:** Yields sensitive to footfall and tenant mix; turnover-linked income is
  capitalised differently from base rent.
- **Industrial:** Yield-driven with strong rental-growth assumptions; site value can
  exceed investment value.
- **Office:** Capex and ESG-retrofit liability are now central — obsolescence and EPC/MEES
  risk are priced in.
- **Residential:** Gross-to-net ratio and operating-cost assumptions dominate; comparables
  are per unit and per bed.

**`vs-a2r-g5-p5` — Impairment review**
- **Retail:** Structural decline and re-purposing assumptions.
- **Industrial:** Least exposed of the four.
- **Office:** Stranded-asset risk where retrofit cost exceeds the achievable uplift.
- **Residential:** Regulatory and rent-control exposure.

**`vs-p2p-plan-g2-p1` — Property-level budgets**
- **Retail:** Marketing levy and seasonal costs budgeted separately from the service charge.
- **Industrial:** Thin operating budgets; capex-led.
- **Office:** The largest operating budget per sq ft — services, energy, front of house.
- **Residential:** Make-ready and staffing dominate, budgeted per unit.

**`vs-p2p-plan-g3-p1` — NOI / occupancy / WAULT analytics**
- **Retail:** Sales-based metrics alongside NOI, with occupancy cost ratio as the
  affordability check.
- **Industrial:** WAULT and rent-reversion focus.
- **Office:** Utilisation and occupancy have diverged since hybrid working — both are needed.
- **Residential:** Churn, renewal rate and rent per bed. WAULT is close to meaningless on
  12-month tenancies.

**`vs-pfo-g2-p1` — Preventive maintenance**
- **Retail:** Mall plant, escalators and fire systems, with high public-liability exposure.
- **Industrial:** Loading doors, sprinklers and yard surfacing — often tenant-managed
  under FRI.
- **Office:** HVAC, lifts and BMS — the densest PPM schedule of the four.
- **Residential:** In-unit appliance and safety checks (gas safety, EICR) at scale, with
  resident access coordination as the real constraint.

**`vs-pfo-g3-p1` — Space planning**
- **Office:** Where this process actually lives — stacking, blocking and churn planning.
- **Retail:** Expressed as the tenant-mix and unit-configuration plan instead.
- **Industrial / Residential:** Largely not applicable; the unit is the unit.

**`vs-pfo-g4-p3` — Certifications (LEED, BREEAM)**
- **Retail:** BREEAM In-Use, with ESG expectations often set by anchor tenants.
- **Industrial:** EPC and roof-mounted PV; BREEAM for new logistics development.
- **Office:** LEED / BREEAM / WELL plus MEES EPC compliance — the sharpest end of the risk.
- **Residential:** EPC per unit, since UK MEES applies to each tenancy; Home Quality Mark
  for new build.

### 8.3 Remaining mapping

Worth notes, not yet drafted:

| Item | Note theme |
|---|---|
| `cm-recov-recon` | Audit rights (retail/office) vs simple settlement (industrial); N/A for US multifamily |
| `cm-lease-admin-vacate` | Re-merchandising void (retail) vs make-ready turn (residential) vs dilapidations (office/industrial) |
| `cm-cash-methods-config` | Direct Debit at volume (residential) vs quarterly BACS (commercial) |
| `vs-l2c-g2-p1` Lease abstraction | Clause density: office/retail heavy, industrial light, residential templated |
| `vs-l2c-g5-p3` Collections & dunning | Statutory pre-action protocol (residential) vs commercial negotiation |
| `vs-s2p-g3-p2` Utility management | Landlord-supplied (retail/office) vs tenant-direct (industrial) vs submetered (residential) |
| `vs-r2r-g4-p5` ESG reporting | Whole-building (office) vs per-unit (residential) vs roof/PV (industrial) |
| `vs-tdm-g2-p1` Debt origination | Agency debt (US residential), CMBS (retail), sale-leaseback (industrial) |

### 8.4 Harvesting `raw.js`

`raw.js` holds 143 `vertical` blocks with all four sectors populated, and the content is
good — JV and SPV structures, fund vehicles, intercompany flows, consolidation method. But
it is keyed to the **earlier functional taxonomy** (GL/AP/AR), not the value streams, and
its subject matter is finance-structural rather than operational. It maps to Record to
Report and the GL/IA system modules, not to Lease to Cash.

Treat it as a partial harvest requiring re-mapping to current IDs — not a lift-and-shift.
The same caveat applies to its 143 `market` blocks.

## 9. Delivery sequence

| Step | Content | Outcome | State |
|---|---|---|---|
| 1 | Market filter, predicate, notes component, both grids, panel, System-view dropdown | The Market filter works; notes render where they exist | **done** (`7a0ef07`) |
| 2 | §6.1 market applicability tags | The four market-bound items hide correctly | **done** |
| 2b | §6.1 additions — `gl-vat` column, `gl-vat-mtd`, the R2R VAT card | Covers the VAT & MTD content master added after step 2 shipped | next |
| 3 | Market fields in both edit modals | Consultants can tag and annotate during discovery; persists per version | **done** |
| 4 | §4a–4b — registry + generics, market reimplemented on top, old exports intact | No behaviour change; build and all 24 tests still pass | next |
| 5 | §4c–4e — generic notes/fields component, call sites switched, `matchesVerticals` and `'All'` deleted | Vertical becomes a real applicability filter; the notes-as-applicability flaw is gone | next |
| 6 | §5 items 4, 7, 10 — Vertical dropdown in both filter bars, column/module scope resolution | Vertical filters both views; the filter-active affordance lands | next |
| 7 | §6.2 vertical applicability tags | RM reads as Residential, `cm-retail` as Retail — 3 structural tags covering 66 system items, plus 1 in the business view | next |
| 8 | §7 market notes, module by module | System and Business views carry the terminology detail | content |
| 9 | §8 vertical notes, module by module | Sector detail lands on the processes that differ | content |
| 10 | §5 items 11–13 — export + styling | Cover discloses every dimension and matches the body; notes appear in client documents | last |

Steps 4–7 are the refactor and are independently shippable — do them **before** steps 8–9,
because replacing the vertical filter semantics is free today (0 items carry `vertical`
data) and a breaking content change afterwards.

Steps 8–9 are pure content and can land per module with no code changes.

## 10. Verification

### Market (regression — all currently passing)

- **United Kingdom** only: `ap_tax_1099` hidden; `ap_tax_vat` remains.
- **United States** only: `ap_tax_vat` and both subs hidden, plus `cm-recov-service-emea`;
  `ap_tax_1099` remains.
- **UK + US**: nothing hidden — the union, not the intersection.
- All three, or none: every item shows.
- `car-vat-charges` under US only: parent *and* both untagged subs hidden (inheritance).
- Notes filtered by selection: UK→1 block, UK+US→2, EU→section absent.
- Version save round-trip and undo both preserve `marketScope` and `market`.

### Vertical (new)

- **Residential** only: the whole RM module shows; `cm-retail` and `cm-setup-options-retail`
  are hidden — resolved from the column and module tags, with no per-item tags.
- **Retail** only: `cm-retail` shows; RM is hidden.
- **Office** only: a process carrying *only* a Retail note still **shows**. This is the
  regression test for the notes-as-applicability flaw — it must not hide.
- An item authored `vertical: { All: '…' }`: the key no longer exists; authoring it stores
  nothing and hides nothing.
- All four, or none: every item shows.

### Both dimensions together

- UK + Retail: intersection across dimensions, union within each.
- Market and Vertical both narrowed to nothing in common: the grid shows the empty-state
  message, not a blank canvas.
- Combine with Scope and Coverage: all four intersect; a parent stays visible while any sub
  matches on Scope/Coverage, but an out-of-scope parent still hides its subtree on Market
  and Vertical.
- Edit Mode: nothing hidden on any dimension.
- Both edit modals: ticking Vertical boxes writes `verticalScope`, **not** `marketScope`
  (the `data-dim` read-back from §4 — the one refactor step that can silently corrupt data).
- Export with UK + Retail: the cover names both dimensions and the shown/total count
  matches the body.
