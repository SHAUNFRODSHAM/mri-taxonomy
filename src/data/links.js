/* ═══════════════════════════════════════════════════════════════════════════
   links.js — Business ⇄ System (MRI PMX) link registry

   Single source of truth for how a business process ties into the system
   processes that deliver it. Each entry pairs a Business item id with a System
   item id; the reverse direction is computed at runtime, so links are only
   maintained in one place.

   Phase 2 seeds the General Ledger (bgl ⇄ gl) mappings. Other modules are added
   as their content is curated. Many-to-many is expected: several business
   processes can be delivered by the same system process, and vice-versa.

   ids:  business → b<mod>-<domain>-<rawId>   (see data/business/index.js)
         system   → <module>-<area>-<topic>   (see data/<module>.js)
   ═══════════════════════════════════════════════════════════════════════════ */

import { ALL_DATA, MODULE_CONFIG } from './index.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, findBusinessItem } from './business/index.js';

/** @type {{b: string, s: string}[]}  business id ⇄ system id */
export const LINKS = [
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

/** System processes that deliver a given business item. */
export function systemLinksFor(businessId) {
  return LINKS.filter(l => l.b === businessId).map(l => resolveSystem(l.s)).filter(Boolean);
}

/** Business processes supported by a given system item. */
export function businessLinksFor(systemId) {
  return LINKS.filter(l => l.s === systemId).map(l => resolveBusiness(l.b)).filter(Boolean);
}

/** The module a system item belongs to (for tab switching on navigation). */
export function systemItemModule(id) {
  const r = resolveSystem(id);
  return r ? r.module : null;
}
