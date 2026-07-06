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
  full:    { label: 'Fully in system', short: 'Full',    color: '#5a7a1e' },
  partial: { label: 'Partial — touches part of the process', short: 'Partial', color: '#b8860b' },
  outside: { label: 'Outside system — managed manually', short: 'Outside', color: '#8a8a8a' },
};
export const COVERAGE_ORDER = ['full', 'partial', 'outside'];

/**
 * Group-level mapping: value-stream L2 group id → MRI PMX system process ids.
 * Expanded to per-L3 links at load (every L3 card under a group links to the
 * listed system processes). First-pass coverage — refine per card via Edit
 * Links. Groups with no MRI PMX counterpart are intentionally omitted and show
 * as gaps in the Mapping view.
 */
const GROUP_LINKS = {
  // Lease to Cash → Commercial / Residential Management
  'vs-l2c-g1': ['cm-lease-origination', 'cm-onboard-prospecting', 'cm-onboard-application', 'rm-leasing-prospects', 'rm-leasing-application', 'rm-leasing-execution'],
  'vs-l2c-g2': ['cm-lease-admin', 'cm-lease-abstraction', 'cm-lease-docs'],
  'vs-l2c-g3': ['cm-billing-recurring', 'cm-billing-bulk', 'cm-billing-cpi', 'rm-billing-charges'],
  'vs-l2c-g4': ['cm-recov-service-charge', 'cm-recov-method', 'cm-recov-apportionment', 'cm-recov-bulk'],
  'vs-l2c-g5': ['cm-coll-receipts', 'cm-coll-allocation', 'cm-coll-arrears', 'cm-coll-bad-debt', 'rm-billing-receipts', 'rm-billing-delinquency'],
  'vs-l2c-g6': ['cm-lease-billing-config', 'cm-inc-accounting', 'gl-journals-operational'],
  'vs-l2c-g7': ['cm-lease-renewal', 'cm-lease-termination', 'cm-lease-vacating', 'rm-residents-renewal', 'rm-residents-moveout'],

  // Quote to Cash → Corporate Accounts Receivable
  'vs-q2c-g1': ['car-acct-setup', 'car-acct-tracking'],
  'vs-q2c-g2': ['car-charges-categories'],
  'vs-q2c-g3': ['car-charges-onetime', 'car-charges-credits', 'car-charges-journals', 'car-vat-charges'],
  'vs-q2c-g4': ['car-charges-journals', 'car-integration-gl'],
  'vs-q2c-g5': ['car-payments-receipts', 'car-payments-allocation', 'car-reporting-aged', 'car-close-statements'],

  // Acquire to Retire → limited GL touchpoints (no investment / fixed-asset module)
  'vs-a2r-g4': ['gl-framework-entity', 'gl-framework-coa'],
  'vs-a2r-g6': ['gl-journals-operational'],

  // Plan to Perform → Budgeting & Forecasting + GL
  'vs-p2p-plan-g1': ['bf-process-ownership', 'bf-structure-versions'],
  'vs-p2p-plan-g2': ['bf-creation-create', 'bf-creation-reforecast', 'bf-assumptions-income', 'bf-assumptions-expense', 'gl-budgets-planning', 'gl-budgets-revision'],
  'vs-p2p-plan-g3': ['bf-variance-budgetactual', 'bf-reporting-board', 'gl-reporting-management'],

  // Source to Pay → Accounts Payable (+ RM vendor)
  'vs-s2p-g1': ['ap_sup_main', 'rm-vendor-onboarding'],
  'vs-s2p-g2': ['ap_inv_main', 'ap_commit_main', 'ap_pay_main', 'rm-vendor-invoices', 'rm-vendor-expense'],
  'vs-s2p-g3': ['ap_inv_main', 'cm-recov-municipal', 'cm-recov-insurance'],

  // Project to Result → Job Cost
  'vs-p2r-g1': ['jc-setup-config', 'jc-jobs-manage'],
  'vs-p2r-g2': ['jc-jobs-manage', 'jc-budgets-control', 'jc-contracts-lifecycle', 'jc-payments-draws'],
  'vs-p2r-g3': ['jc-payments-draws', 'jc-reporting-reports', 'gl-framework-coa'],

  // Record to Report → General Ledger (+ sub-ledger closes / reporting)
  'vs-r2r-g1': ['gl-journals-operational', 'gl-journals-subledger'],
  'vs-r2r-g2': ['gl-journals-operational', 'gl-reporting-management'],
  'vs-r2r-g3': ['gl-close-period', 'gl-close-year', 'rm-close-period', 'car-close-period'],
  'vs-r2r-g4': ['gl-reporting-management', 'gl-reporting-schedule', 'rm-close-reporting', 'car-reporting-compliance'],

  // Treasury & Debt → limited AP / bank touchpoints (no treasury module)
  'vs-tdm-g1': ['ap_recon_bank', 'cm-coll-receipts'],

  // Property & Facilities Operations → Residential ops + CM space
  'vs-pfo-g1': ['rm-residents-admin', 'rm-maintenance-requests'],
  'vs-pfo-g2': ['rm-maintenance-requests', 'rm-maintenance-makeready'],
  'vs-pfo-g3': ['cm-lease-suite', 'cm-billing-vacancy'],
  // vs-pfo-g4 (ESG) and vs-h2r (HR) have no MRI PMX counterpart — gaps.
};

/** Find a business column (L2 group) by id across all value streams. */
function businessGroup(groupId) {
  for (const mod of BUSINESS_MODULES) {
    const col = BUSINESS_DATA[mod].find(c => c.id === groupId);
    if (col) return col;
  }
  return null;
}

/** Expand GROUP_LINKS to per-L3 business↔system pairs. */
function buildSeedLinks() {
  const out = [];
  Object.entries(GROUP_LINKS).forEach(([groupId, sysIds]) => {
    const col = businessGroup(groupId);
    if (!col) return;
    col.processes.forEach(card => sysIds.forEach(s => out.push({ b: card.id, s })));
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

/** Set of system-process ids that currently have ≥1 business (value-stream) link. */
export function linkedSystemIds() {
  return new Set(getLinks().map(l => l.s));
}

/** Add a link (no-op if it already exists). Returns true if added. */
export function addLink(b, s, coverage = 'full', note = '') {
  if (findLinkIndex(b, s) !== -1) return false;
  getLinks().push({ b, s, coverage, note });
  return true;
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

/** Resolve a business item id to display metadata. */
function resolveBusiness(id) {
  const f = findBusinessItem(id);
  if (!f) return null;
  return { id, view: 'business', module: f.module, moduleLabel: BUSINESS_CONFIG[f.module]?.label || f.module,
           title: f.item.title, breadcrumb: f.breadcrumb };
}

/** System processes that deliver a given business item (with coverage). */
export function systemLinksFor(businessId) {
  return getLinks().filter(l => l.b === businessId)
    .map(l => { const r = resolveSystem(l.s); return r ? { ...r, coverage: l.coverage, note: l.note } : null; })
    .filter(Boolean);
}

/** Business processes supported by a given system item (with coverage). */
export function businessLinksFor(systemId) {
  return getLinks().filter(l => l.s === systemId)
    .map(l => { const r = resolveBusiness(l.b); return r ? { ...r, coverage: l.coverage, note: l.note } : null; })
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
    return { b: { ...b, domain: businessDomainOf(l.b) }, s, coverage: l.coverage, note: l.note };
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
