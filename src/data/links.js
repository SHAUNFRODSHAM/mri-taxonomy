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

/** @type {{b: string, s: string}[]}  seed template — business id ⇄ system id */
export const SEED_LINKS = [
  // ── GL Setup → Financial Structure & Entity Governance ──
  { b: 'bgl-setup-es1',  s: 'gl-framework-entity' },
  { b: 'bgl-setup-es2',  s: 'gl-framework-entity' },
  { b: 'bgl-setup-es3',  s: 'gl-framework-entity' },
  { b: 'bgl-setup-es4',  s: 'gl-framework-entity' },
  { b: 'bgl-setup-es5',  s: 'gl-journals-subledger' },
  { b: 'bgl-setup-coa1', s: 'gl-framework-coa' },
  { b: 'bgl-setup-coa2', s: 'gl-framework-coa' },
  { b: 'bgl-setup-coa3', s: 'gl-framework-coa' },
  { b: 'bgl-setup-coa4', s: 'gl-framework-coa' },
  { b: 'bgl-setup-coa5', s: 'gl-framework-coa' },
  { b: 'bgl-setup-ff1',  s: 'gl-framework-coa-formats' },
  { b: 'bgl-setup-ff2',  s: 'gl-framework-coa-formats' },
  { b: 'bgl-setup-ff2',  s: 'gl-reporting-management' },
  { b: 'bgl-setup-ff3',  s: 'gl-reporting-management' },

  // ── GL Journals → Journal Entry & Period Accounting ──
  { b: 'bgl-journals-je1', s: 'gl-journals-operational' },
  { b: 'bgl-journals-je2', s: 'gl-journals-recurring' },
  { b: 'bgl-journals-je3', s: 'gl-journals-operational' },
  { b: 'bgl-journals-je4', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ac1', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ac2', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ac3', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ac4', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ac5', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ic1', s: 'gl-journals-operational' },
  { b: 'bgl-journals-ic1', s: 'gl-framework-entity' },
  { b: 'bgl-journals-fa1', s: 'gl-journals-operational' },
  { b: 'bgl-journals-fa2', s: 'gl-journals-operational' },
  { b: 'bgl-journals-fa3', s: 'gl-journals-operational' },

  // ── GL Sub-Ledger Integration → Sub-Ledger Integration & Reconciliation ──
  { b: 'bgl-subledger-ap1',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ap2',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ap3',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ap4',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ar1',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ar2',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ar3',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ar4',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-fas1', s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-fas2', s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-fas3', s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ls1',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ls2',  s: 'gl-journals-subledger' },
  { b: 'bgl-subledger-ls3',  s: 'gl-journals-subledger' },

  // ── GL Budgeting → Budget Planning & Financial Control ──
  { b: 'bgl-budget-bm1', s: 'gl-budgets-planning' },
  { b: 'bgl-budget-bm2', s: 'gl-budgets-variance' },
  { b: 'bgl-budget-bm3', s: 'gl-budgets-planning' },
  { b: 'bgl-budget-bm4', s: 'gl-budgets-planning' },
  { b: 'bgl-budget-fc1', s: 'gl-budgets-revision' },
  { b: 'bgl-budget-fc2', s: 'gl-budgets-revision' },
  { b: 'bgl-budget-al1', s: 'gl-journals-operational' },
  { b: 'bgl-budget-al2', s: 'gl-journals-operational' },
  { b: 'bgl-budget-al3', s: 'gl-journals-operational' },

  // ── GL Close → Financial Close Management ──
  { b: 'bgl-close-cp1', s: 'gl-close-period' },
  { b: 'bgl-close-cp2', s: 'gl-close-period' },
  { b: 'bgl-close-cp3', s: 'gl-close-period' },
  { b: 'bgl-close-cp4', s: 'gl-close-period' },
  { b: 'bgl-close-sc1', s: 'gl-close-period' },
  { b: 'bgl-close-sc1', s: 'gl-journals-subledger' },
  { b: 'bgl-close-sc2', s: 'gl-close-period' },
  { b: 'bgl-close-ye1', s: 'gl-close-year' },
  { b: 'bgl-close-ye2', s: 'gl-close-year-audit' },
  { b: 'bgl-close-ye3', s: 'gl-close-year' },

  // ── GL Reporting → Financial Reporting & Analysis ──
  { b: 'bgl-reporting-fr1', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-fr2', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-fr3', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-fr4', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-ir1', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-ir2', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-ir3', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-sr1', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-sr2', s: 'gl-reporting-management' },
  { b: 'bgl-reporting-sr3', s: 'gl-reporting-management' },

  // ── GL Compliance → controls / close / reporting ──
  { b: 'bgl-compliance-ic1', s: 'gl-journals-operational' },
  { b: 'bgl-compliance-ic2', s: 'gl-close-period' },
  { b: 'bgl-compliance-ic3', s: 'gl-close-period' },
  { b: 'bgl-compliance-ic4', s: 'gl-framework-entity' },
  { b: 'bgl-compliance-rr1', s: 'gl-reporting-management' },
  { b: 'bgl-compliance-rr2', s: 'gl-reporting-management' },
  { b: 'bgl-compliance-rr3', s: 'gl-reporting-management' },
  { b: 'bgl-compliance-am1', s: 'gl-close-year-audit' },
  { b: 'bgl-compliance-am2', s: 'gl-close-year-audit' },
  { b: 'bgl-compliance-am3', s: 'gl-reporting-schedule' },
];

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
