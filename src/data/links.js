/* ═══════════════════════════════════════════════════════════════════════════
   links.js — Business ⇄ System (MRI PMX) link registry + mutable store

   SEED_LINKS is the shared default template: how a business process ties into
   the system process(es) that deliver it. At runtime these seed the editable
   store in state.links, where each link carries a COVERAGE status and optional
   note captured during client discovery:

     full     — fully delivered by the system process
     partial  — only part of the process touches the system
     outside  — largely managed outside the system (manual / spreadsheet / 3rd-party)

   Edits are per client: the store is saved into the version snapshot, so each
   engagement diverges from the seed independently. The reverse direction is
   always computed at runtime, so a link lives as a single {b,s} record.

   ids:  business → b<mod>-<domain>-<rawId>   (see data/business/index.js)
         system   → <module>-<area>-<topic>   (see data/<module>.js)
   ═══════════════════════════════════════════════════════════════════════════ */

import { ALL_DATA, MODULE_CONFIG } from './index.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, findBusinessItem } from './business/index.js';
import { state } from '../state.js';

export const COVERAGE = {
  full: {
    label: 'Fully in system', short: 'Full', color: '#5a7a1e',
    desc: 'Delivered end-to-end within the MRI PMX system — no manual workarounds. Should be linked to the supporting system process(es).',
  },
  partial: {
    label: 'Partial — touches part of the process', short: 'Partial', color: '#b8860b',
    desc: 'MRI PMX supports part of this process; the rest is handled manually or in another tool. Should be linked to the system process(es) it touches.',
  },
  outside: {
    label: 'Outside system — managed manually', short: 'Outside', color: '#8a8a8a',
    desc: 'Managed entirely outside MRI PMX — e.g. spreadsheets, a third-party tool, or a manual procedure. No system link required.',
  },
};
/** Full tooltip text for a coverage tag ("Label — extended context"). */
export function coverageTooltip(key) {
  const c = COVERAGE[key];
  return c ? `${c.label} — ${c.desc}` : '';
}
export const COVERAGE_ORDER = ['full', 'partial', 'outside'];

/* ── Proposed Scope — Open Box value-add proposals ────────────────────────────
   Deliberately ORTHOGONAL to coverage (business) and scope (system) rather than
   a fourth value in either enum. An item keeps its current-state tag AND may
   additionally carry `proposed: true` + `proposed_note`.

   That separation is the whole point. A process tagged "Outside" (the client
   runs it in spreadsheets today) which Open Box believes PMX could absorb is a
   proposal worth making precisely BECAUSE of the delta — "manual today, we
   propose bringing it into the system". Folding `proposed` into the coverage
   enum would overwrite the current state and erase the argument.

   Proposals are Open Box's opinion, not agreed client scope, so they render in
   Open Box green with a dashed edge and are EXCLUDED from generated documents
   unless "Proposed Scope" is explicitly ticked in the export options. */
export const PROPOSED = {
  label: 'Proposed scope — Open Box recommendation',
  short: 'Proposed',
  mark:  '✦',
  color: '#00833C',
  desc:  'Open Box has identified potential value add here through discovery analysis. '
       + 'This is a recommendation, not agreed client scope, and is excluded from generated '
       + 'documents unless Proposed Scope is explicitly included.',
};

/** True when an item carries an Open Box proposal. */
export function isProposed(item) {
  return !!(item && item.proposed);
}

/** Tooltip for a proposal marker — appends the captured rationale when present. */
export function proposedTooltip(item) {
  const note = item && item.proposed_note;
  return note
    ? `${PROPOSED.label}\n\n${note}`
    : `${PROPOSED.label}\n\n${PROPOSED.desc}`;
}

/* ── Derived proposals (one hop across the links) ─────────────────────────────
   Flagging a value-stream card as Proposed implies the MRI PMX processes that
   would deliver it, and flagging a system process implies the value-stream
   cards it would serve. Rather than writing `proposed` onto the other side, the
   other side is DERIVED — for two reasons:

   1. Storing it would cascade. Propagation is bidirectional, so a stored flag
      would run business → system → every OTHER business card on that system
      item → their system items, and so on. System items carry 5.9 business
      links on average (max 16), so one click on the VAT card would transitively
      propose 35 business cards and 27 system items. Derivation reads only the
      DIRECT `proposed` flag, so it stops dead after one hop.
   2. A derived marker self-corrects when links change; a copied flag goes
      stale and has to be cleaned up by hand.

   Direct proposals carry the rationale and appear in the Proposals document;
   derived ones are shown hollow and nest under their origin. This mirrors how
   effectiveScope already derives auto out-of-scope from the same link set. */

let _derivedCache = null;

/** Rebuild the derived-proposal index. Renderers call this once per render. */
export function refreshDerivedProposals() {
  const bizItems = new Map();
  Object.entries(BUSINESS_DATA).forEach(([mod, cols]) => {
    const modLabel = (BUSINESS_CONFIG[mod] || {}).label || mod;
    cols.forEach(col => col.processes.forEach(p => {
      bizItems.set(p.id, { item: p, breadcrumb: col.title, moduleLabel: modLabel });
      (p.subs || []).forEach(s => bizItems.set(s.id,
        { item: s, breadcrumb: `${col.title} › ${p.title}`, moduleLabel: modLabel }));
    }));
  });

  const sysItems = new Map();
  Object.entries(ALL_DATA).forEach(([mod, cols]) => {
    const modLabel = (MODULE_CONFIG[mod] || {}).label || mod;
    cols.forEach(col => col.processes.forEach(p => {
      sysItems.set(p.id, { item: p, breadcrumb: col.title, moduleLabel: modLabel });
      (p.subs || []).forEach(s => sysItems.set(s.id,
        { item: s, breadcrumb: `${col.title} › ${p.title}`, moduleLabel: modLabel }));
    }));
  });

  const system = new Map();    // system id  → origins on the business side
  const business = new Map();  // business id → origins on the system side
  const add = (map, key, val) => {
    const arr = map.get(key);
    if (arr) { if (!arr.some(o => o.id === val.id)) arr.push(val); }
    else map.set(key, [val]);
  };

  // Derivation follows every link, proposed or agreed: a proposed link is
  // itself part of the recommendation, so it should carry the marker across.
  getLinks().forEach(l => {
    const b = bizItems.get(l.b);
    const s = sysItems.get(l.s);
    if (!b || !s) return;
    // Only the DIRECT flag is read — this is what keeps derivation to one hop.
    if (b.item.proposed) add(system, l.s,
      { id: l.b, title: b.item.title, breadcrumb: b.breadcrumb, moduleLabel: b.moduleLabel, note: b.item.proposed_note || '' });
    if (s.item.proposed) add(business, l.b,
      { id: l.s, title: s.item.title, breadcrumb: s.breadcrumb, moduleLabel: s.moduleLabel, note: s.item.proposed_note || '' });
  });

  _derivedCache = { system, business };
  return _derivedCache;
}

function derivedProposals() {
  return _derivedCache || refreshDerivedProposals();
}

/** Origins that make `id` a derived proposal, or null.
 *  `side` is the side `id` lives on: 'system' or 'business'. */
export function proposedVia(id, side) {
  const d = derivedProposals();
  const arr = (side === 'system' ? d.system : d.business).get(id);
  return arr && arr.length ? arr : null;
}

/** True when an item is proposed either directly or by derivation. */
export function isProposedOrDerived(item, side) {
  return isProposed(item) || !!proposedVia(item.id, side);
}

/** Tooltip for a derived (hollow) proposal marker, naming the origin(s). */
export function derivedTooltip(origins, side) {
  const other = side === 'system' ? 'value-stream process' : 'MRI PMX process';
  const lines = origins.map(o => `• ${o.moduleLabel} › ${o.title}`).join('\n');
  return `Linked to a proposed ${other}${origins.length > 1 ? 'es' : ''} — implied by:\n${lines}\n\n`
       + 'Open Box proposed the linked item; this one is shown as part of that proposal. '
       + 'Flag it directly if you want to make a separate case for it.';
}

/** The linked counterparts of a directly-proposed item, for document nesting. */
export function proposalCounterparts(id, side) {
  // side = the side `id` lives on; we want what it links TO on the other side.
  const d = derivedProposals();
  const out = [];
  const bizItems = side === 'business';
  getLinks().forEach(l => {
    if (bizItems && l.b === id) out.push({ otherId: l.s, proposedLink: !!l.proposed });
    if (!bizItems && l.s === id) out.push({ otherId: l.b, proposedLink: !!l.proposed });
  });
  return out;
}

/** Every proposed item across both views, for the Value-Add Proposals report.
 *  Returns [{ side, moduleKey, moduleLabel, breadcrumb, item, currentTag }]. */
export function collectProposals() {
  const out = [];

  Object.entries(BUSINESS_DATA).forEach(([modKey, cols]) => {
    const modLabel = (BUSINESS_CONFIG[modKey] || {}).label || modKey;
    cols.forEach(col => col.processes.forEach(proc => {
      if (isProposed(proc)) {
        out.push({ side: 'business', moduleKey: modKey, moduleLabel: modLabel,
                   breadcrumb: col.title, item: proc, currentTag: proc.coverage || null });
      }
      (proc.subs || []).forEach(sub => {
        if (isProposed(sub)) {
          out.push({ side: 'business', moduleKey: modKey, moduleLabel: modLabel,
                     breadcrumb: `${col.title} › ${proc.title}`, item: sub, currentTag: sub.coverage || null });
        }
      });
    }));
  });

  Object.entries(ALL_DATA).forEach(([modKey, cols]) => {
    const modLabel = (MODULE_CONFIG[modKey] || {}).label || modKey;
    cols.forEach(col => col.processes.forEach(proc => {
      if (isProposed(proc)) {
        out.push({ side: 'system', moduleKey: modKey, moduleLabel: modLabel,
                   breadcrumb: col.title, item: proc, currentTag: proc.scope || null });
      }
      (proc.subs || []).forEach(sub => {
        if (isProposed(sub)) {
          out.push({ side: 'system', moduleKey: modKey, moduleLabel: modLabel,
                     breadcrumb: `${col.title} › ${proc.title}`, item: sub, currentTag: sub.scope || null });
        }
      });
    }));
  });

  // Attach the linked counterparts on the other side so the document can nest
  // them under each proposal ("this is what it touches in PMX") instead of
  // giving derived items their own duplicate entries.
  out.forEach(p => {
    p.counterparts = proposalCounterparts(p.item.id, p.side)
      .map(c => {
        const r = p.side === 'business' ? resolveSystem(c.otherId) : resolveBusiness(c.otherId);
        return r ? { title: r.title, moduleLabel: r.moduleLabel, breadcrumb: r.breadcrumb, proposedLink: c.proposedLink } : null;
      })
      .filter(Boolean);
  });

  return out;
}

/**
 * Group-level mapping: value-stream L2 group id → MRI PMX system process ids.
 * Expanded to per-L3 links at load (every L3 card under a group links to the
 * listed system processes). First-pass coverage — refine per card via Edit
 * Links. Groups with no MRI PMX counterpart are intentionally omitted and show
 * as gaps in the Mapping view.
 */
const GROUP_LINKS = {
  // Lease to Cash → Commercial / Residential Management
  'vs-l2c-g1': ['cm-lease-setup', 'cm-lease-special', 'rm-leasing-prospects', 'rm-leasing-application', 'rm-leasing-execution'],
  'vs-l2c-g2': ['cm-lease-admin', 'cm-lease-setup'],
  'vs-l2c-g3': ['cm-billing-recurring', 'cm-cpi-escalations', 'rm-billing-charges'],
  // NOTE: value-stream group ids are POSITIONAL (`${vs.id}-g${index+1}`), so
  // inserting a group renumbers every group after it. "Retail Turnover &
  // Trading Performance" was inserted at position 4, which shifted the four
  // groups below up by one — their link keys were remapped to match.
  'vs-l2c-g4': [],   // Retail Turnover & Trading Performance — see CARD_LINKS
  'vs-l2c-g5': ['cm-recov-service', 'cm-recov-setup', 'cm-recov-recon'],
  'vs-l2c-g6': ['cm-cash-receipts', 'cm-cash-recon', 'cm-billing-adjustments', 'rm-billing-receipts', 'rm-billing-delinquency'],
  'vs-l2c-g7': ['cm-billing-advanced', 'cm-income-mapping', 'gl-journals-operational'],
  'vs-l2c-g8': ['cm-lease-admin', 'rm-residents-renewal', 'rm-residents-moveout'],

  // Quote to Cash → Corporate Accounts Receivable
  'vs-q2c-g1': ['car-acct-setup', 'car-acct-tracking'],
  'vs-q2c-g2': ['car-charges-categories'],
  'vs-q2c-g3': ['car-charges-onetime', 'car-charges-credits', 'car-charges-journals', 'car-vat-charges'],
  'vs-q2c-g4': ['car-charges-journals', 'car-integration-gl'],
  'vs-q2c-g5': ['car-payments-receipts', 'car-payments-allocation', 'car-reporting-aged', 'car-close-statements'],

  // Acquire to Retire → Investment Accounting (structure/investor) + Fixed Asset
  // Accounting (asset lifecycle) + GL (entity, journals).
  'vs-a2r-g1': ['ia-structure-portfolio', 'ia-investor-setup'],
  'vs-a2r-g2': ['ia-structure-legal'],
  'vs-a2r-g3': ['gl-framework-entity', 'ia-structure-portfolio', 'faa-acquisition-create'],
  'vs-a2r-g4': ['gl-framework-entity', 'gl-framework-coa', 'faa-acquisition-policy', 'faa-acquisition-create', 'faa-register-structure'],
  'vs-a2r-g5': ['faa-register-identify', 'faa-depreciation-posting', 'faa-lifecycle-transfers', 'faa-lifecycle-adjust', 'ia-investor-reporting-statements'],
  'vs-a2r-g6': ['gl-journals-operational', 'faa-disposals-main', 'faa-lifecycle-adjust'],

  // Plan to Perform → Budgeting & Forecasting + GL
  'vs-p2p-plan-g1': ['bf-process-ownership', 'bf-structure-versions', 'ia-structure-portfolio'],
  'vs-p2p-plan-g2': ['bf-creation-create', 'bf-creation-reforecast', 'bf-assumptions-income', 'bf-assumptions-expense', 'gl-budgets-planning', 'gl-budgets-revision'],
  'vs-p2p-plan-g3': ['bf-variance-budgetactual', 'bf-reporting-board', 'gl-reporting-management', 'ia-investor-reporting-metrics'],

  // Source to Pay → Accounts Payable (+ RM vendor)
  'vs-s2p-g1': ['ap_sup_main', 'rm-vendor-onboarding'],
  'vs-s2p-g2': ['ap_inv_main', 'ap_commit_main', 'ap_pay_main', 'rm-vendor-invoices', 'rm-vendor-expense'],
  'vs-s2p-g3': ['ap_inv_main', 'cm-recov-setup'],

  // Project to Result → Job Cost
  'vs-p2r-g1': ['jc-setup-config', 'jc-jobs-manage'],
  'vs-p2r-g2': ['jc-jobs-manage', 'jc-budgets-control', 'jc-contracts-lifecycle', 'jc-payments-draws'],
  'vs-p2r-g3': ['jc-payments-draws', 'jc-reporting-reports', 'gl-framework-coa', 'faa-acquisition-create'],

  // Record to Report → General Ledger (+ sub-ledger closes / reporting)
  'vs-r2r-g1': ['gl-journals-operational', 'gl-journals-subledger'],
  'vs-r2r-g2': ['gl-journals-operational', 'gl-reporting-management'],
  'vs-r2r-g3': ['gl-close-period', 'gl-close-year', 'rm-close-period', 'car-close-period', 'ia-consolidation-eliminations', 'ia-reporting-consol-statements', 'ia-scheduling-main'],
  'vs-r2r-g4': ['gl-reporting-management', 'gl-reporting-schedule', 'rm-close-reporting', 'car-reporting-compliance', 'ia-reporting-consol-statements', 'ia-investor-reporting-statements', 'ia-investor-reporting-metrics'],

  // Treasury & Debt → GL bank/cash + AP bank rec + IA capital (capital raising)
  'vs-tdm-g1': ['ap_recon_bank', 'cm-cash-receipts', 'gl-bank-setup', 'gl-bank-recon'],
  'vs-tdm-g2': ['ia-investor-capital', 'ia-investor-setup', 'gl-recurring-allocations'],
  // vs-tdm-g3 (Risk & Hedging) has no MRI PMX counterpart — gap.

  // Property & Facilities Operations → Residential ops + CM space
  'vs-pfo-g1': ['rm-residents-admin', 'rm-maintenance-requests'],
  'vs-pfo-g2': ['rm-maintenance-requests', 'rm-maintenance-makeready'],
  'vs-pfo-g3': ['cm-building-suites'],
  // vs-pfo-g4 (ESG) and vs-h2r (HR) have no MRI PMX counterpart — gaps.
};

/**
 * Card-level links: business L3 card id → MRI PMX system process ids.
 * Additive to GROUP_LINKS, for the rare card whose system counterpart is
 * more specific than the rest of its group shares (so the whole group
 * doesn't get over-linked to a screen only one card actually uses).
 */
const CARD_LINKS = {
  // Record to Report › Financial, Regulatory & Investor Reporting
  'vs-r2r-g4-p6': ['gl-vat-setup', 'gl-vat-mapping', 'gl-vat-mtd'], // VAT / MTD compliance

  // Lease to Cash › Rent Billing & Recurring Charges (retail)
  'vs-l2c-g3-p3': ['cm-retail-percentage', 'cm-retail-percentage-calc'], // Percentage rent (retail)
  'vs-l2c-g3-p4': ['cm-retail-departments'],                            // Retail sales departments
  'vs-l2c-g3-p5': ['cm-retail-sales'],                                  // Retail sales capture & estimation
  'vs-l2c-g3-p6': ['cm-retail-categories', 'cm-retail-reporting'],      // Retail category hierarchy & reporting

  // Lease to Cash › Retail Turnover & Trading Performance (AR-010 to AR-090).
  // Card-level rather than group-level: these are distinct business processes
  // whose system counterparts differ card by card, and several have no direct
  // MRI PMX counterpart at all (governance, tenant mix, deal negotiation) —
  // group-level links would over-link the whole set to retail screens.
  'vs-l2c-g4-p2': ['cm-retail-categories', 'cm-setup-lookups'],         // Tenant mix, zoning & category management
  'vs-l2c-g4-p3': ['cm-retail-percentage', 'cm-retail-percentage-breakpoints'], // Lease structuring & turnover determination
  'vs-l2c-g4-p4': ['cm-retail-percentage-reporting', 'cm-retail-departments'],  // Turnover base & exclusions
  'vs-l2c-g4-p5': ['cm-retail-sales', 'cm-retail-sales-batch'],         // Turnover certificate & audit compliance
  'vs-l2c-g4-p6': ['cm-lease-setup'],                                   // Franchise, guarantor & co-tenancy
  'vs-l2c-g4-p7': ['cm-retail-departments', 'cm-lease-special'],        // Special tenant category leasing
  'vs-l2c-g4-p8': ['cm-retail-reporting', 'cm-retail-categories'],      // Trading performance reporting
  'vs-l2c-g4-p9': ['cm-lease-admin', 'cm-retail-percentage-calc'],      // Retail renewal & turnover repricing
  // vs-l2c-g4-p1 (Retail leasing governance) has no MRI PMX counterpart —
  // it is an organisational control, left as a deliberate gap.
};

/** Find a business column (L2 group) by id across all value streams. */
function businessGroup(groupId) {
  for (const mod of BUSINESS_MODULES) {
    const col = BUSINESS_DATA[mod].find(c => c.id === groupId);
    if (col) return col;
  }
  return null;
}

/** Expand GROUP_LINKS to per-L3 business↔system pairs, then layer on CARD_LINKS. */
function buildSeedLinks() {
  const out = [];
  Object.entries(GROUP_LINKS).forEach(([groupId, sysIds]) => {
    const col = businessGroup(groupId);
    if (!col) return;
    col.processes.forEach(card => sysIds.forEach(s => out.push({ b: card.id, s })));
  });
  Object.entries(CARD_LINKS).forEach(([cardId, sysIds]) => {
    sysIds.forEach(s => out.push({ b: cardId, s }));
  });
  return out;
}

/** @type {{b: string, s: string}[]}  seed template — business L3 id ⇄ system id */
export const SEED_LINKS = buildSeedLinks();

// ── Mutable per-version store ───────────────────────────────────────────────

/** Seed the editable store from SEED_LINKS (coverage defaults to 'full'). */
export function seedLinks() {
  return SEED_LINKS.map(l => ({ b: l.b, s: l.s, coverage: 'full', note: '' }));
}

/** Initialise state.links from the seed if it hasn't been populated yet. */
export function initLinks() {
  if (!Array.isArray(state.links) || state.links.length === 0) {
    state.links = seedLinks();
  }
}

/** The active (editable) link set. */
export function getLinks() {
  return Array.isArray(state.links) ? state.links : [];
}

function findLinkIndex(b, s) {
  return getLinks().findIndex(l => l.b === b && l.s === s);
}

/* Proposed links are Open Box recommendations, not the client's current reality,
   so they are excluded from both helpers below. Counting them would let adding a
   proposal silently pull a system item out of "auto out of scope" and silence the
   "⚠ link needed" warning — i.e. a suggestion would masquerade as agreed scope. */

/** Set of system-process ids that currently have ≥1 AGREED business link. */
export function linkedSystemIds() {
  return new Set(getLinks().filter(l => !l.proposed).map(l => l.s));
}

/** True if a business (value-stream) item has ≥1 agreed link to a system process. */
export function businessHasLink(businessId) {
  return getLinks().some(l => l.b === businessId && !l.proposed);
}

/** True if a business item has ≥1 PROPOSED link (used to render the gap answer). */
export function businessHasProposedLink(businessId) {
  return getLinks().some(l => l.b === businessId && l.proposed);
}

/** Add a link (no-op if it already exists). Returns true if added.
 *  `proposed` marks the link itself as an Open Box recommendation — a mapping
 *  that does NOT exist in the client's world today but which we are proposing.
 *  This is how a taxonomy gap becomes "here is what we would do about it". */
export function addLink(b, s, coverage = 'full', note = '', proposed = false) {
  if (findLinkIndex(b, s) !== -1) return false;
  const link = { b, s, coverage, note };
  if (proposed) link.proposed = true;
  getLinks().push(link);
  return true;
}

/** Toggle a link's proposed flag. Returns the new value, or null if not found. */
export function toggleLinkProposed(b, s) {
  const l = getLinks().find(x => x.b === b && x.s === s);
  if (!l) return null;
  if (l.proposed) delete l.proposed;
  else l.proposed = true;
  return !!l.proposed;
}

/** Remove a link. Returns true if one was removed. */
export function removeLink(b, s) {
  const i = findLinkIndex(b, s);
  if (i === -1) return false;
  getLinks().splice(i, 1);
  return true;
}

/** Set a link's coverage status. */
export function setLinkCoverage(b, s, coverage) {
  const l = getLinks().find(x => x.b === b && x.s === s);
  if (l) l.coverage = coverage;
}

/** Set a link's free-text note. */
export function setLinkNote(b, s, note) {
  const l = getLinks().find(x => x.b === b && x.s === s);
  if (l) l.note = note;
}

/** Every system process/sub id currently present across all modules. */
function allSystemIds() {
  const ids = new Set();
  Object.values(ALL_DATA).forEach(mod => mod.forEach(col => col.processes.forEach(p => {
    ids.add(p.id); (p.subs || []).forEach(s => ids.add(s.id));
  })));
  return ids;
}

/** Every business (value-stream) process/sub id currently present. */
function allBusinessIds() {
  const ids = new Set();
  Object.values(BUSINESS_DATA).forEach(mod => mod.forEach(col => col.processes.forEach(p => {
    ids.add(p.id); (p.subs || []).forEach(s => ids.add(s.id));
  })));
  return ids;
}

/** Drop links whose endpoints no longer exist — e.g. after a module reset has
 *  removed custom items that had been linked. Returns the number removed. */
export function pruneDanglingLinks() {
  const sys = allSystemIds();
  const bus = allBusinessIds();
  const kept = getLinks().filter(l => sys.has(l.s) && bus.has(l.b));
  const removed = getLinks().length - kept.length;
  if (removed) state.links = kept;
  return removed;
}

// ── Resolvers ─────────────────────────────────────────────────────────────────

/** Resolve a system item id to display metadata, searching every module. */
function resolveSystem(id) {
  for (const mod of Object.keys(ALL_DATA)) {
    for (const col of ALL_DATA[mod]) {
      for (const proc of col.processes) {
        if (proc.id === id) {
          return { id, view: 'system', module: mod, moduleLabel: MODULE_CONFIG[mod]?.label || mod,
                   title: proc.title, breadcrumb: col.title };
        }
        for (const sub of (proc.subs || [])) {
          if (sub.id === id) {
            return { id, view: 'system', module: mod, moduleLabel: MODULE_CONFIG[mod]?.label || mod,
                     title: sub.title, breadcrumb: `${col.title} › ${proc.title}` };
          }
        }
      }
    }
  }
  return null;
}

/** Resolve a business item id to display metadata (incl. its coverage tag). */
function resolveBusiness(id) {
  const f = findBusinessItem(id);
  if (!f) return null;
  return { id, view: 'business', module: f.module, moduleLabel: BUSINESS_CONFIG[f.module]?.label || f.module,
           title: f.item.title, breadcrumb: f.breadcrumb, coverage: f.item.coverage || null };
}

/** System processes that deliver a given business item. */
export function systemLinksFor(businessId) {
  return getLinks().filter(l => l.b === businessId)
    .map(l => resolveSystem(l.s))
    .filter(Boolean);
}

/** Business processes supported by a given system item (incl. item coverage). */
export function businessLinksFor(systemId) {
  return getLinks().filter(l => l.s === systemId)
    .map(l => resolveBusiness(l.b))
    .filter(Boolean);
}

/** The module a system item belongs to (for tab switching on navigation). */
export function systemItemModule(id) {
  const r = resolveSystem(id);
  return r ? r.module : null;
}

/** The business domain (column) a business item belongs to. */
function businessDomainOf(bid) {
  for (const mod of BUSINESS_MODULES) {
    for (const col of BUSINESS_DATA[mod]) {
      for (const proc of col.processes) {
        if (proc.id === bid) return { module: mod, domainId: col.id, domainTitle: col.title };
        for (const sub of (proc.subs || [])) {
          if (sub.id === bid) return { module: mod, domainId: col.id, domainTitle: col.title };
        }
      }
    }
  }
  return null;
}

/** Every link, fully resolved (business side incl. its domain + system side). */
export function allResolvedLinks() {
  return getLinks().map(l => {
    const b = resolveBusiness(l.b);
    const s = resolveSystem(l.s);
    if (!b || !s) return null;
    return { b: { ...b, domain: businessDomainOf(l.b) }, s, coverage: b.coverage, proposed: !!l.proposed };
  }).filter(Boolean);
}

/**
 * Mapping-matrix model: business domains (rows, grouped by business module) ×
 * system modules (columns). Each cell carries the resolved link pairs and a
 * count; domains with no links at all are flagged as gaps.
 */
export function buildMappingMatrix() {
  const systemModules = Object.keys(ALL_DATA).map(m => ({ id: m, label: MODULE_CONFIG[m]?.label || m }));
  const resolved = allResolvedLinks();

  const rows = [];
  for (const mod of BUSINESS_MODULES) {
    for (const col of BUSINESS_DATA[mod]) {
      const cells = {};
      systemModules.forEach(sm => { cells[sm.id] = []; });
      let total = 0;
      resolved.forEach(r => {
        if (r.b.domain && r.b.domain.domainId === col.id && cells[r.s.module]) {
          cells[r.s.module].push(r);
          total++;
        }
      });
      rows.push({
        module: mod,
        moduleLabel: BUSINESS_CONFIG[mod]?.label || mod,
        domainId: col.id,
        domainTitle: col.title,
        cells,
        total,
        gap: total === 0,
      });
    }
  }
  return { systemModules, rows };
}

/** The resolved link pairs in one matrix cell (business domain × system module). */
export function cellPairs(domainId, systemModule) {
  return allResolvedLinks().filter(r =>
    r.b.domain && r.b.domain.domainId === domainId && r.s.module === systemModule);
}
